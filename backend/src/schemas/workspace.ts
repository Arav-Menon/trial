import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
