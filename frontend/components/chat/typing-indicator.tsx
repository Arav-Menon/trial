"use client";

import { Users } from "lucide-react";

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  let text = "";

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="px-4 py-1 text-xs text-muted-foreground flex items-center gap-1">
      <span className="animate-pulse">{text}...</span>
    </div>
  );
}
