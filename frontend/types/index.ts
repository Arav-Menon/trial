export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  role?: string;
  createdAt: string;
  members?: WorkspaceMember[];
  channels?: Channel[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  user: User;
}

export interface Channel {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  errors?: Record<string, string[]>;
}
