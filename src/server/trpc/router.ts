import { router, publicProcedure } from "./init";
import { chameleonRouter } from "../routers/chameleon";
import { contentRouter } from "../routers/content";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  chameleon: chameleonRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
