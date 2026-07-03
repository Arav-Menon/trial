"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.userId === currentUserId;

        return (
          <div key={message.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
            <Avatar
              src={message.user.avatarUrl}
              alt={message.user.name}
              className="h-8 w-8"
            />
            <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{message.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
