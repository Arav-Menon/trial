import { WebSocketServer } from "ws";
import { createServer } from "http";
import { env } from "./config/env";
import { handleConnection } from "./handlers/connection";

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "ws-server",
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", handleConnection);

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((socket) => {
    const ws = socket as any;
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

httpServer.listen(env.PORT, () => {
  console.log(`WebSocket server running on port ${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/health`);
});
