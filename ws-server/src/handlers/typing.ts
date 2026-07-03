import type { AuthenticatedSocket, ServerMessage } from "../types";
import { broadcastToChannel } from "../store/presence";

const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function handleTypingStart(socket: AuthenticatedSocket, channelId: string) {
  if (!socket.userId) return;

  const key = `${socket.userId}:${channelId}`;

  if (typingTimers.has(key)) {
    clearTimeout(typingTimers.get(key)!);
  }

  const response: ServerMessage = {
    type: "user_typing",
    channelId,
    userId: socket.userId,
    userName: socket.userName,
  };

  broadcastToChannel(channelId, response, socket.userId);

  const timer = setTimeout(() => {
    handleTypingStop(socket, channelId);
  }, 5000);

  typingTimers.set(key, timer);
}

export function handleTypingStop(socket: AuthenticatedSocket, channelId: string) {
  if (!socket.userId) return;

  const key = `${socket.userId}:${channelId}`;

  if (typingTimers.has(key)) {
    clearTimeout(typingTimers.get(key)!);
    typingTimers.delete(key);
  }

  const response: ServerMessage = {
    type: "user_stopped_typing",
    channelId,
    userId: socket.userId,
  };

  broadcastToChannel(channelId, response, socket.userId);
}
