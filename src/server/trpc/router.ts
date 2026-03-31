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
import { osmuRouter } from "../routers/osmu";
import { hashtagRouter } from "../routers/hashtag";
import { simulatorRouter } from "../routers/simulator";
import { templatesRouter } from "../routers/templates";
import { autopilotRouter } from "../routers/autopilot";
import { funnelRouter } from "../routers/funnel";
import { abtestRouter } from "../routers/abtest";

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
  osmu: osmuRouter,
  hashtag: hashtagRouter,
  simulator: simulatorRouter,
  templates: templatesRouter,
  autopilot: autopilotRouter,
  funnel: funnelRouter,
  abtest: abtestRouter,
});

export type AppRouter = typeof appRouter;
