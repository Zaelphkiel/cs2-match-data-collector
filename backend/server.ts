import { serve } from "@hono/node-server";
import app from "./hono";

const port = Number(process.env.PORT) || 3000;

console.log(`[Server] 🚀 Starting server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number }) => {
  console.log(`[Server] ✅ Server is running on http://localhost:${info.port}`);
  console.log(`[Server] 📡 Health check: http://localhost:${info.port}/api/health`);
  console.log(`[Server] 🔌 tRPC endpoint: http://localhost:${info.port}/api/trpc`);
});
