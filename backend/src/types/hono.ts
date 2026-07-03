import type { Hono } from "hono";

type Bindings = {};

type Variables = {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  validatedBody: any;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
