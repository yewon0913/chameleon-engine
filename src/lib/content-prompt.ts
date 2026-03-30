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
