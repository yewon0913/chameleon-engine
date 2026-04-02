/**
 * 네이버 검색 API — 지역 + 블로그
 */

export interface NaverLocalResult {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
}

export async function naverLocalSearch(query: string, display = 5): Promise<NaverLocalResult[]> {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return [];
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${display}`,
      { headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

export async function naverBlogSearch(query: string): Promise<{ total: number; items: { postdate?: string }[] }> {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return { total: 0, items: [] };
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=5&sort=date`,
      { headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret } },
    );
    if (!res.ok) return { total: 0, items: [] };
    const data = await res.json();
    return { total: data.total || 0, items: data.items || [] };
  } catch { return { total: 0, items: [] }; }
}
