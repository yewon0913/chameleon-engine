import { router, publicProcedure } from "./init";
import { chameleonRouter } from "../routers/chameleon";
import { contentRouter } from "../routers/content";
import { crmRouter } from "../routers/crm";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  chameleon: chameleonRouter,
  content: contentRouter,
  crm: crmRouter,
});

export type AppRouter = typeof appRouter;
