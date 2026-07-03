import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createWorkspaceSchema } from "../schemas/workspace";
import type { AppEnv } from "../types/hono";

const workspaces = new Hono<AppEnv>();

workspaces.use("*", authMiddleware);

workspaces.get("/", async (c) => {
  const userId = c.get("userId");

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "desc" },
  });

  const result = memberships.map((m: (typeof memberships)[number]) => ({
    ...m.workspace,
    role: m.role,
  }));

  return c.json({ workspaces: result });
});

workspaces.post("/", validate(createWorkspaceSchema), async (c) => {
  const userId = c.get("userId");
  const { name } = c.get("validatedBody");

  const workspace = await prisma.workspace.create({
    data: {
      name,
      members: {
        create: { userId, role: "owner" },
      },
    },
    include: { members: true },
  });

  return c.json({ workspace }, 201);
});

workspaces.post("/:id/join", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (existing) {
    return c.json({ error: "Already a member" }, 409);
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }

  const member = await prisma.workspaceMember.create({
    data: { userId, workspaceId, role: "member" },
  });

  return c.json({ member });
});

workspaces.post("/:id/leave", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member" }, 404);
  }

  if (membership.role === "owner") {
    return c.json({ error: "Owner cannot leave workspace" }, 400);
  }

  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  return c.json({ success: true });
});

workspaces.get("/:id", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member" }, 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      channels: true,
    },
  });

  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }

  return c.json({ workspace });
});

workspaces.post("/:id/invite", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");
  const body = await c.req.json();
  const query = body.query as string;

  if (!query || query.trim().length < 1) {
    return c.json({ error: "Search query is required" }, 400);
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member" }, 403);
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: userId } },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
    take: 10,
  });

  return c.json({ users });
});

workspaces.post("/:id/members", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");
  const body = await c.req.json();
  const inviteUserId = body.userId as string;

  if (!inviteUserId) {
    return c.json({ error: "userId is required" }, 400);
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member" }, 403);
  }

  const invitee = await prisma.user.findUnique({ where: { id: inviteUserId } });
  if (!invitee) {
    return c.json({ error: "User not found" }, 404);
  }

  const existingMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: inviteUserId, workspaceId } },
  });

  if (existingMember) {
    return c.json({ error: "User is already a member" }, 409);
  }

  const member = await prisma.workspaceMember.create({
    data: { userId: inviteUserId, workspaceId, role: "member" },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return c.json({ member }, 201);
});

workspaces.delete("/:id/members/:memberId", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");
  const memberId = c.req.param("memberId");

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership || membership.role !== "owner") {
    return c.json({ error: "Only workspace owners can remove members" }, 403);
  }

  if (memberId === userId) {
    return c.json({ error: "Cannot remove yourself" }, 400);
  }

  const memberToRemove = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!memberToRemove || memberToRemove.workspaceId !== workspaceId) {
    return c.json({ error: "Member not found" }, 404);
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  return c.json({ success: true });
});

export default workspaces;
