import type { WebSocket } from "ws";

export interface AuthenticatedSocket extends WebSocket {
  userId: string;
  userName: string;
  channels: Set<string>;
  isAlive: boolean;
}

export type ClientMessage =
  | { type: "authenticate"; token: string }
  | { type: "join_channel"; channelId: string }
  | { type: "leave_channel"; channelId: string }
  | { type: "send_message"; channelId: string; content: string }
  | { type: "typing_start"; channelId: string }
  | { type: "typing_stop"; channelId: string };

export type ServerMessage =
  | { type: "authenticated"; userId: string; userName: string }
  | { type: "auth_error"; message: string }
  | { type: "channel_joined"; channelId: string }
  | { type: "channel_left"; channelId: string }
  | { type: "new_message"; channelId: string; message: any }
  | { type: "user_typing"; channelId: string; userId: string; userName: string }
  | { type: "user_stopped_typing"; channelId: string; userId: string }
  | { type: "online_users"; channelId: string; userIds: string[] }
  | { type: "error"; message: string };
