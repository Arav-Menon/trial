"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface CreateChannelProps {
  workspaceId: string;
  onCreated: () => void;
}

export function CreateChannel({ workspaceId, onCreated }: CreateChannelProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.createChannel(workspaceId, { name });
      setName("");
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="new-channel"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        minLength={2}
        pattern="[a-z0-9-]+"
        className="text-sm"
      />
      <Button type="submit" disabled={isLoading} size="icon" variant="secondary">
        <Plus className="h-4 w-4" />
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
