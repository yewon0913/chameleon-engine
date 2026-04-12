/**
 * Buffer API 클라이언트 — SNS 자동 예약 게시
 * 키 확보 후 즉시 작동!
 */

const BUFFER_API = "https://api.bufferapp.com/1";

interface BufferPost {
  text: string;
  media?: { link: string }[];
  scheduled_at?: string;
  profile_ids: string[];
}

export async function getProfiles(token: string) {
  const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${token}`);
  return res.json();
}

export async function createPost(token: string, post: BufferPost) {
  const res = await fetch(`${BUFFER_API}/updates/create.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      access_token: token,
      text: post.text,
      profile_ids: JSON.stringify(post.profile_ids),
      ...(post.scheduled_at ? { scheduled_at: post.scheduled_at } : {}),
    }),
  });
  return res.json();
}

export async function publishContent(
  token: string,
  profileIds: string[],
  content: { title: string; body: string; hashtags: string[] }
) {
  const text = `${content.title}\n\n${content.body}\n\n${content.hashtags.join(" ")}`;
  return createPost(token, { text, profile_ids: profileIds });
}
