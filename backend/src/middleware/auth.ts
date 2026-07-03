import type { Context, Next } from "hono";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import type { AppEnv } from "../types/hono";

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1] as string;

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    c.set("user", user);
    c.set("userId", user.id);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}
