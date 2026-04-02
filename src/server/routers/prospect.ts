import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { findProspects } from "@/lib/prospect-finder";

export const prospectRouter = router({
  find: publicProcedure
    .input(z.object({ region: z.string().min(1), industry: z.string().min(1), limit: z.number().min(1).max(30).default(15) }))
    .mutation(async ({ input }) => {
      const results = await findProspects(input.region, input.industry, input.limit);
      return { total: results.length, prospects: results };
    }),
});
