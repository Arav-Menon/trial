import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
import type { AppEnv } from "../types/hono";

export function validate(schema: ZodSchema) {
  return async (c: Context<AppEnv>, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return c.json({ error: "Validation failed", errors }, 400);
    }

    c.set("validatedBody", result.data);
    await next();
  };
}
