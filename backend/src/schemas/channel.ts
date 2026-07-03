import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Channel name must be lowercase alphanumeric with hyphens"),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
