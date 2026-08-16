-- Reporting a post previously only showed a toast — nothing was ever recorded.
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'unspecified',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create own reports" ON public.post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON public.post_reports FOR SELECT USING (auth.uid() = reporter_id);

-- "Not interested" — hide a post from the feed for the person who hid it, without
-- muting/blocking the author outright.
CREATE TABLE IF NOT EXISTS public.hidden_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.hidden_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users hide posts for themselves" ON public.hidden_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own hidden posts" ON public.hidden_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users unhide own hidden posts" ON public.hidden_posts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hidden_posts_user ON public.hidden_posts (user_id);