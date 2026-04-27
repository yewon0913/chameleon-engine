// 소상공인 마케팅 콘텐츠 생성 프롬프트

// 후킹 카피 가이드 (슈가AI 후킹 트렌드 50개 + 세일즈랩 기반)
const HOOKING_GUIDE = `
## 후킹 카피 유형 (반드시 아래 중 하나를 제목/첫 문장에 사용)

1. **결과→궁금 유형**: 놀라운 결과를 먼저 보여주고 과정을 궁금하게. 예: '매출 2배 올린 사장님의 비밀'
2. **상식파괴 유형**: 일반적 상식을 깨는 의견 제시. 예: '정책자금, 신용점수 낮아도 됩니다'
3. **충격사실 유형**: 대부분 모르는 충격적 사실 전달. 예: '사장님들 90%가 모르는 숨은 지원금'
4. **공감형 유형**: 독자의 고통/고민에 공감. 예: '매달 이자에 허덕이는 사장님께'
5. **숫자형 유형**: 구체적 숫자로 신뢰감 확보. 예: '3분 만에 최대 5억 한도 확인하는 법'
6. **질문형 유형**: 핵심 질문으로 호기심 자극. 예: '아직도 고금리 대출 쓰고 계세요?'
7. **비밀형 유형**: 전문가만 아는 정보 공유. 예: '컨설턴트만 아는 정책자금 꿀팁'
8. **긴급형 유형**: 시간 제한으로 행동 유도. 예: '이번 달까지만 신청 가능한 정책자금'
9. **비교형 유형**: 두 가지를 비교해 가치 부각. 예: '은행 대출 5% vs 정책자금 2.4%'
10. **스토리형 유형**: 실제 사례 기반 스토리텔링. 예: '폐업 직전 사장님이 1억을 받기까지'

## 구체적 숫자 후킹 (반드시 활용)
- "금리 차이만으로 2,500만원 절약" / "정부 예산 728조, 역대 최대"
- "5천만원 5년 기준 이자 차이 2,500만원" / "정책자금 600조+ 시장"
- "캐피탈 19% vs 정책자금 2%, 당신의 선택은?"

## 스토리텔링 BTA 패턴 (성공사례/사례형 콘텐츠 필수 적용)
**Before**(절박한 현실) → **Turning**(방법 발견/전환점) → **After**(성공/변화)
- Before: 고금리 대출에 허덕이던 상황, 정책자금 존재를 몰랐던 시절
- Turning: 전문가 상담을 통해 정책자금 존재를 알게 됨, 재무구조 개선
- After: 저금리로 전환 성공, 이자 부담 대폭 감소, 사업 안정화

## 프레임 전환 기법 (CTA에 적용)
- ❌ "정책자금 받을까 말까" → ✅ "어떤 정책자금이 나에게 맞을까"
- ❌ "상담 받을까 말까" → ✅ "무료 진단이라도 먼저 받아볼까"
- 고객이 '구매 여부'가 아닌 '옵션 선택'을 고민하도록 유도
`.trim();

export function buildThreadPrompt(opts: {
  contentType: string;
  industry?: string;
  keywords: string;
  tone: "expert" | "friendly" | "storytelling";
  length: "short" | "medium" | "long";
}): string {
  const toneMap = { expert: "전문가형 (신뢰감, 데이터 기반)", friendly: "친근한형 (대화체, 공감)", storytelling: "스토리텔링형 (서사, 감정)" };
  const lengthMap = { short: "300자 내외", medium: "500자 내외", long: "800자 내외" };
  const typeMap: Record<string, string> = {
    policy_info: "정책자금 정보 공유 (소상공인이 모르면 손해보는 꿀팁)",
    biz_knowhow: "사업 노하우 공유 (실전 경험 기반 팁)",
    success_story: "고객 성공사례 (실제 사례 기반 스토리)",
    industry_trend: "업종별 트렌드 분석",
    free: "자유 주제",
  };

  return `당신은 소상공인 마케팅 전문 카피라이터입니다. 스레드(Threads) 글을 작성하세요.

## 글 유형: ${typeMap[opts.contentType] || opts.contentType}
## 톤앤매너: ${toneMap[opts.tone]}
## 분량: ${lengthMap[opts.length]}
${opts.industry ? `## 업종: ${opts.industry}` : ""}
## 핵심 키워드: ${opts.keywords}

${HOOKING_GUIDE}

## 작성 규칙
- 첫 줄은 위 후킹 유형 중 하나를 반드시 사용한 강력한 후킹 문장 (스크롤을 멈추게 하는 문장)
- 줄바꿈을 적극 활용하여 가독성 확보
- 핵심 내용은 번호 매기기 또는 불릿 포인트
- 마지막에 CTA (댓글 유도, 팔로우 유도)
- 해시태그 5개를 글 하단에 포함
- 이모지는 절제하되 포인트에만 사용
- 스레드 특성상 짧은 문단, 임팩트 있는 문장

## 출력 형식
글 본문을 먼저 출력하고, 마지막에 빈 줄 후 해시태그 5개를 한 줄에 나열하세요.`;
}

export function buildInstaPrompt(opts: {
  contentType: string;
  industry?: string;
  storeName?: string;
  keywords: string;
  emojiLevel: "many" | "moderate" | "none";
  hashtagCount: 10 | 20 | 30;
}): string {
  const emojiMap = { many: "이모지를 풍부하게 사용 (문장마다)", moderate: "이모지를 적당히 사용 (포인트에만)", none: "이모지 사용하지 않기" };
  const typeMap: Record<string, string> = {
    store_promo: "매장 홍보 (위치, 메뉴, 분위기 소개)",
    event: "이벤트/프로모션 공지",
    new_menu: "신메뉴/신상품 소개",
    review_repost: "고객 후기 리포스팅",
    policy_tip: "정책자금 꿀팁 공유",
    free: "자유 주제",
  };

  return `당신은 인스타그램 마케팅 전문 카피라이터입니다. 인스타그램 캡션을 작성하세요.

## 글 유형: ${typeMap[opts.contentType] || opts.contentType}
${opts.industry ? `## 업종: ${opts.industry}` : ""}
${opts.storeName ? `## 매장명: ${opts.storeName}` : ""}
## 핵심 내용: ${opts.keywords}
## 이모지: ${emojiMap[opts.emojiLevel]}
## 해시태그: ${opts.hashtagCount}개

${HOOKING_GUIDE}

## 작성 규칙
- 첫 줄은 위 후킹 유형 중 하나를 반드시 사용한 강력한 후킹 (질문형, 감탄형, 숫자 활용)
- 줄바꿈으로 가독성 확보
- CTA 포함 (댓글, DM, 방문 유도)
- 글 본문과 해시태그 블록을 분리 (빈 줄 2개로 구분)
- 해시태그는 관련성 높은 것부터 나열
- 한국어 해시태그 위주, 영어 해시태그 3~5개 포함

## 출력 형식
캡션 본문

·
·
·

#해시태그1 #해시태그2 ...`;
}

export function buildBlogPrompt(opts: {
  contentType: string;
  topic: string;
  targetKeyword?: string;
  length: "1000" | "2000" | "3000";
}): string {
  const typeMap: Record<string, string> = {
    policy_guide: "정책자금 가이드 (SEO 최적화, 검색 유입용)",
    startup_guide: "업종별 창업 가이드",
    biz_knowhow: "사업 운영 노하우",
    free: "자유 주제",
  };

  return `당신은 소상공인 전문 블로그 작성자입니다. SEO에 최적화된 블로그 글을 작성하세요.

## 글 유형: ${typeMap[opts.contentType] || opts.contentType}
## 주제: ${opts.topic}
${opts.targetKeyword ? `## 타겟 키워드 (SEO): ${opts.targetKeyword}` : ""}
## 분량: ${opts.length}자 내외

${HOOKING_GUIDE}

## 작성 규칙
- 제목은 위 후킹 유형 중 하나를 반드시 활용하여 SEO 친화적으로 작성 (키워드 포함, 30자 내외)
- H2, H3 소제목 활용하여 구조화
- 타겟 키워드를 자연스럽게 본문에 배치 (키워드 스터핑 금지)
- 도입부에서 독자의 문제/고민을 언급
- 본문에서 해결책/정보를 구체적으로 제시
- 결론에서 핵심 요약 + CTA
- 마크다운 형식으로 작성 (## 제목, ### 소제목, **굵은글씨**, - 리스트)
- 전문적이면서도 읽기 쉬운 톤

## 출력 형식
마크다운 형식으로 제목(#)부터 결론까지 완성된 글을 작성하세요.`;
}

// ═══════════════════════════════════════
// 릴스/숏폼 프롬프트 (20~30초 최적!)
// ═══════════════════════════════════════
export function buildReelsPrompt(opts: {
  industry?: string;
  topic: string;
  style: string;
  duration: "15" | "30" | "60";
}): string {
  return `당신은 릴스/숏폼 전문 크리에이터입니다.

## 업종: ${opts.industry || "일반"}
## 주제: ${opts.topic}
## 스타일: ${opts.style}
## 길이: ${opts.duration}초

${HOOKING_GUIDE}

## 릴스 구조 (반드시 이 순서!)
┌──────────────────────────────┐
│ 1~3초: 후킹 (스크롤 멈추기!) │ → 위 후킹 유형 중 하나!
│ 4~20초: 핵심 (가치 전달!)    │ → 정보/변화/비교/과정
│ 21~25초: 반전 (임팩트!)      │ → "근데 이게 전부가 아니에요"
│ 26~30초: CTA (행동 유도!)    │ → 팔로우/댓글/DM/링크
└──────────────────────────────┘

## 작성 규칙
- 첫 1~3초가 생사를 결정! 세스 고딘 반전 기법 적용!
- 자막 포함 (음소거 시청 70% 대비!)
- 자막은 한 줄 15자 이내!
- 배경음 추천 포함
- 영상 프롬프트 (Veo/Kling용): Scene+Camera+Motion+Lighting 4요소
- 업종별 소구점 자동 매칭

## 안대장 프레임워크 적용
시장조사(타겟 고객 정의) → 기획(핵심 메시지) → 브랜딩(톤/비주얼) → 유통(플랫폼 최적화)

## 출력 형식
1. 릴스 대본 (시간별 구간)
2. 자막 텍스트 (줄 단위)
3. 영상 프롬프트 (AI 영상 생성용)
4. 해시태그 30개
5. 배경음 추천`;
}

// ═══════════════════════════════════════
// 카드뉴스 프롬프트 (5~10장!)
// ═══════════════════════════════════════
export function buildCardNewsPrompt(opts: {
  industry?: string;
  topic: string;
  slides: number;
}): string {
  return `당신은 카드뉴스 전문 디자이너입니다.

## 업종: ${opts.industry || "일반"}
## 주제: ${opts.topic}
## 슬라이드 수: ${opts.slides}장

${HOOKING_GUIDE}

## 카드뉴스 구조
┌─────────────────────────────────────┐
│ 1장: 세스 고딘 반전 후킹!            │ → "99%가 모르는..."
│ 2장: 문제 제기 (공감!)               │ → "이런 경험 있으시죠?"
│ 3~N-2장: 핵심 정보 (1장 1포인트!)    │ → 숫자+시각적!
│ N-1장: 정리/요약                     │ → 핵심 3줄!
│ N장: CTA!                           │ → "저장하고 나중에 보세요!"
└─────────────────────────────────────┘

## 작성 규칙
- 1장 1포인트! 텍스트 50자 이내!
- 숫자/비교/아이콘 적극 활용!
- 배경색 + 폰트 추천 포함
- 인스타 캐러셀 + 쓰레드 호환
- 마지막 장 CTA: 저장/공유/팔로우 유도

## 출력 형식
슬라이드별:
[1장] 제목 / 텍스트 / 배경색 / 레이아웃
[2장] ...
해시태그 20개`;
}

// ═══════════════════════════════════════
// 상세페이지 프롬프트 (전환율 최적화!)
// ═══════════════════════════════════════
export function buildDetailPagePrompt(opts: {
  industry?: string;
  productName: string;
  targetAudience: string;
  keyBenefit: string;
}): string {
  return `당신은 상세페이지 전문 카피라이터입니다. 전환율 최적화(CRO) 기반으로 작성하세요.

## 업종: ${opts.industry || "일반"}
## 제품/서비스: ${opts.productName}
## 타겟 고객: ${opts.targetAudience}
## 핵심 혜택: ${opts.keyBenefit}

${HOOKING_GUIDE}

## 상세페이지 구조 (전환율 극대화!)
┌───────────────────────────────────┐
│ 히어로: 후킹 + 핵심 혜택 1줄     │
│ 문제: 고객의 고통 3가지          │ → PAS 프레임
│ 해결: 우리 제품이 해결!          │ → Before→After
│ 증거: 후기/데이터/인증           │ → 사회적 증거
│ 비교: 경쟁사 vs 우리 (표!)       │
│ 가격: 가치 앵커링               │ → "원래 X만원 → 지금 Y만원"
│ CTA: 지금 바로!                 │ → 긴급성 + 보장
│ FAQ: 자주 묻는 질문 5개         │ → 구매 장벽 제거
└───────────────────────────────────┘

## CRO 원칙
- 5초 테스트: 5초 안에 "이게 뭐고 왜 필요한지" 이해!
- CTA: "지금 신청하기" > "제출" (가치형 > 행동형)
- 사회적 증거: 후기/수치/로고 → 전환율 15~30% 상승
- 긴급성: 진짜 마감만! 가짜 긴급성 = 신뢰 파괴
- 손실 회피: "놓치면 후회" > "얻으면 이득"

## 출력 형식
마크다운으로 전체 상세페이지 작성 (섹션별 구분)`;
}
