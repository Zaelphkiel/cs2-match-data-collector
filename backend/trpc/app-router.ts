import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { fetchAllProcedure } from "./routes/matches/fetch-all/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  matches: createTRPCRouter({
    all: fetchAllProcedure,
  }),
});

export type AppRouter = typeof appRouter;
