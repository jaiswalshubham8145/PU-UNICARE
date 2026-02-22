-- =====================================================
-- Phase 2, Feature 7: AI Chatbot Assistant
-- =====================================================

-- 1. CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INT DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own conversations" ON public.chat_conversations
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- For actions taken, intent, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own messages" ON public.chat_messages
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.chat_conversations c
        WHERE c.id = conversation_id AND c.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. CHAT FEEDBACK
CREATE TABLE IF NOT EXISTS public.chat_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  rating INT CHECK (rating IN (1, -1)), -- 1 = Thumbs up, -1 = Thumbs down
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can submit feedback" ON public.chat_feedback
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.chat_messages m
        JOIN public.chat_conversations c ON m.conversation_id = c.id
        WHERE m.id = message_id AND c.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
