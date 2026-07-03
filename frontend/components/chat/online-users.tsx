"use client";

import { Avatar } from "@/components/ui/avatar";
import { Circle } from "lucide-react";

interface OnlineUsersProps {
  userIds: string[];
  currentUserId: string;
}

export function OnlineUsers({ userIds, currentUserId }: OnlineUsersProps) {
  const count = userIds.length;

  return (
    <div className="px-4 py-2 border-b">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        <span>{count} online</span>
      </div>
    </div>
  );
}
