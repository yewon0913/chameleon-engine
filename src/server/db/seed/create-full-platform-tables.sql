-- ═══════════════════════════════════════════
-- 카멜레온 풀 플랫폼 테이블 (기존 + 신규)
-- ═══════════════════════════════════════════

-- 댓글/DM 응답 템플릿
CREATE TABLE IF NOT EXISTS chameleon_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer_options TEXT[] DEFAULT '{}',
  business_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI 오토파일럿 일일 브리핑
CREATE TABLE IF NOT EXISTS chameleon_autopilot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  briefing_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 고객 육성 퍼널
CREATE TABLE IF NOT EXISTS chameleon_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES chameleon_prospects(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 1,
  message_content TEXT,
  status TEXT NOT NULL DEFAULT '대기',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AB 테스트
CREATE TABLE IF NOT EXISTS chameleon_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES chameleon_calendar(id) ON DELETE SET NULL,
  version_a TEXT NOT NULL,
  version_b TEXT NOT NULL,
  version_c TEXT,
  metrics_a JSONB DEFAULT '{}',
  metrics_b JSONB DEFAULT '{}',
  metrics_c JSONB DEFAULT '{}',
  winner TEXT,
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 시즌 캘린더
CREATE TABLE IF NOT EXISTS chameleon_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  reminder_date DATE,
  template_suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
