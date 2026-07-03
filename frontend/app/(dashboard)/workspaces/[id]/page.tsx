"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";
import { ChannelList } from "@/components/channel/channel-list";
import { CreateChannel } from "@/components/channel/create-channel";
import { InviteMembers } from "@/components/workspace/invite-members";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Workspace, Channel, WorkspaceMember } from "@/types";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkspace() {
    try {
      const { workspace } = await api.getWorkspace(workspaceId);
      setWorkspace(workspace);
      setChannels(workspace.channels || []);
      setMembers(workspace.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this workspace?")) return;
    try {
      await api.leaveWorkspace(workspaceId);
      router.push("/workspaces");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await api.removeMember(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const isOwner = members.some((m) => m.userId === user?.id && m.role === "owner");

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Link
            href="/workspaces"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Workspaces
          </Link>
          <h2 className="font-semibold text-lg truncate">{workspace?.name}</h2>
        </div>
        <div className="p-2 space-y-2">
          <CreateChannel workspaceId={workspaceId} onCreated={loadWorkspace} />
          <InviteMembers workspaceId={workspaceId} onMemberAdded={loadWorkspace} />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ChannelList channels={channels} workspaceId={workspaceId} />
        </div>
        <div className="p-2 border-t space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setShowMembers(!showMembers)}
          >
            <Users className="h-4 w-4 mr-2" />
            Members ({members.length})
          </Button>
          {!isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-500 hover:text-red-600"
              onClick={handleLeave}
            >
              Leave Workspace
            </Button>
          )}
        </div>
      </aside>

      {showMembers ? (
        <main className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold mb-4">Members</h3>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar src={m.user.avatarUrl} alt={m.user.name} />
                  <div>
                    <p className="font-medium">{m.user.name}</p>
                    <p className="text-sm text-muted-foreground">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">{m.role}</span>
                  {isOwner && m.userId !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Select a channel</h3>
            <p className="text-sm">Choose a channel from the sidebar to start chatting</p>
          </div>
        </main>
      )}
    </div>
  );
}
