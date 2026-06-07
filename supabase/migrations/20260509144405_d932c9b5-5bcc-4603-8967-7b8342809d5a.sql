
-- Comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comment likes viewable by everyone" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Comment reposts
CREATE TABLE IF NOT EXISTS public.comment_reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);
ALTER TABLE public.comment_reposts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comment reposts viewable by everyone" ON public.comment_reposts FOR SELECT USING (true);
CREATE POLICY "Users can repost comments" ON public.comment_reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unrepost comments" ON public.comment_reposts FOR DELETE USING (auth.uid() = user_id);

-- Quote post columns
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS quoted_post_id uuid;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS quoted_comment_id uuid;

-- Attach notification triggers
DROP TRIGGER IF EXISTS notify_on_like_trg ON public.post_likes;
CREATE TRIGGER notify_on_like_trg AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

DROP TRIGGER IF EXISTS notify_on_comment_trg ON public.post_comments;
CREATE TRIGGER notify_on_comment_trg AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

DROP TRIGGER IF EXISTS notify_on_repost_trg ON public.post_reposts;
CREATE TRIGGER notify_on_repost_trg AFTER INSERT ON public.post_reposts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_repost();

DROP TRIGGER IF EXISTS notify_on_follow_trg ON public.user_follows;
CREATE TRIGGER notify_on_follow_trg AFTER INSERT ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();
