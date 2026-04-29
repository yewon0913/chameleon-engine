# 🔴 품질 기준서 v2 (10원칙)

## 제1원칙: "완료" = 실제 사이트에서 고객 눈에 보이는 것
## 제2원칙: 절대 금지 — 시스템 에러 노출 / API 키 / 마크다운 표 그대로
## 제3원칙: Playwright 5기준 100점
## 제4원칙: UI — 카드형 + 핵심요약상단 + 접기 + 칩버튼
## 제5원칙: 크론잡 결과 슬랙 자동 전송
## 제6원칙: "이미 구현됨" 금지 → 스크린샷으로 증명
## 제7원칙: 배포 전 체크리스트 전부 통과

# 🟣 서비스 품질 (제8~12원칙)

## 제8원칙: 마케팅 퀄리티 — 바로 쓸 수 있는 콘텐츠
- 카드뉴스=인스타 즉시 / 릴스=촬영 즉시 / 상세페이지=등록 즉시
- AI냄새 제거: 자연스러운 문장+업종특화 훅+구체적 CTA
- 프롬프트 4단계: 전략(안대장)→카피(AIDA/PAS)→콘텐츠(9템플릿)→실행

## 제9원칙: 경쟁사 벤치마크 매주
- 셀팜/머니몬스터/AI상상력대장/VCAT 비교 → 지면 즉시 개선

## 제10원칙: 데이터 자기진화 — 크론잡으로 매일 KB 자동 수집+갱신

## 제11원칙: 매출=품질 — 무료→유료 전환율 목표
- 무료 1건 체험 → 유료 무제한+OSMU+분석

## 제12원칙: 속도+깊이 균형 — 간단5초/복합15초/전체60초

# 🔶 자율 수익 (제13~15원칙)
## 제13원칙: 자동 유입 — 템플릿560개=SEO키워드560개 / 무료1건→유료무제한
## 제14원칙: 크로스셀 — 카멜레온→원스톱 자동 안내 (역방향도)
## 제15원칙: 고객 성공 = 매출 증가 — 콘텐츠 성과 자동 추적+다음달 자동 제안

---

# 카멜레온 엔진 (Chameleon Engine) — 마케팅부

## 프로젝트 개요
소상공인 마케팅 AI 자동화 SaaS. 카멜레온 브랜드.
- 배포: https://chameleon-engine-nu.vercel.app
- GitHub: https://github.com/yewon0913/chameleon-engine
- 원스톱과 같은 Supabase DB 공유 (chameleon_ 접두사)

## 최근 업데이트 (2026-04-19)
- 멀티모델 영상: Veo 3.1 Fast -> Kling 3 -> Kling 2.5 자동 폴백
- ElevenLabs 나레이션: 스크립트 자동 추출 + multilingual_v2
- 이미지: 음식->Ideogram V3, 기타->FLUX 2 Pro
- 영상 프롬프트: AI Scene 1~4 추출, 9:16 세로, 5/10초 선택
- Hermes QA: chameleon-qa.py (13.7KB)
- Voicebox TTS 병행 사용 (~/voicebox/)

## 기술 스택
- Next.js 16 + TypeScript + Tailwind CSS 4
- tRPC + Drizzle ORM + Supabase PostgreSQL
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- 이미지: Nano Banana 2 (Gemini 3.1 Flash Image) + FLUX 2.0
- 영상: Veo 3.1 Fast (메인) -> Kling 3 -> Kling 2.5 Turbo Pro (폴백)
- TTS: Voicebox 우선 (로컬, 무료) -> ElevenLabs 폴백 (클라우드, 유료)

## Voicebox 연동 규칙
- 나레이션 생성 시 항상 Voicebox 먼저 시도
- Voicebox 서버 다운 시 자동으로 ElevenLabs 폴백
- 파일: src/lib/voicebox.ts (Voicebox API) + src/lib/elevenlabs.ts (통합 래퍼)
- API: POST http://localhost:17493/generate { text, language: "ko", voice_prompt: null }
- 주의: Voicebox는 로컬 서버 — 맥북이 켜져 있어야 작동
- 차트: Recharts
- Vercel 배포 (ICN 서울)

## 디자인 시스템
- 배경: #0a0a0a (다크 럭셔리)
- 카드: #141414 + border rgba(255,255,255,0.06)
- 골드 강조: #D4AF37
- 카멜레온 그라디언트: 보라→에메랄드→골드→핑크

## 에이전트 구조 (마케팅부)

### 콘텐츠부
| 역할 | 이름 | 담당 |
|------|------|------|
| 부장 | 콘텐츠 디렉터 | /content 5탭 + OSMU + 해시태그 |
| 사원1 | 릴스 크리에이터 | 릴스 스크립트 + fal.ai 영상 생성 |
| 사원2 | 블로그 라이터 | 블로그/카드뉴스/SNS 캡션 |

### 영업부
| 역할 | 이름 | 담당 |
|------|------|------|
| 부장 | 영업 매니저 | /outbound 잠재고객 발굴 + CRM |
| 사원3 | 잠재고객 헌터 | prospect-finder + marketing-score |
| 사원4 | 메시지 마스터 | AI 영업 메시지 자동 생성 |

### 분석부
| 역할 | 이름 | 담당 |
|------|------|------|
| 부장 | 데이터 분석관 | /analytics + /revenue + /simulator |
| 인턴1 | 리포트 담당 | 상권 리포트 + Before/After |

### AI 앵커부 (신규)
| 역할 | 이름 | 담당 |
|------|------|------|
| AI 앵커 | 하나 (여성) | 정책/희망 뉴스 |
| AI 앵커 | 준호 (남성) | 긴급/경제 뉴스 |

## 4탭 구조

| 메인 탭 | 서브 탭 | 라우트 |
|---------|--------|--------|
| 📝 콘텐츠 | 릴스/블로그/카드뉴스/상세/SNS/해시태그 | /content |
| 👥 고객 | 잠재고객발굴/CRM/영업메시지/포트폴리오 | /customers |
| 📊 분석 | 마케팅점수/상권리포트/시뮬레이션/수익 | /analytics |
| ⚙️ 설정 | 오토파일럿/캘린더/배포 | /settings |

기존 19개 라우트는 직접 접속 시 유지.

## API 유틸 (11개)

| 파일 | 용도 |
|------|------|
| kakao-api.ts | 키워드/카테고리 검색 |
| naver-api.ts | 지역/블로그 검색 |
| semas-commercial.ts | 소진공 상가 API |
| commercial-analysis.ts | 3중 통합 상권분석 |
| fal-client.ts | fal.ai 설정 |
| image-generator.ts | FLUX 이미지 생성 |
| video-generator.ts | Kling 영상 생성 |
| prospect-finder.ts | 잠재고객 발굴 |
| marketing-score.ts | 마케팅 건강점수 |
| news-collector.ts | 정책 뉴스 RSS 수집 |
| anchor-generator.ts | AI 앵커 이미지 생성 |

## tRPC 라우터 (21개)

chameleon, content, crm, revenue, calendar, deploy, outbound,
portfolio, analytics, report, osmu, hashtag, simulator, templates,
autopilot, funnel, abtest, prospect, marketingScore, contentGenerate, news

## 환경변수
```
DATABASE_URL
ANTHROPIC_API_KEY
KAKAO_REST_API_KEY
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
DATA_GO_KR_API_KEY
FAL_KEY
```

## Git 규칙
- 브랜치: main
- Vercel 자동배포
- commit에 Co-Authored-By 포함

---

## 📋 총괄전략기획팀 (카멜레온 미션)
- 마케팅 자동화 시장 (오파독/캔바/재스퍼 모니터링)
- 카멜레온 구축 목표: 3개월 내 월 3건
- AI 디자인 커뮤니티 트렌드 (58,000줄 분석 완료)

## 🔍 데이터수집분석팀 (카멜레온 미션)
- 업종별 마케팅 벤치마크 수집
- 릴스 바이럴 패턴 10가지 업데이트
- AI 인플루언서 12개 모니터링
- 고객 콘텐츠 성과 → 프롬프트 개선

## ✅ 품질검수팀 (카멜레온 규칙)
- 콘텐츠 품질: 실제 사용 가능 수준
- 잠재고객 발굴: 전화/주소 정확한지
- 마케팅 점수: 0~100 정확한지
- 4탭 + 모바일 하단 네비 정상
- FLUX/Kling API 정상 호출

## 🤝 고객성공팀 (카멜레온 미션)
- 구축 고객 사후 관리 1개월
- 월간 마케팅 성과 리포트
- 포트폴리오 Before/After 수집

---

## gstack 활용 (카멜레온)
- 코드 수정 후 → /review
- 배포 전 → /qa 브라우저 테스트
- UI 변경 → /plan-design-review

---

## gstack 33개 스킬 활용
- UI 변경 → /plan-design-review
- PR 전 → /review
- 배포 전 → /qa + /cso
- 배포 → /ship → /document-release → /learn

## 🔄 자동 업그레이드 (주 2회)
- 화: /retro → 콘텐츠 품질 점검
- 금: /qa → 전 페이지 테스트 → /ship
- 트렌드 반영 → 템플릿 갱신

## 🧠 에이전트 마인드
- 대표 지시 전에 발견+해결+보고!
- 상담 데이터 → 자동 학습
- 품질 하락 → 자동 수정
- 경쟁사 변화 → 자동 대응

---

## 🔄 자동 업그레이드 (카멜레온)
- 화/금 주 2회 자가진단+업그레이드
- 콘텐츠 트렌드 반영

---

## 👥 부서 판단 규칙
- 콘텐츠부: 3초 후킹, AI냄새 금지, 스크립트+텍스트만
- 영업부: 팔지 마라 문제 해결, 스팸 금지, 신규만
- 품질검수: 코드≠실동작, 브라우저 필수, 95% 미만 즉시 수정
- 개발부: 빌드0에러, 하드코딩 금지, 테스트 없는 배포 금지
- 고객성공: 한 명도 놓치지 않음, 공감 있는 답변
- R&D: 새 도구 먼저 찾아서 보고, 연구+분석+제안만

---

## 🆕 신기능 로드맵 (2026 Q2)

### 1. 음식 사진 AI 생성
- 메뉴판/배달앱 썸네일 자동 생성
- FLUX 2 Pro + 음식 전용 프롬프트
- 탑다운/45도/클로즈업 3종 자동

### 2. 제품 광고 영상 프롬프트
- Veo3/Sora/Kling 파이프라인
- 5초/15초/30초 자동 분기
- 업종별 템플릿 (뷰티/푸드/패션/제품)

### 3. SEO/GEO AI 검색 최적화
- GPT/Claude 검색 노출 최적화 (GEO)
- 네이버 블로그 SEO + 구글 SEO 동시
- AI가 추천하는 브랜드 되기 전략

### 4. 인스타 자동 게시 API
- Instagram Graph API + 예약 발행
- 카멜레온 콘텐츠 → 원클릭 발행
- 최적 시간대 자동 스케줄링

### 5. 5명 전문가 콘텐츠 시스템
| 역할 | 이름 | 담당 |
|------|------|------|
| ToolMaster | 도구 전문가 | AI 도구 리뷰+비교 |
| TrendGuru | 트렌드 분석 | 업종별 트렌드 리포트 |
| ContentPro | 콘텐츠 기획 | OSMU 전략+시리즈 기획 |
| VisualWhiz | 비주얼 전문 | 이미지/영상 프롬프트 |
| QualityLead | 품질 관리 | 출력물 검수+피드백 |
