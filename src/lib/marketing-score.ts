/**
 * 마케팅 건강점수 (0~100) — 블로그/카카오/네이버 종합
 */
import { naverBlogSearch, naverLocalSearch } from "./naver-api";
import { kakaoKeywordSearch } from "./kakao-api";

export interface MarketingScore {
  total: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: { name: string; score: number; maxScore: number; detail: string }[];
  recommendations: string[];
}

export async function calculateMarketingScore(businessName: string): Promise<MarketingScore> {
  const [blog, kakao, naver] = await Promise.all([
    naverBlogSearch(businessName),
    kakaoKeywordSearch(businessName, 1),
    naverLocalSearch(businessName, 1),
  ]);

  // 블로그 (30점)
  const bc = blog.total;
  const blogScore = bc >= 50 ? 30 : bc >= 20 ? 22 : bc >= 10 ? 15 : bc >= 3 ? 8 : 0;

  // 카카오맵 (20점)
  let kakaoScore = 0;
  if (kakao.length > 0) { kakaoScore = 10; if (kakao[0].phone) kakaoScore += 5; if (kakao[0].road_address_name) kakaoScore += 5; }

  // 네이버 (20점)
  let naverScore = 0;
  if (naver.length > 0) { naverScore = 15; if (naver[0].telephone) naverScore += 5; }

  // 최근 활동 (10점)
  const recent = blog.items?.filter((i) => { const y = parseInt((i.postdate || "").substring(0, 4)); return y >= 2025; }).length || 0;
  const recentScore = recent >= 3 ? 10 : recent >= 1 ? 5 : 0;

  const total = Math.min(100, blogScore + kakaoScore + naverScore + recentScore);
  const grade: MarketingScore["grade"] = total >= 80 ? "A" : total >= 60 ? "B" : total >= 40 ? "C" : total >= 20 ? "D" : "F";

  const recs: string[] = [];
  if (blogScore < 15) recs.push("블로그 마케팅 시작 필요 (월 4~8건 목표)");
  if (kakaoScore < 15) recs.push("카카오맵 정보 완성 (전화번호/사진/메뉴)");
  if (naverScore < 15) recs.push("네이버 플레이스 등록 및 업데이트");
  if (recentScore < 5) recs.push("최근 콘텐츠 활동 필요 (2025년 이후 게시글 없음)");
  if (total < 30) recs.push("전체적으로 온라인 마케팅이 시급합니다");

  return {
    total, grade,
    breakdown: [
      { name: "블로그 인지도", score: blogScore, maxScore: 30, detail: `네이버 블로그 ${bc}건` },
      { name: "카카오맵 완성도", score: kakaoScore, maxScore: 20, detail: kakao.length > 0 ? "등록됨" : "미등록" },
      { name: "네이버 노출", score: naverScore, maxScore: 20, detail: naver.length > 0 ? "노출됨" : "미노출" },
      { name: "최근 활동", score: recentScore, maxScore: 10, detail: `최근 게시글 ${recent}건` },
    ],
    recommendations: recs,
  };
}
