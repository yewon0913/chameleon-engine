import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { calculateMarketingScore } from "@/lib/marketing-score";

export const marketingScoreRouter = router({
  calculate: publicProcedure
    .input(z.object({ businessName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await calculateMarketingScore(input.businessName);
    }),
});
