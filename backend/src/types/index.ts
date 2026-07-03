export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  createdAt: Date;
}

export type JwtPayload = {
  userId: string;
};
