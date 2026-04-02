/**
 * 소상공인시장진흥공단 상가(상권)정보 API
 * data.go.kr 공공데이터포털
 */

const DATA_GO_KR_KEY = process.env.DATA_GO_KR_API_KEY;
const BASE_URL = "http://apis.data.go.kr/B553077/api/open/sdsc2";

export interface SemasStore {
  bizesId: string;
  bizesNm: string;
  brchNm: string;
  indsLclsNm: string;
  indsMclsNm: string;
  indsSclsNm: string;
  ksicNm: string;
  lnoAdr: string;
  rdnmAdr: string;
  lon: string;
  lat: string;
  flrNo: string;
}

export async function searchStoreByName(storeName: string, pageNo = 1, numOfRows = 10): Promise<{ totalCount: number; stores: SemasStore[] }> {
  if (!DATA_GO_KR_KEY) return { totalCount: 0, stores: [] };
  try {
    const params = new URLSearchParams({ serviceKey: DATA_GO_KR_KEY, pageNo: String(pageNo), numOfRows: String(numOfRows), type: "json", bizesNm: storeName });
    const res = await fetch(`${BASE_URL}/storeListInDong?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { totalCount: 0, stores: [] };
    const data = await res.json();
    return { totalCount: data?.body?.totalCount || 0, stores: data?.body?.items || [] };
  } catch { return { totalCount: 0, stores: [] }; }
}

export async function searchStoresByRadius(lon: string, lat: string, radius = 500, indsLclsCd?: string, pageNo = 1, numOfRows = 20): Promise<{ totalCount: number; stores: SemasStore[] }> {
  if (!DATA_GO_KR_KEY) return { totalCount: 0, stores: [] };
  try {
    const params = new URLSearchParams({ serviceKey: DATA_GO_KR_KEY, pageNo: String(pageNo), numOfRows: String(numOfRows), type: "json", radius: String(radius), cx: lon, cy: lat });
    if (indsLclsCd) params.append("indsLclsCd", indsLclsCd);
    const res = await fetch(`${BASE_URL}/storeListInRadius?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { totalCount: 0, stores: [] };
    const data = await res.json();
    return { totalCount: data?.body?.totalCount || 0, stores: data?.body?.items || [] };
  } catch { return { totalCount: 0, stores: [] }; }
}

export function getIndustryCode(industry: string): string | undefined {
  if (/카페|커피|디저트|빵|베이커리|음식|한식|중식|일식|치킨|피자|분식|고기/.test(industry)) return "Q";
  if (/미용|헤어|네일|피부|뷰티|세탁/.test(industry)) return "F";
  if (/편의점|마트|슈퍼|꽃|화훼|소매/.test(industry)) return "D";
  if (/헬스|필라테스|요가/.test(industry)) return "N";
  if (/학원|교습/.test(industry)) return "P";
  if (/병원|의원|치과|약국/.test(industry)) return "C";
  if (/펜션|게스트|모텔|호텔|숙박/.test(industry)) return "O";
  return undefined;
}
