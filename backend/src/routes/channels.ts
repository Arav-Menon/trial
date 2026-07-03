import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createChannelSchema } from "../schemas/channel";
import type { AppEnv } from "../types/hono";

const channels = new Hono<AppEnv>();

channels.use("*", authMiddleware);

channels.get("/:workspaceId", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("workspaceId")!;

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member of this workspace" }, 403);
  }

  const channelList = await prisma.channel.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return c.json({ channels: channelList });
});

channels.post("/:workspaceId", validate(createChannelSchema), async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("workspaceId")!;
  const { name } = c.get("validatedBody");

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return c.json({ error: "Not a member of this workspace" }, 403);
  }

  const existing = await prisma.channel.findFirst({
    where: { name, workspaceId },
  });

  if (existing) {
    return c.json({ error: "Channel already exists" }, 409);
  }

  const channel = await prisma.channel.create({
    data: { name, workspaceId },
  });

  return c.json({ channel }, 201);
});

channels.delete("/:channelId", async (c) => {
  const userId = c.get("userId");
  const channelId = c.req.param("channelId");

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) {
    return c.json({ error: "Channel not found" }, 404);
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: channel.workspaceId } },
  });

  if (!membership || membership.role !== "owner") {
    return c.json({ error: "Only workspace owners can delete channels" }, 403);
  }

  await prisma.channel.delete({ where: { id: channelId } });

  return c.json({ success: true });
});

export default channels;
