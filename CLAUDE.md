# 카멜레온 엔진 (Chameleon Engine) — 마케팅부

## 프로젝트 개요
소상공인 마케팅 AI 자동화 SaaS. 카멜레온 브랜드.
- 배포: https://chameleon-engine.vercel.app
- GitHub: https://github.com/yewon0913/chameleon-engine
- 원스톱과 같은 Supabase DB 공유 (chameleon_ 접두사)

## 기술 스택
- Next.js 16 + TypeScript + Tailwind CSS 4
- tRPC + Drizzle ORM + Supabase PostgreSQL
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- 이미지: Nano Banana 2 (Gemini 3.1 Flash Image) + FLUX 2.0
- 영상: Veo 3.1 (구글, 메인) + Kling 3.0 (fal.ai $0.029/초, 서브)
- 레거시: fal.ai (FLUX + Kling 연동)
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
