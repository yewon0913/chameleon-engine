-- =============================================
-- 카멜레온 CRM 전용 테이블 (마케팅/콘텐츠 고객)
-- 정책자금(onestop-engine)과 완전 별도!
-- =============================================

-- 고객 정보
CREATE TABLE IF NOT EXISTS chameleon_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  business_name TEXT,
  sns_instagram TEXT,
  sns_tiktok TEXT,
  sns_youtube TEXT,
  sns_blog TEXT,
  marketing_goal TEXT,
  monthly_budget TEXT,
  status TEXT NOT NULL DEFAULT '문의',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 프로젝트
CREATE TABLE IF NOT EXISTS chameleon_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES chameleon_clients(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  title TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  deadline DATE,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '대기',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상담 메모
CREATE TABLE IF NOT EXISTS chameleon_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES chameleon_clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 신규 고객 설문 (intake)
CREATE TABLE IF NOT EXISTS chameleon_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  sns_channels JSONB DEFAULT '{}',
  current_marketing TEXT,
  desired_services TEXT[],
  goals TEXT[],
  budget TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_chameleon_clients_status ON chameleon_clients(status);
CREATE INDEX IF NOT EXISTS idx_chameleon_projects_client ON chameleon_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_chameleon_notes_client ON chameleon_notes(client_id);
