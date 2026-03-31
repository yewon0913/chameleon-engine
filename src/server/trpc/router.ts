import { router, publicProcedure } from "./init";
import { chameleonRouter } from "../routers/chameleon";
import { contentRouter } from "../routers/content";
import { crmRouter } from "../routers/crm";
import { revenueRouter } from "../routers/revenue";
import { calendarRouter } from "../routers/calendar";
import { deployRouter } from "../routers/deploy";
import { outboundRouter } from "../routers/outbound";
import { portfolioRouter } from "../routers/portfolio";
import { analyticsRouter } from "../routers/analytics";
import { reportRouter } from "../routers/report";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  chameleon: chameleonRouter,
  content: contentRouter,
  crm: crmRouter,
  revenue: revenueRouter,
  calendar: calendarRouter,
  deploy: deployRouter,
  outbound: outboundRouter,
  portfolio: portfolioRouter,
  analytics: analyticsRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
