// 카멜레온 콘텐츠 공장 — AI 프롬프트 빌더

const HOOKING_TYPES = `후킹 카피 10유형:
1. 결과→궁금: "매출 300% 올린 비밀? 이것 하나 바꿨습니다"
2. 상식파괴: "광고비 0원인데 매출이 3배? 이게 가능합니다"
3. 충격사실: "99%가 모르는 인스타 알고리즘의 진실"
4. 비교형: "이걸 모르면 경쟁사에 매출 다 뺏깁니다"
5. 리스트형: "2026년 반드시 해야 할 마케팅 TOP 5"
6. 질문형: "왜 당신의 매장에만 손님이 안 올까?"
7. 경고형: "이거 안 하면 6개월 안에 폐업합니다"
8. 비밀공개: "월 매출 1억 사장님들의 공통점"
9. 트렌드형: "2026 하반기, 이 업종이 뜹니다"
10. 공감형: "사장님, 혼자 다 하느라 힘드시죠?"`;

const VIDEO_PROMPT_GUIDE = `영상 프롬프트 4요소 (반드시 포함):
- Scene: 배경, 소품, 색감, 공간 구성
- Camera: 앵글, 거리, 이동 (close-up, wide, tracking, aerial 등)
- Motion: 피사체 동작, 전환 효과, 속도 변화
- Lighting: 조명 방향, 색온도, 그림자, 분위기

영상 스타일별 특징:
1. 뷰티 광고: 시네마틱 클로즈업, 소프트 조명, 느린 모션, 파스텔/골드 톤
2. 푸드 플레이팅: 탑다운 앵글, ASMR 연출, 따뜻한 자연광, 텍스처 강조
3. 제품 광고: 미니멀 배경, 360도 회전, 스팟 조명, 프리미엄 느낌
4. 패션 에디토리얼: 하이엔드, 드라마틱 조명, 슬로우모션 워킹, 시네마 컬러
5. 자동차/럭셔리: 시네마틱 트래킹, 반사광 활용, 다이내믹 앵글, 다크 톤
6. 팝아트/뮤직비디오: 비비드 컬러, 그래픽 전환, 빠른 컷, 네온 조명
7. 브이로그: 자연스러운 핸드헬드, 따뜻한 톤, 일상적 구도
8. 정보형 릴스: 텍스트 오버레이 중심, 깔끔한 배경, 빠른 전환
9. Before/After: 스플릿 스크린, 드라마틱 변환, 임팩트 사운드
10. 스토리텔링: 감성적 시퀀스, 보케 효과, 내레이션 호흡 맞춤`;

export function buildReelsPrompt(opts: {
  industry: string;
  videoStyle: string;
  productName: string;
  coreMessage?: string;
}): string {
  return `당신은 SNS 숏폼 콘텐츠 전문 프로듀서이자 AI 영상 프롬프트 전문가입니다.

${VIDEO_PROMPT_GUIDE}

${HOOKING_TYPES}

## 요청 정보
- 업종: ${opts.industry}
- 영상 스타일: ${opts.videoStyle}
- 제품/서비스명: ${opts.productName}
${opts.coreMessage ? `- 핵심 메시지: ${opts.coreMessage}` : ""}

## 출력 형식 (마크다운)

### 🎬 영상 프롬프트 (Kling 3.0 / Veo 3.1용)
Scene, Camera, Motion, Lighting 4요소를 영어로 작성. 15~20초 분량.
구체적이고 시각적으로 상상 가능하게 작성하세요.

### 🖼️ 이미지 프롬프트 (FLUX / Midjourney용)
영상의 핵심 장면을 정지 이미지로 만들 수 있는 프롬프트 2개.
영어로 작성, 스타일/구도/조명/분위기 포함.

### 📝 후킹 캡션 3종
1. **인스타그램**: 후킹 1줄 + 본문 3줄 + CTA 1줄 + 해시태그 5개
2. **틱톡**: 화면 텍스트 SEO 문구 3줄 + 캡션 2줄 + 해시태그 3개 (2026년 기준 화면 텍스트가 캡션보다 중요)
3. **유튜브 쇼츠**: 제목(40자 이내) + 설명 2줄 + 태그 5개

### #️⃣ 해시태그 추천
- 인스타그램: 대형(100만+) 3개 + 중형(1만~100만) 5개 + 소형(1만 미만) 7개 = 총 15개
- 틱톡: 트렌드 태그 3개 + 니치 태그 3개 = 총 6개
- 유튜브: 검색 키워드 5개

### ⏰ 업로드 타이밍
- 인스타그램: 최적 요일/시간 + 이유
- 틱톡: 최적 요일/시간 + 이유
- 유튜브: 최적 요일/시간 + 이유

모든 캡션은 한국어로, 프롬프트는 영어로 작성하세요.
업종과 제품 특성에 맞게 최적화하세요.`;
}

export function buildDetailPagePrompt(opts: {
  platform: string;
  serviceName: string;
  priceRange: string;
  usp: string;
  targetCustomer: string;
}): string {
  return `당신은 상세페이지 전문 카피라이터이자 웹 디자이너입니다.

## 요청 정보
- 플랫폼: ${opts.platform}
- 서비스/상품명: ${opts.serviceName}
- 가격대 (패키지): ${opts.priceRange}
- 핵심 USP: ${opts.usp}
- 타겟 고객: ${opts.targetCustomer}

## 출력 형식 (마크다운)

### 📄 상세페이지 구조

#### 1. 히어로 섹션 (후킹)
- 메인 카피 (후킹 문장 1줄)
- 서브 카피 (혜택 요약 1~2줄)
- CTA 버튼 문구

#### 2. 문제 제기 섹션
- 타겟 고객의 페인포인트 3가지
- 공감 문구

#### 3. 해결책 섹션
- 서비스/상품 소개
- USP 3가지를 카드형으로

#### 4. 패키지/가격표
- 3단계 패키지 (비교표 형태)
- 각 패키지별 포함 항목
- 추천 패키지 강조

#### 5. 사회적 증거
- 후기/리뷰 예시 3개
- 숫자 강조 (고객 수, 만족도 등)

#### 6. FAQ
- 예상 질문 5개 + 답변

#### 7. 최종 CTA
- 마감 효과 문구 (긴급성)
- CTA 버튼 문구 2종

### 🖼️ 이미지 프롬프트
- 히어로 배너용 이미지 프롬프트 (영어)
- 아이콘/일러스트 프롬프트 3개 (영어)

### 💻 HTML 코드
상세페이지 전체를 HTML+인라인CSS로 작성하세요.
- 모바일 반응형 (max-width: 720px)
- 다크 모드 (#0a0a0a 배경, 오렌지 #FF6B35 포인트)
- 깔끔한 타이포그래피
- 플랫폼(${opts.platform})에 맞는 스타일

한국어로 작성하세요.`;
}

export function buildBlogPrompt(opts: {
  topic: string;
  platform: string;
  length: string;
  tone: string;
}): string {
  const lengthMap: Record<string, string> = {
    short: "1,000~1,500자",
    medium: "2,000~2,500자",
    long: "3,000~4,000자",
  };
  const toneMap: Record<string, string> = {
    info: "정보 전달형 (객관적, 데이터 중심)",
    emotional: "감성형 (스토리텔링, 경험 공유)",
    expert: "전문가형 (깊이 있는 분석, 인사이트)",
    friendly: "친근형 (대화체, 쉬운 설명)",
  };
  const platformGuide: Record<string, string> = {
    naver: "네이버 블로그: 스마트블록 최적화, 키워드 반복 3~5회, 소제목(h2/h3) 활용, 이미지 최소 5장 위치 표시, 맞춤법 주의",
    tistory: "티스토리: 구글 SEO 최적화, 메타 디스크립션 160자, 내부 링크 구조, 스키마 마크업 고려",
    wordpress: "워드프레스: Yoast SEO 기준 최적화, 키워드 밀도 1~2%, 외부 링크 2~3개, Alt 태그 포함",
  };

  return `당신은 SEO 전문 블로그 작성자입니다.

${HOOKING_TYPES}

## 요청 정보
- 주제/키워드: ${opts.topic}
- 플랫폼: ${platformGuide[opts.platform] || opts.platform}
- 글 길이: ${lengthMap[opts.length] || opts.length}
- 톤: ${toneMap[opts.tone] || opts.tone}

## 출력 형식 (마크다운)

### 📌 제목 3종 (A/B 테스트용)
1. 검색 최적화형 (키워드 포함)
2. 호기심 유발형 (후킹)
3. 숫자/리스트형

### 📝 본문
- 도입: 후킹 + 문제 제기 (전체의 10%)
- 본론: 핵심 정보 + 사례 (전체의 70%)
- 결론: 요약 + CTA (전체의 20%)
- 소제목(##)으로 구분
- 핵심 키워드 자연스럽게 3~5회 반복
- [이미지: 설명] 형태로 이미지 삽입 위치 표시

### 🔍 메타 디스크립션
- 150~160자, 키워드 포함, 클릭 유도

### 🏷️ 태그 추천
- 메인 키워드 3개 + 롱테일 키워드 5개 + 관련 키워드 5개

한국어로 작성하세요.`;
}

export function buildCardNewsPrompt(opts: {
  topic: string;
  pages: string;
  style: string;
}): string {
  const styleGuide: Record<string, string> = {
    info: "정보형: 팩트 중심, 숫자 강조, 깔끔한 레이아웃",
    story: "스토리형: 시간 흐름/여정, 감성적 전개, 인물 중심",
    compare: "비교형: 표/그래프 활용, Before/After, 장단점 대비",
  };

  return `당신은 카드뉴스 전문 디자이너이자 카피라이터입니다.

${HOOKING_TYPES}

## 요청 정보
- 주제: ${opts.topic}
- 장수: ${opts.pages}장
- 스타일: ${styleGuide[opts.style] || opts.style}

## 출력 형식 (마크다운)

### 📱 카드뉴스 ${opts.pages}장 구성

각 장마다:
**[N장] 제목**
- 메인 텍스트 (20자 이내)
- 서브 텍스트 (40자 이내)
- CTA/강조 포인트 (해당 시)
- 레이아웃 가이드 (텍스트 위치, 정렬)

구성 규칙:
- 1장: 후킹 표지 (제목 + 서브 카피)
- 2~${Number(opts.pages) - 1}장: 본문 (핵심 내용)
- ${opts.pages}장: CTA (팔로우/저장 유도)

### 🎨 디자인 가이드
- 컬러 팔레트: 메인 + 서브 + 포인트 + 배경 (Hex 코드)
- 폰트: 제목용 + 본문용 추천 (무료 폰트 기준)
- 레이아웃: 여백, 정렬, 이미지 배치 가이드
- 사이즈: 1080×1080px (인스타 정사각형)

### 🖼️ 이미지 프롬프트 (장별)
각 장에 사용할 배경/일러스트 이미지 프롬프트 (영어)

한국어로 작성하세요.`;
}

export function buildProfilePrompt(opts: {
  industry: string;
  targetCustomer: string;
  keywords: string;
  brandTone: string;
}): string {
  const toneGuide: Record<string, string> = {
    expert: "전문가: 신뢰감, 깔끔, 데이터 기반",
    friendly: "친근: 이모지 활용, 대화체, 따뜻한 느낌",
    luxury: "럭셔리: 미니멀, 영문 혼용, 절제된 표현",
    casual: "캐주얼: 트렌디, 밈/유행어 활용, 재미 요소",
  };

  return `당신은 SNS 브랜딩 전문가입니다.

## 요청 정보
- 업종: ${opts.industry}
- 타겟 고객: ${opts.targetCustomer}
- 핵심 키워드: ${opts.keywords}
- 브랜드 톤: ${toneGuide[opts.brandTone] || opts.brandTone}

## 출력 형식 (마크다운)

### 📸 Instagram 프로필
- **Name 필드**: 검색 최적화 (업종 키워드 포함, 30자 이내)
- **바이오 3줄**:
  - 1줄: 한 줄 소개 (누구인지)
  - 2줄: 핵심 가치/혜택
  - 3줄: CTA (링크/DM 유도)
- **카테고리**: 추천 카테고리
- **하이라이트 구성**: 5~7개 (이름 + 아이콘 추천)
- **프로필 이미지 가이드**

### 🎵 TikTok 프로필
- **Name**: 기억하기 쉬운 이름 (15자 이내)
- **바이오**: 2줄 (후킹 + CTA)
- **계정 유형**: 추천 (개인/비즈니스/크리에이터)
- **고정 영상 전략**: 상단 3개 추천 주제

### 📺 YouTube 프로필
- **채널명**: 검색 + 브랜딩 최적화
- **채널 설명**: 3~4줄 (키워드 자연 포함)
- **키워드**: 10개 (채널 태그)
- **배너 사이즈**: 2560×1440px 가이드
- **배너 이미지 프롬프트** (영어)

### 🧵 Threads 프로필
- **바이오**: 1~2줄 (위트 있게)
- **관련 태그**: 3~5개

### ✅ 전 채널 통일 체크리스트
- [ ] 프로필 사진 통일 (같은 이미지/로고)
- [ ] 컬러 톤 통일
- [ ] 소개 메시지 핵심 키워드 통일
- [ ] 링크 연동 (인스타↔틱톡↔유튜브)
- [ ] 비즈니스 계정 전환 완료
- [ ] 연락처/위치 정보 입력

### 🔗 UTM 링크 가이드
각 채널별 UTM 파라미터 예시:
- Instagram: ?utm_source=instagram&utm_medium=bio&utm_campaign=profile
- TikTok: ?utm_source=tiktok&utm_medium=bio&utm_campaign=profile
- YouTube: ?utm_source=youtube&utm_medium=description&utm_campaign=profile

한국어로 작성하세요.`;
}
