/**
 * 마케팅 안 하는 사장님 자동 발굴
 */
import { kakaoKeywordSearch } from "./kakao-api";
import { naverBlogSearch } from "./naver-api";

export interface ProspectResult {
  place_name: string;
  category: string;
  address: string;
  phone: string;
  place_url: string;
  blog_mentions: number;
  marketing_status: "none" | "weak" | "moderate" | "strong";
  priority: "hot" | "warm" | "cold";
  priority_label: string;
}

export async function findProspects(region: string, industry: string, limit = 15): Promise<ProspectResult[]> {
  const places = await kakaoKeywordSearch(`${region} ${industry}`, limit);
  if (places.length === 0) return [];

  const results: ProspectResult[] = [];

  for (const place of places.slice(0, limit)) {
    const blog = await naverBlogSearch(place.place_name);
    const cnt = blog.total;

    let marketing_status: ProspectResult["marketing_status"] = "none";
    let priority: ProspectResult["priority"] = "hot";
    let priority_label = "";

    if (cnt === 0) { marketing_status = "none"; priority = "hot"; priority_label = "🔥🔥 마케팅 전무"; }
    else if (cnt <= 5) { marketing_status = "weak"; priority = "hot"; priority_label = "🔥 마케팅 부족"; }
    else if (cnt <= 20) { marketing_status = "moderate"; priority = "warm"; priority_label = "⭐ 보통"; }
    else { marketing_status = "strong"; priority = "cold"; priority_label = "❄️ 활발"; }

    results.push({
      place_name: place.place_name,
      category: place.category_name,
      address: place.road_address_name || place.address_name,
      phone: place.phone || "",
      place_url: place.place_url,
      blog_mentions: cnt,
      marketing_status,
      priority,
      priority_label,
    });

    await new Promise((r) => setTimeout(r, 100));
  }

  results.sort((a, b) => ({ hot: 0, warm: 1, cold: 2 }[a.priority] - { hot: 0, warm: 1, cold: 2 }[b.priority]));
  return results;
}
