-- =============================================
-- 카멜레온 수익 대시보드 전용 테이블
-- =============================================

-- 수익/정산 기록
CREATE TABLE IF NOT EXISTS chameleon_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES chameleon_clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES chameleon_projects(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  service_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT '직접',
  status TEXT NOT NULL DEFAULT '미정산',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 월별 매출 목표
CREATE TABLE IF NOT EXISTS chameleon_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL UNIQUE,
  target_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_chameleon_revenue_client ON chameleon_revenue(client_id);
CREATE INDEX IF NOT EXISTS idx_chameleon_revenue_created ON chameleon_revenue(created_at);
CREATE INDEX IF NOT EXISTS idx_chameleon_revenue_status ON chameleon_revenue(status);
CREATE INDEX IF NOT EXISTS idx_chameleon_goals_month ON chameleon_goals(month);
