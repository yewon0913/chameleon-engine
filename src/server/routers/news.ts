import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { collectAndRankNews, buildReelsScriptPrompt } from "@/lib/news-collector";
import { getAnchorStyle, generateAnchorImage } from "@/lib/anchor-generator";

export const newsRouter = router({
  collect: publicProcedure.mutation(async () => {
    const news = await collectAndRankNews();
    return { total: news.length, news: news.slice(0, 10) };
  }),
  generateReels: publicProcedure
    .input(z.object({ title: z.string(), summary: z.string(), source: z.string() }))
    .mutation(async ({ input }) => {
      const { anchor, style } = getAnchorStyle(input.title);
      const imageUrl = await generateAnchorImage(anchor, style);
      const prompt = buildReelsScriptPrompt({ ...input, url: "", viralScore: 0 });
      return { anchor, style, imageUrl, scriptPrompt: prompt };
    }),
});
