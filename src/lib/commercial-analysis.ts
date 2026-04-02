/**
 * 통합 상권분석 엔진 — 정부(소진공) + 카카오 + 네이버
 */
import { kakaoKeywordSearch, kakaoCategorySearch, getCategoryCode } from "./kakao-api";
import { naverBlogSearch } from "./naver-api";
import { searchStoresByRadius, getIndustryCode } from "./semas-commercial";

export interface CommercialAnalysis {
  business_name: string;
  category: string;
  address: string;
  phone: string;
  lat: string;
  lon: string;
  competitors: number;
  density: string;
  nearby: { restaurants: number; cafes: number; convenience_stores: number };
  gov_total_500m: number;
  gov_same_industry_500m: number;
  gov_data_source: string;
  blog_mentions: number;
  marketing_label: string;
  revenue_estimate: { min: number; max: number; avg: number };
  overall_score: number;
  overall_grade: string;
  recommendations: string[];
}

const REV: Record<string, [number, number, number]> = {
  한식: [3000, 15000, 8000], 카페: [2000, 12000, 6000], 치킨: [5000, 18000, 10000],
  미용: [3000, 15000, 7000], 네일: [2000, 8000, 4000], 꽃: [1500, 8000, 3500],
  편의점: [15000, 40000, 25000], 학원: [5000, 30000, 12000], 헬스: [3000, 15000, 8000],
};

export async function analyzeCommercial(businessName: string): Promise<CommercialAnalysis | null> {
  const places = await kakaoKeywordSearch(businessName, 3);
  if (places.length === 0) return null;
  const t = places[0];
  const catCode = getCategoryCode(t.category_name);
  const indCode = getIndustryCode(t.category_name);

  const [comp, rest, cafe, conv, govAll, govSame, blog] = await Promise.all([
    kakaoCategorySearch(t.x, t.y, catCode, 500),
    kakaoCategorySearch(t.x, t.y, "FD6", 500),
    kakaoCategorySearch(t.x, t.y, "CE7", 500),
    kakaoCategorySearch(t.x, t.y, "CS2", 500),
    searchStoresByRadius(t.x, t.y, 500, undefined, 1, 1),
    indCode ? searchStoresByRadius(t.x, t.y, 500, indCode, 1, 1) : Promise.resolve({ totalCount: 0, stores: [] }),
    naverBlogSearch(businessName),
  ]);

  const cc = comp.total;
  const density = cc <= 5 ? "낮음 (유리)" : cc <= 15 ? "보통" : cc <= 30 ? "높음" : "포화";
  const nearbyTotal = rest.total + cafe.total;

  let [rMin, rMax, rAvg] = [2000, 10000, 5000] as [number, number, number];
  for (const [k, v] of Object.entries(REV)) if (t.category_name.includes(k)) { [rMin, rMax, rAvg] = v; break; }
  if (nearbyTotal > 50) { rMin *= 1.2; rMax *= 1.2; rAvg *= 1.2; }
  if (cc > 20) rAvg *= 0.85;

  const bc = blog.total;
  const mkt = bc >= 50 ? "활발" : bc >= 20 ? "보통" : bc >= 5 ? "부족" : "전무";

  let score = 50;
  if (cc <= 5) score += 15; else if (cc > 30) score -= 20;
  if (nearbyTotal > 50) score += 10; else if (nearbyTotal < 20) score -= 10;
  if (bc >= 20) score += 10; else if (bc < 5) score -= 10;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 30 ? "D" : "F";

  const recs: string[] = [];
  if (cc > 30) recs.push("경쟁 포화 — 차별화 전략 필수");
  if (cc <= 5) recs.push("경쟁 적음 — 선점 기회!");
  if (bc < 5) recs.push("온라인 마케팅 전무 — 블로그/인스타 시작 필요");

  return {
    business_name: t.place_name, category: t.category_name,
    address: t.road_address_name || t.address_name, phone: t.phone || "",
    lat: t.y, lon: t.x,
    competitors: cc, density,
    nearby: { restaurants: rest.total, cafes: cafe.total, convenience_stores: conv.total },
    gov_total_500m: govAll.totalCount, gov_same_industry_500m: govSame.totalCount,
    gov_data_source: "소상공인시장진흥공단 (국세청/카드사 데이터)",
    blog_mentions: bc, marketing_label: mkt,
    revenue_estimate: { min: Math.round(rMin), max: Math.round(rMax), avg: Math.round(rAvg) },
    overall_score: score, overall_grade: grade, recommendations: recs,
  };
}
