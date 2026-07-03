import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types/hono";

const auth = new Hono<AppEnv>();

auth.post("/register", validate(registerSchema), async (c) => {
  const { name, email, password } = c.get("validatedBody");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  const token = signToken({ userId: user.id });

  return c.json({ user, token }, 201);
});

auth.post("/login", validate(loginSchema), async (c) => {
  const { email, password } = c.get("validatedBody");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = signToken({ userId: user.id });

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    token,
  });
});

auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default auth;
