"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { WorkspaceList } from "@/components/workspace/workspace-list";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import type { Workspace } from "@/types";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkspaces() {
    try {
      const { workspaces } = await api.getWorkspaces();
      setWorkspaces(workspaces);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Workspaces</h1>
      <div className="space-y-6">
        <CreateWorkspace onCreated={loadWorkspaces} />
        {isLoading ? (
          <p className="text-muted-foreground">Loading workspaces...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <WorkspaceList workspaces={workspaces} />
        )}
      </div>
    </div>
  );
}
