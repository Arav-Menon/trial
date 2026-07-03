"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  // Auth
  async register(data: { name: string; email: string; password: string }) {
    return this.post<{ user: any; token: string }>("/api/auth/register", data);
  }

  async login(data: { email: string; password: string }) {
    return this.post<{ user: any; token: string }>("/api/auth/login", data);
  }

  async getMe() {
    return this.get<{ user: any }>("/api/auth/me");
  }

  // Profile
  async updateProfile(data: { name?: string; avatarUrl?: string | null }) {
    return this.patch<{ user: any }>("/api/auth", data);
  }

  // Workspaces
  async getWorkspaces() {
    return this.get<{ workspaces: any[] }>("/api/workspaces");
  }

  async createWorkspace(data: { name: string }) {
    return this.post<{ workspace: any }>("/api/workspaces", data);
  }

  async getWorkspace(id: string) {
    return this.get<{ workspace: any }>(`/api/workspaces/${id}`);
  }

  async joinWorkspace(id: string) {
    return this.post<{ member: any }>(`/api/workspaces/${id}/join`);
  }

  async leaveWorkspace(id: string) {
    return this.post<{ success: boolean }>(`/api/workspaces/${id}/leave`);
  }

  async searchUsers(workspaceId: string, query: string) {
    return this.post<{ users: any[] }>(`/api/workspaces/${workspaceId}/invite`, { query });
  }

  async addMember(workspaceId: string, userId: string) {
    return this.post<{ member: any }>(`/api/workspaces/${workspaceId}/members`, { userId });
  }

  async removeMember(workspaceId: string, memberId: string) {
    return this.delete<{ success: boolean }>(`/api/workspaces/${workspaceId}/members/${memberId}`);
  }

  // Channels
  async getChannels(workspaceId: string) {
    return this.get<{ channels: any[] }>(`/api/channels/${workspaceId}`);
  }

  async createChannel(workspaceId: string, data: { name: string }) {
    return this.post<{ channel: any }>(`/api/channels/${workspaceId}`, data);
  }

  async deleteChannel(channelId: string) {
    return this.delete<{ success: boolean }>(`/api/channels/${channelId}`);
  }

  // Messages
  async getMessages(channelId: string, limit = 50) {
    return this.get<{ messages: any[] }>(
      `/api/messages/${channelId}?limit=${limit}`
    );
  }
}

export const api = new ApiClient();
