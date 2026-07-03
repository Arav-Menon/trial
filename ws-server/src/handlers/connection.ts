import type { WebSocket } from "ws";
import type { AuthenticatedSocket, ClientMessage, ServerMessage } from "../types";
import { verifyToken } from "../lib/jwt";
import { getPrisma } from "../lib/prisma";
import { addSocketToChannel, removeSocketFromChannel, removeSocketFromAllChannels, getChannelUsers, broadcastToChannel } from "../store/presence";
import { handleJoinChannel } from "./channel";
import { handleSendMessage } from "./message";
import { handleTypingStart, handleTypingStop } from "./typing";

export async function handleConnection(socket: WebSocket) {
  const authSocket = socket as AuthenticatedSocket;
  authSocket.channels = new Set();
  authSocket.isAlive = true;

  socket.on("pong", () => {
    authSocket.isAlive = true;
  });

  socket.on("message", async (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      await handleMessage(authSocket, message);
    } catch (error) {
      const errorResponse: ServerMessage = { type: "error", message: "Invalid message format" };
      socket.send(JSON.stringify(errorResponse));
    }
  });

  socket.on("close", () => {
    removeSocketFromAllChannels(authSocket);
  });
}

async function handleMessage(socket: AuthenticatedSocket, message: ClientMessage) {
  switch (message.type) {
    case "authenticate":
      await handleAuthenticate(socket, message.token);
      break;
    case "join_channel":
      await handleJoinChannel(socket, message.channelId);
      break;
    case "leave_channel":
      handleLeaveChannel(socket, message.channelId);
      break;
    case "send_message":
      await handleSendMessage(socket, message.channelId, message.content);
      break;
    case "typing_start":
      handleTypingStart(socket, message.channelId);
      break;
    case "typing_stop":
      handleTypingStop(socket, message.channelId);
      break;
    default:
      const errorResponse: ServerMessage = { type: "error", message: "Unknown message type" };
      socket.send(JSON.stringify(errorResponse));
  }
}

async function handleAuthenticate(socket: AuthenticatedSocket, token: string) {
  try {
    const payload = verifyToken(token);
    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true },
    });

    if (!user) {
      const response: ServerMessage = { type: "auth_error", message: "User not found" };
      socket.send(JSON.stringify(response));
      return;
    }

    socket.userId = user.id;
    socket.userName = user.name;

    const response: ServerMessage = {
      type: "authenticated",
      userId: user.id,
      userName: user.name,
    };
    socket.send(JSON.stringify(response));
  } catch (error) {
    const response: ServerMessage = { type: "auth_error", message: "Invalid token" };
    socket.send(JSON.stringify(response));
  }
}

function handleLeaveChannel(socket: AuthenticatedSocket, channelId: string) {
  socket.channels.delete(channelId);
  removeSocketFromChannel(channelId, socket.userId);

  const response: ServerMessage = { type: "channel_left", channelId };
  socket.send(JSON.stringify(response));

  const onlineUsers = getChannelUsers(channelId);
  broadcastToChannel(channelId, { type: "online_users", channelId, userIds: onlineUsers });
}
