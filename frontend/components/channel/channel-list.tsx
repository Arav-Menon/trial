"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";
import type { Channel } from "@/types";

interface ChannelListProps {
  channels: Channel[];
  workspaceId: string;
}

export function ChannelList({ channels, workspaceId }: ChannelListProps) {
  const pathname = usePathname();

  if (channels.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-muted-foreground">
        No channels yet
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2">
      {channels.map((channel) => {
        const href = `/workspaces/${workspaceId}/channels/${channel.id}`;
        const isActive = pathname === href;

        return (
          <Link
            key={channel.id}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <Hash className="h-4 w-4 shrink-0" />
            <span className="truncate">{channel.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
