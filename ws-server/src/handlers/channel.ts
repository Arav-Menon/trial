import type { AuthenticatedSocket, ServerMessage } from "../types";
import { getPrisma } from "../lib/prisma";
import { addSocketToChannel, getChannelUsers, broadcastToChannel } from "../store/presence";

export async function handleJoinChannel(socket: AuthenticatedSocket, channelId: string) {
  if (!socket.userId) {
    const response: ServerMessage = { type: "error", message: "Not authenticated" };
    socket.send(JSON.stringify(response));
    return;
  }

  const channel = await getPrisma().channel.findUnique({ where: { id: channelId } });
  if (!channel) {
    const response: ServerMessage = { type: "error", message: "Channel not found" };
    socket.send(JSON.stringify(response));
    return;
  }

  const membership = await getPrisma().workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: socket.userId,
        workspaceId: channel.workspaceId,
      },
    },
  });

  if (!membership) {
    const response: ServerMessage = { type: "error", message: "Not a member of this workspace" };
    socket.send(JSON.stringify(response));
    return;
  }

  socket.channels.add(channelId);
  addSocketToChannel(channelId, socket);

  const joinResponse: ServerMessage = { type: "channel_joined", channelId };
  socket.send(JSON.stringify(joinResponse));

  const onlineUsers = getChannelUsers(channelId);
  broadcastToChannel(channelId, { type: "online_users", channelId, userIds: onlineUsers });
}
