import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import workspaceRoutes from "./routes/workspaces";
import channelRoutes from "./routes/channels";
import messageRoutes from "./routes/messages";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

app.route("/api/auth", authRoutes);
app.route("/api/auth", profileRoutes);
app.route("/api/workspaces", workspaceRoutes);
app.route("/api/channels", channelRoutes);
app.route("/api/messages", messageRoutes);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

console.log(`Backend server running on port ${env.PORT}`);
console.log(`WS Server URL: ${env.WS_SERVER_URL}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
