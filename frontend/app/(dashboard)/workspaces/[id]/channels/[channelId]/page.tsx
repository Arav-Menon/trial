"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";
import { useWebSocket, type WsMessage } from "@/hooks/use-websocket";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { OnlineUsers } from "@/components/chat/online-users";
import { ChannelList } from "@/components/channel/channel-list";
import { CreateChannel } from "@/components/channel/create-channel";
import { Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Workspace, Channel, Message } from "@/types";

export default function ChannelChatPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const channelId = params.channelId as string;
  const { user, token } = useAuthStore();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typingUsersRef = useRef(typingUsers);
  typingUsersRef.current = typingUsers;

  const handleWsMessage = useCallback(
    (message: WsMessage) => {
      switch (message.type) {
        case "channel_joined":
          break;
        case "new_message":
          if (message.channelId === channelId) {
            setMessages((prev) => [...prev, message.message]);
          }
          break;
        case "user_typing":
          if (message.channelId === channelId) {
            setTypingUsers((prev) => {
              const exists = prev.some((u) => u.userId === message.userId);
              if (exists) return prev;
              return [...prev, { userId: message.userId, userName: message.userName }];
            });
          }
          break;
        case "user_stopped_typing":
          if (message.channelId === channelId) {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== message.userId));
          }
          break;
        case "online_users":
          if (message.channelId === channelId) {
            setOnlineUsers(message.userIds);
          }
          break;
      }
    },
    [channelId]
  );

  const { isConnected, connect, send } = useWebSocket({ onMessage: handleWsMessage });

  useEffect(() => {
    if (token) {
      connect(token);
    }
  }, [token, connect]);

  useEffect(() => {
    async function load() {
      try {
        const [{ workspace }, { channels }, { messages }] = await Promise.all([
          api.getWorkspace(workspaceId),
          api.getChannels(workspaceId),
          api.getMessages(channelId),
        ]);
        setWorkspace(workspace);
        setChannels(channels);
        setMessages(messages);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [workspaceId, channelId]);

  useEffect(() => {
    if (isConnected) {
      send({ type: "join_channel", channelId });
    }
  }, [isConnected, channelId, send]);

  function handleSend(content: string) {
    send({ type: "send_message", channelId, content });
  }

  function handleTypingStart() {
    send({ type: "typing_start", channelId });
  }

  function handleTypingStop() {
    send({ type: "typing_stop", channelId });
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)]">
        <aside className="w-64 border-r bg-muted/30" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Link
            href={`/workspaces/${workspaceId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h2 className="font-semibold text-lg truncate">{workspace?.name}</h2>
        </div>
        <div className="p-2">
          <CreateChannel workspaceId={workspaceId} onCreated={() => {
            api.getChannels(workspaceId).then(({ channels }) => setChannels(channels));
          }} />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ChannelList channels={channels} workspaceId={workspaceId} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">{channels.find((c) => c.id === channelId)?.name}</h3>
          <div className="flex-1" />
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        </div>

        <OnlineUsers userIds={onlineUsers} currentUserId={user?.id || ""} />

        <MessageList messages={messages} currentUserId={user?.id || ""} />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          onSend={handleSend}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </main>
    </div>
  );
}
