import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types/hono";

const messages = new Hono<AppEnv>();

messages.use("*", authMiddleware);

messages.get("/:channelId", async (c) => {
  const userId = c.get("userId");
  const channelId = c.req.param("channelId");
  const limit = Number(c.req.query("limit") || "50");
  const before = c.req.query("before");

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) {
    return c.json({ error: "Channel not found" }, 404);
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId: channel.workspaceId },
    },
  });

  if (!membership) {
    return c.json({ error: "Not a member of this workspace" }, 403);
  }

  const messageList = await prisma.message.findMany({
    where: {
      channelId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });

  return c.json({ messages: messageList.reverse() });
});

export default messages;
