import { z } from "zod";
import { router, publicProcedure } from "../trpc/init";
import { chatWithClaude } from "@/lib/claude-api";
import { generateImage, selectImageModel } from "@/lib/image-generator";
import { generateVideo, generateVideoFromImage } from "@/lib/video-generator";
import { generateNarration } from "@/lib/elevenlabs";
import { naverLocalSearch } from "@/lib/naver-api";
import { kakaoKeywordSearch } from "@/lib/kakao-api";
import { getTrend } from "@/lib/perplexity";
import { analyzeCompetitors } from "@/lib/youtube-analyzer";
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
        extraRequest: z.string().optional(),
        duration: z.enum(["5", "10", "15", "30"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const basePrompt = buildReelsPrompt(input);
      const prompt = input.extraRequest ? `${basePrompt}\n\n[고객 추가 요구사항] ${input.extraRequest}` : basePrompt;

      // 1단계: AI가 최적 이미지 프롬프트 생성
      const [content, imgPromptRaw] = await Promise.all([
        chatWithClaude(
          "당신은 SNS 숏폼 콘텐츠 전문 프로듀서입니다. 영상 프롬프트는 Scene/Motion/Lighting 3요소를 반드시 포함하세요.",
          [{ role: "user", content: prompt }],
        ),
        chatWithClaude(
          "You are a professional photographer. Output ONLY the English prompt, nothing else.",
          [{ role: "user", content: `업종: ${input.industry}\n제품: ${input.productName}\n스타일: ${input.videoStyle}\n\n이 제품의 고품질 사진 프롬프트를 영문으로 만들어줘.\n한국 음식이면 정확한 영문명+특징 포함.\n예: 차돌해물짬뽕 → Korean spicy jjamppong noodle soup with marbled beef brisket, shrimp, squid, mussels in fiery red chili broth, steam rising, ceramic bowl, dark wooden table\n\n프롬프트만. 다른 설명 없이.` }],
        ),
      ]);

      const imgPrompt = (imgPromptRaw || `${input.productName} professional photography, 4K`).trim();
      const model = selectImageModel(input.industry);

      // 버그1: 나레이션 텍스트 → "나레이션 스크립트" 섹션에서 추출
      const narrMatch = content.match(/나레이션[\s\S]*?스크립트[:\s]*([\s\S]*?)(?=###|$)/i);
      const captionMatch = content.match(/인스타그램[:\s]*(.+?)(?:\n|$)/i) || content.match(/캡션[:\s]*(.+?)(?:\n|$)/i);
      const rawNarr = narrMatch?.[1]?.replace(/\*\*/g, "").replace(/Scene \d[^:]*:/gi, "").trim();
      const narrationText = rawNarr && rawNarr.length >= 50
        ? rawNarr.slice(0, 500)
        : captionMatch?.[1]?.slice(0, 500)
          || `${input.productName}의 매력을 지금 바로 확인하세요. ${input.coreMessage || input.industry}. 프로필 링크에서 더 알아보세요.`;

      // 버그2: 영상 프롬프트 → AI가 생성한 Scene 프롬프트 사용
      const sceneMatch = content.match(/영상 프롬프트[\s\S]*?(Scene[\s\S]*?)(?=###|🖼️|📝|$)/i)
        || content.match(/(Scene 1[\s\S]*?Scene [34][\s\S]*?)(?=###|🖼️|📝|$)/i);
      const aiVideoPrompt = sceneMatch?.[1]?.trim().slice(0, 800) || `${imgPrompt}, slow motion, cinematic, 9:16 vertical`;

      const [thumbnail, bodyImage, narration] = await Promise.all([
        generateImage(imgPrompt + ", top-down angle, appetizing, warm lighting", { model }).catch((e) => { console.error("[reels] 이미지1:", (e as Error).message?.slice(0, 50)); return null; }),
        generateImage(imgPrompt + ", 45 degree angle, lifestyle setting, shallow depth of field", { model }).catch((e) => { console.error("[reels] 이미지2:", (e as Error).message?.slice(0, 50)); return null; }),
        generateNarration(narrationText).catch((e) => { console.error("[reels] 나레이션:", (e as Error).message?.slice(0, 50)); return null; }),
      ]);

      console.log(`[reels] narr=${!!narration}(${narrationText.length}자) video="${aiVideoPrompt.slice(0,40)}"`);

      return {
        content,
        thumbnailUrl: thumbnail?.url || null,
        bodyImageUrl: bodyImage?.url || null,
        narrationUrl: narration,
        narrationText,
        videoPrompt: aiVideoPrompt,
        videoDuration: input.duration || "10",
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

  // 블로그 생성 + 네이버 SEO 분석
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
      // 네이버 검색으로 경쟁 분석 (병렬)
      const [prompt, naverResults] = await Promise.all([
        Promise.resolve(buildBlogPrompt(input)),
        naverLocalSearch(input.topic, 5).catch(() => []),
      ]);

      const seoContext = naverResults.length > 0
        ? `\n\n[네이버 상위 글 참고]\n${naverResults.map((r, i) => `${i + 1}. ${r.title}`).join("\n")}\n위 글보다 더 유용하고 구체적으로 작성하세요.`
        : "";

      const content = await chatWithClaude(
        "당신은 SEO 전문 블로그 작성자입니다. 플랫폼별 최적화된 콘텐츠를 작성하세요.",
        [{ role: "user", content: prompt + seoContext }],
      );

      return {
        content,
        seoData: naverResults.length > 0 ? { competitors: naverResults.length, topTitles: naverResults.map((r) => r.title) } : null,
      };
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

  // 나레이션 재생성
  regenerateNarration: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const narration = await generateNarration(input.text);
      return { narrationUrl: narration };
    }),

  // 영상 생성 — image-to-video 우선 (퀄리티 UP!)
  generateReelsVideo: publicProcedure
    .input(z.object({
      prompt: z.string().min(1),
      duration: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const klingDuration = (input.duration === "5") ? "5" : "10";

      if (input.imageUrl) {
        // image-to-video (이미지 기반 → 퀄리티 훨씬 좋음!)
        console.log(`[video] image-to-video: duration=${klingDuration}`);
        const video = await generateVideoFromImage(input.imageUrl, input.prompt, klingDuration as "5" | "10");
        return { videoUrl: video?.url || null };
      }

      // text-to-video (fallback)
      console.log(`[video] text-to-video: duration=${klingDuration}`);
      const video = await generateVideo(input.prompt, { duration: klingDuration, aspectRatio: "9:16" });
      return { videoUrl: video?.url || null };
    }),

  // 업종별 트렌드 분석 (Perplexity)
  getTrend: publicProcedure
    .input(z.object({ industry: z.string().min(1) }))
    .query(async ({ input }) => {
      const trend = await getTrend(input.industry);
      return { trend };
    }),

  // 경쟁 영상 분석 (YouTube)
  getCompetitors: publicProcedure
    .input(z.object({ keyword: z.string().min(1) }))
    .query(async ({ input }) => {
      const videos = await analyzeCompetitors(input.keyword);
      return { videos };
    }),

  // 상권 분석 (카카오)
  analyzeArea: publicProcedure
    .input(z.object({ keyword: z.string().min(1) }))
    .query(async ({ input }) => {
      const places = await kakaoKeywordSearch(input.keyword, 10);
      return { places, total: places.length };
    }),
});
