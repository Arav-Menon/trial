"use client";

import { useState } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const { user: updated } = await api.updateProfile({
        name: name || undefined,
        avatarUrl: avatarUrl || null,
      });
      updateUser(updated);
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar src={user.avatarUrl} alt={user.name} className="h-16 w-16" />
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-500 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="avatar">Avatar URL</label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL to an image for your avatar
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
