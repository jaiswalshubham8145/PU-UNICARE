-- =====================================================
-- Phase 2, Feature 5: Knowledge Base
-- =====================================================

-- 1. FAQ Categories
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT, -- Lucide icon name
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. FAQ Articles
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- Categories: Read everyone, Write admins only
  CREATE POLICY "Public read categories" ON public.knowledge_categories FOR SELECT USING (true);
  
  -- Articles: Read published everyone, Write admins only
  CREATE POLICY "Public read articles" ON public.knowledge_articles 
    FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.knowledge_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_search ON public.knowledge_articles USING GIN(to_tsvector('english', title || ' ' || content));

-- Seed some initial data
INSERT INTO public.knowledge_categories (name, icon, description, display_order) VALUES
  ('General', 'HelpCircle', 'General questions about the system', 1),
  ('Maintenance', 'Wrench', 'Specifics about repairs and maintenance', 2),
  ('IT Services', 'Wifi', 'Wi-Fi, Login, and Portal issues', 3),
  ('Housekeeping', 'SprayCan', 'Cleaning and sanitation', 4)
ON CONFLICT DO NOTHING;
