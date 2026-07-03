import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../schemas/profile";
import type { AppEnv } from "../types/hono";

const profile = new Hono<AppEnv>();

profile.use("*", authMiddleware);

profile.get("/", async (c) => {
  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
  });
  return c.json({ user });
});

profile.patch("/", validate(updateProfileSchema), async (c) => {
  const userId = c.get("userId");
  const data = c.get("validatedBody");

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  return c.json({ user });
});

export default profile;
