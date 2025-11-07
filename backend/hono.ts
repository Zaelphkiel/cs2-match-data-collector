import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  exposeHeaders: ["Content-Type"],
  credentials: true,
  maxAge: 86400,
}));

app.use("*", async (c, next) => {
  console.log(`[Hono] 📥 ${c.req.method} ${c.req.url}`);
  await next();
  console.log(`[Hono] 📤 Response status: ${c.res.status}`);
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] ❌ Error in ${path}:`, error);
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "CS2 Match API is running", timestamp: new Date().toISOString() });
});

app.get("/api", (c) => {
  return c.json({ status: "ok", message: "API endpoint is working", timestamp: new Date().toISOString() });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
    routes: [
      "/api/trpc/example.hi",
      "/api/trpc/matches.all",
    ],
  });
});

app.onError((err, c) => {
  console.error(`[Hono] 💥 Uncaught error:`, err);
  return c.json(
    {
      ok: false,
      message: err.message,
    },
    500
  );
});

export default app;
