import type { AuthenticatedSocket } from "../types";

const channelUsers = new Map<string, Map<string, AuthenticatedSocket>>();
const userSockets = new Map<string, AuthenticatedSocket>();

export function addSocketToChannel(channelId: string, socket: AuthenticatedSocket) {
  if (!channelUsers.has(channelId)) {
    channelUsers.set(channelId, new Map());
  }
  channelUsers.get(channelId)!.set(socket.userId, socket);
  userSockets.set(socket.userId, socket);
}

export function removeSocketFromChannel(channelId: string, userId: string) {
  const channel = channelUsers.get(channelId);
  if (channel) {
    channel.delete(userId);
    if (channel.size === 0) {
      channelUsers.delete(channelId);
    }
  }
  userSockets.delete(userId);
}

export function removeSocketFromAllChannels(socket: AuthenticatedSocket) {
  for (const channelId of socket.channels) {
    removeSocketFromChannel(channelId, socket.userId);
  }
}

export function getChannelUsers(channelId: string): string[] {
  const channel = channelUsers.get(channelId);
  if (!channel) return [];
  return Array.from(channel.keys());
}

export function getSocketByUserId(userId: string): AuthenticatedSocket | undefined {
  return userSockets.get(userId);
}

export function broadcastToChannel(channelId: string, message: any, excludeUserId?: string) {
  const channel = channelUsers.get(channelId);
  if (!channel) return;

  const data = JSON.stringify(message);
  for (const [userId, socket] of channel) {
    if (userId !== excludeUserId && socket.readyState === 1) {
      socket.send(data);
    }
  }
}
