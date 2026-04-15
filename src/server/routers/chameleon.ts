import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";
import { generateImageFast } from "@/lib/image-generator";
import {
  buildReelsPrompt,
  buildDetailPagePrompt,
  buildBlogPrompt,
  buildCardNewsPrompt,
  buildProfilePrompt,
} from "@/lib/chameleon-prompts";

export const chameleonRouter = router({
  // 릴스/숏폼 생성 + 썸네일 이미지!
  generateReels: publicProcedure
    .input(
      z.object({
        industry: z.string().min(1),
        videoStyle: z.string().min(1),
        productName: z.string().min(1),
        coreMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildReelsPrompt(input);

      // 텍스트 + 이미지 동시 생성!
      const [content, thumbnail] = await Promise.all([
        chatWithClaude(
          "당신은 SNS 숏폼 콘텐츠 전문 프로듀서입니다. 영상 프롬프트는 Scene/Camera/Motion/Lighting 4요소를 반드시 포함하세요.",
          [{ role: "user", content: prompt }],
        ),
        generateImageFast(
          `${input.productName} ${input.industry} professional ${input.videoStyle} photography, cinematic lighting, 4K`
        ).catch(() => null),
      ]);

      return {
        content,
        thumbnailUrl: thumbnail?.url || null,
        type: "reels" as const,
      };
    }),

  // 상세페이지 생성 (HTML 포함!)
  generateDetailPage: publicProcedure
    .input(
      z.object({
        platform: z.string().min(1),
        serviceName: z.string().min(1),
        priceRange: z.string().min(1),
        usp: z.string().min(1),
        targetCustomer: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildDetailPagePrompt(input);
      const content = await chatWithClaude(
        "당신은 상세페이지 전문 카피라이터이자 웹 디자이너입니다. HTML+인라인CSS 코드도 제공하세요.",
        [{ role: "user", content: prompt }],
      );
      return { content, type: "detail" as const };
    }),

  // 블로그 생성
  generateBlog: publicProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        platform: z.string().min(1),
        length: z.string().min(1),
        tone: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildBlogPrompt(input);
      const content = await chatWithClaude(
        "당신은 SEO 전문 블로그 작성자입니다. 플랫폼별 최적화된 콘텐츠를 작성하세요.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),

  // 카드뉴스 생성
  generateCardNews: publicProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        pages: z.string().min(1),
        style: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildCardNewsPrompt(input);
      const content = await chatWithClaude(
        "당신은 카드뉴스 전문 디자이너이자 카피라이터입니다. 장별 텍스트와 디자인 가이드를 제공하세요.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),

  // SNS 프로필 세팅
  generateProfile: publicProcedure
    .input(
      z.object({
        industry: z.string().min(1),
        targetCustomer: z.string().min(1),
        keywords: z.string().min(1),
        brandTone: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = buildProfilePrompt(input);
      const content = await chatWithClaude(
        "당신은 SNS 브랜딩 전문가입니다. 전 채널 통일된 프로필 전략을 제공하세요.",
        [{ role: "user", content: prompt }],
      );
      return { content };
    }),
});
