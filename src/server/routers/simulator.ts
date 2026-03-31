import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";

const PACKAGE_PRICES: Record<string, number> = {
  basic: 2000000,
  standard: 3000000,
  premium: 5000000,
};

const DIRECT_AVG_PRICE = 500000;
const MONTHLY_GROWTH_RATE = 0.1;
const WORK_HOURS_PER_MONTH = 160;

export const simulatorRouter = router({
  calculate: publicProcedure
    .input(
      z.object({
        agencyClients: z.number().int().min(0),
        packageType: z.enum(["basic", "standard", "premium"]),
        kmongOrders: z.number().int().min(0),
        kmongAvgPrice: z.number().min(0),
        directSales: z.number().int().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const agencyRevenue =
        input.agencyClients * PACKAGE_PRICES[input.packageType];
      const kmongRevenue = input.kmongOrders * input.kmongAvgPrice;
      const directRevenue = input.directSales * DIRECT_AVG_PRICE;

      const monthly = agencyRevenue + kmongRevenue + directRevenue;
      const yearly = monthly * 12;
      const hourlyRate = Math.round(monthly / WORK_HOURS_PER_MONTH);

      const monthlyProjection: number[] = [];
      for (let i = 0; i < 12; i++) {
        monthlyProjection.push(
          Math.round(monthly * Math.pow(1 + MONTHLY_GROWTH_RATE, i))
        );
      }

      return {
        monthly,
        yearly,
        hourlyRate,
        monthlyProjection,
        breakdown: {
          agency: agencyRevenue,
          kmong: kmongRevenue,
          direct: directRevenue,
        },
      };
    }),
});
