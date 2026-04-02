/**
 * 카카오 로컬 검색 API — 키워드 + 카테고리 검색
 */

export interface KakaoPlace {
  place_name: string;
  category_name: string;
  category_group_code: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
}

export async function kakaoKeywordSearch(query: string, size = 15): Promise<KakaoPlace[]> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=${size}`,
      { headers: { Authorization: `KakaoAK ${key}` } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.documents || [];
  } catch { return []; }
}

export async function kakaoCategorySearch(
  x: string, y: string, categoryCode: string, radius = 500, size = 15,
): Promise<{ total: number; places: KakaoPlace[] }> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return { total: 0, places: [] };
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${categoryCode}&x=${x}&y=${y}&radius=${radius}&size=${size}&sort=distance`,
      { headers: { Authorization: `KakaoAK ${key}` } },
    );
    if (!res.ok) return { total: 0, places: [] };
    const data = await res.json();
    return { total: data.meta?.total_count || 0, places: data.documents || [] };
  } catch { return { total: 0, places: [] }; }
}

export function getCategoryCode(category: string): string {
  if (/음식|한식|중식|일식|양식|치킨|피자|분식|고기|횟|국밥/.test(category)) return "FD6";
  if (/카페|커피|디저트|베이커리|빵/.test(category)) return "CE7";
  if (/편의점|마트|슈퍼/.test(category)) return "CS2";
  if (/병원|의원|치과|한의원/.test(category)) return "HP8";
  if (/약국/.test(category)) return "PM9";
  if (/은행|금융/.test(category)) return "BK9";
  return "FD6";
}
