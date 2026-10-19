-- ==============================================================================
-- Yacht Properties (Pty) Ltd - Database & Storage Initialization
-- File: supabase/yacht_console.sql
-- ==============================================================================
-- INSTRUCTIONS FOR THE OWNER / ADMINISTRATOR:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_
-- 2. Navigate to "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- 4. Navigate to "Authentication" -> "Sign Up" settings:
--    - Turn OFF "Allow new users to sign up" (Disable public sign-ups).
--    - Invite or create your developer user under "Authentication" -> "Users".
-- 5. Copy your Project URL and anon public API key into your hosting environment:
--    - VITE_SUPABASE_URL=https://your-project-id.supabase.co
--    - VITE_SUPABASE_ANON_KEY=your-anon-public-key
-- ==============================================================================

-- 1. Create updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLE 1: gallery_items
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Project Showcase',
  caption TEXT,
  album TEXT NOT NULL DEFAULT 'General',
  image_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_published_sort 
  ON gallery_items (published, sort_order);

CREATE INDEX IF NOT EXISTS idx_gallery_items_album 
  ON gallery_items (album);

DROP TRIGGER IF EXISTS trg_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER trg_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 2: site_content
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_site_content_updated_at ON site_content;
CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed standard keys if not present
INSERT INTO site_content (key, value) VALUES
  ('hero_tagline', 'We are You'),
  ('hero_subline', 'South African property and construction specialists built on stewardship, integrity, and enduring community value.'),
  ('services_intro', 'Grounded in rigorous South African standards, ethical craftsmanship, and dependable stewardship across all asset lifecycles.'),
  ('contact_phone', '063 759 0216'),
  ('contact_email', 'sam@yachtmaripane.co.za'),
  ('contact_address', 'Falcon Haven, Terenure, 1619')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- TABLE 3: leads
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  need TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Public Website',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 4: assistant_config
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assistant_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  system_prompt TEXT NOT NULL,
  fact_sheet TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_assistant_config_updated_at ON assistant_config;
CREATE TRIGGER trg_assistant_config_updated_at
  BEFORE UPDATE ON assistant_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial assistant configuration
INSERT INTO assistant_config (id, system_prompt, fact_sheet) VALUES (
  'default',
  'You are the official AI Technical Agent & Operations Officer for Yacht Properties (Pty) Ltd at Falcon Haven. Provide dignified, grounded, South African property and construction guidance.',
  'Yacht Properties (Pty) Ltd. Falcon Haven, Terenure, 1619. Executive: Sam Maripane (063 759 0216). Registrations: CIDB (GB, CE), NHBRC, PPRA. Moto: We are You. Purpose: Stewardship for God''s provision to the people less blessed than me.'
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can view published gallery items" ON gallery_items;
CREATE POLICY "Anon can view published gallery items"
  ON gallery_items FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Authenticated users have full access to gallery items" ON gallery_items;
CREATE POLICY "Authenticated users have full access to gallery items"
  ON gallery_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site content" ON site_content;
CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site content" ON site_content;
CREATE POLICY "Authenticated users can manage site content"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full access to leads" ON leads;
CREATE POLICY "Authenticated users have full access to leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. assistant_config
ALTER TABLE assistant_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full access to assistant config" ON assistant_config;
CREATE POLICY "Authenticated users have full access to assistant config"
  ON assistant_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- EXPLICIT GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- gallery_items
GRANT SELECT ON gallery_items TO anon;
GRANT ALL ON gallery_items TO authenticated;

-- site_content
GRANT SELECT ON site_content TO anon;
GRANT ALL ON site_content TO authenticated;

-- leads (No anon access)
REVOKE ALL ON leads FROM anon;
GRANT ALL ON leads TO authenticated;

-- assistant_config (No anon access)
REVOKE ALL ON assistant_config FROM anon;
GRANT ALL ON assistant_config TO authenticated;

-- ==============================================================================
-- STORAGE CONFIGURATION: "gallery" bucket
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery');
