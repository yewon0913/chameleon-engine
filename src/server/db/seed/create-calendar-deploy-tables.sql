-- 카멜레온 콘텐츠 캘린더
CREATE TABLE IF NOT EXISTS chameleon_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT '릴스',
  status TEXT NOT NULL DEFAULT '기획',
  channels TEXT[] DEFAULT '{}',
  deploy_time TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 카멜레온 배포 관리
CREATE TABLE IF NOT EXISTS chameleon_deploys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES chameleon_calendar(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '대기',
  metrics_views INTEGER DEFAULT 0,
  metrics_likes INTEGER DEFAULT 0,
  metrics_comments INTEGER DEFAULT 0,
  metrics_shares INTEGER DEFAULT 0,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 카멜레온 아웃바운드 잠재고객
CREATE TABLE IF NOT EXISTS chameleon_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT,
  region TEXT,
  instagram_handle TEXT,
  followers INTEGER DEFAULT 0,
  last_post_date DATE,
  contact_status TEXT NOT NULL DEFAULT '미발송',
  message_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 카멜레온 포트폴리오
CREATE TABLE IF NOT EXISTS chameleon_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES chameleon_clients(id) ON DELETE SET NULL,
  project_summary TEXT,
  results JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
