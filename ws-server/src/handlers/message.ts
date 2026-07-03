import type { AuthenticatedSocket, ServerMessage } from "../types";
import { getPrisma } from "../lib/prisma";
import { broadcastToChannel } from "../store/presence";

export async function handleSendMessage(socket: AuthenticatedSocket, channelId: string, content: string) {
  if (!socket.userId) {
    const response: ServerMessage = { type: "error", message: "Not authenticated" };
    socket.send(JSON.stringify(response));
    return;
  }

  if (!content || content.trim().length === 0) {
    const response: ServerMessage = { type: "error", message: "Message content cannot be empty" };
    socket.send(JSON.stringify(response));
    return;
  }

  const channel = await getPrisma().channel.findUnique({ where: { id: channelId } });
  if (!channel) {
    const response: ServerMessage = { type: "error", message: "Channel not found" };
    socket.send(JSON.stringify(response));
    return;
  }

  const message = await getPrisma().message.create({
    data: {
      content: content.trim(),
      userId: socket.userId,
      channelId,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const messageResponse: ServerMessage = {
    type: "new_message",
    channelId,
    message,
  };

  broadcastToChannel(channelId, messageResponse);
}
