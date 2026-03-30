import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";
import { buildThreadPrompt, buildInstaPrompt, buildBlogPrompt } from "@/lib/content-prompt";

export const contentRouter = router({
  generateThread: publicProcedure
    .input(
      z.object({
        contentType: z.string(),
        industry: z.string().optional(),
        keywords: z.string().min(1),
        tone: z.enum(["expert", "friendly", "storytelling"]),
        length: z.enum(["short", "medium", "long"]),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildThreadPrompt(input);
      const content = await chatWithClaude(
        "당신은 소상공인 마케팅 전문 카피라이터입니다.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),

  generateInsta: publicProcedure
    .input(
      z.object({
        contentType: z.string(),
        industry: z.string().optional(),
        storeName: z.string().optional(),
        keywords: z.string().min(1),
        emojiLevel: z.enum(["many", "moderate", "none"]),
        hashtagCount: z.union([z.literal(10), z.literal(20), z.literal(30)]),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildInstaPrompt(input);
      const content = await chatWithClaude(
        "당신은 인스타그램 마케팅 전문 카피라이터입니다.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),

  generateBlog: publicProcedure
    .input(
      z.object({
        contentType: z.string(),
        topic: z.string().min(1),
        targetKeyword: z.string().optional(),
        length: z.enum(["1000", "2000", "3000"]),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildBlogPrompt(input);
      const content = await chatWithClaude(
        "당신은 소상공인 전문 블로그 작성자입니다. SEO에 최적화된 블로그 글을 작성하세요.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),
});
