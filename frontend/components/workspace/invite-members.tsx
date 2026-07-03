"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { UserPlus, X, Search } from "lucide-react";

interface InviteMembersProps {
  workspaceId: string;
  onMemberAdded: () => void;
}

export function InviteMembers({ workspaceId, onMemberAdded }: InviteMembersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const { users } = await api.searchUsers(workspaceId, q);
      setResults(users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setError("");
    search(value);
  }

  async function handleAdd(userId: string) {
    setAddingId(userId);
    setError("");
    try {
      await api.addMember(workspaceId, userId);
      setResults((prev) => prev.filter((u) => u.id !== userId));
      setQuery("");
      onMemberAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Invite
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Invite members</h4>
        <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setQuery(""); setResults([]); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {isLoading && <p className="text-xs text-muted-foreground">Searching...</p>}
      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {results.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
              <div className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} alt={user.name} className="h-7 w-7" />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAdd(user.id)}
                disabled={addingId === user.id}
              >
                {addingId === user.id ? "Adding..." : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}
      {query.length >= 1 && !isLoading && results.length === 0 && (
        <p className="text-xs text-muted-foreground">No users found</p>
      )}
    </div>
  );
}
