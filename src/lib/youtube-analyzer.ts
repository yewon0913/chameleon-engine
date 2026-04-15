/**
 * YouTube API — 경쟁 영상 분석
 */

const KEY = () => process.env.YOUTUBE_API_KEY || "";

interface YTVideo { title: string; channel: string; videoId: string; thumbnail: string }

export async function analyzeCompetitors(keyword: string, max = 5): Promise<YTVideo[]> {
  if (!KEY()) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=${max}&key=${KEY()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      title: item.snippet?.title || "",
      channel: item.snippet?.channelTitle || "",
      videoId: item.id?.videoId || "",
      thumbnail: item.snippet?.thumbnails?.high?.url || "",
    }));
  } catch { return []; }
}
