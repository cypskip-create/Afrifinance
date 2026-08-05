CREATE TABLE public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('insightful','bullish','cautious','support','disagree','fire')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_reactions TO authenticated;
GRANT ALL ON public.post_reactions TO service_role;
GRANT SELECT ON public.post_reactions TO anon;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post reactions" ON public.post_reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members add their own post reactions" ON public.post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members change their own post reactions" ON public.post_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members remove their own post reactions" ON public.post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_post_reactions_updated_at BEFORE UPDATE ON public.post_reactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('insightful','bullish','cautious','support','disagree','fire')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comment_reactions TO authenticated;
GRANT ALL ON public.comment_reactions TO service_role;
GRANT SELECT ON public.comment_reactions TO anon;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reply reactions" ON public.comment_reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members add their own reply reactions" ON public.comment_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members change their own reply reactions" ON public.comment_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members remove their own reply reactions" ON public.comment_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_comment_reactions_updated_at BEFORE UPDATE ON public.comment_reactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();