
-- Nested replies
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON public.post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  type text NOT NULL,
  feature text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  entity_id uuid,
  entity_type text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Like notification
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_owner uuid; actor_name text;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NULL OR post_owner = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.user_id;
  INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
  VALUES (post_owner, NEW.user_id, 'like', 'tradershub', 'New like', actor_name || ' liked your post', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_like ON public.post_likes;
CREATE TRIGGER trg_notify_like AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Comment / Reply notification
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_owner uuid; parent_owner uuid; actor_name text;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.user_id;

  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_owner FROM post_comments WHERE id = NEW.parent_comment_id;
    IF parent_owner IS NOT NULL AND parent_owner <> NEW.user_id THEN
      INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
      VALUES (parent_owner, NEW.user_id, 'reply', 'tradershub', 'New reply', actor_name || ' replied to your comment', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
    END IF;
  ELSIF post_owner IS NOT NULL AND post_owner <> NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
    VALUES (post_owner, NEW.user_id, 'comment', 'tradershub', 'New comment', actor_name || ' commented on your post', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_comment ON public.post_comments;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Repost notification
CREATE OR REPLACE FUNCTION public.notify_on_repost()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_owner uuid; actor_name text;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  IF post_owner IS NULL OR post_owner = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.user_id;
  INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
  VALUES (post_owner, NEW.user_id, 'repost', 'tradershub', 'New repost', actor_name || ' reposted your post', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_repost ON public.post_reposts;
CREATE TRIGGER trg_notify_repost AFTER INSERT ON public.post_reposts FOR EACH ROW EXECUTE FUNCTION public.notify_on_repost();

-- Follow notification
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor_name text;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.follower_id;
  INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow', 'social', 'New follower', actor_name || ' started following you', '/profile/' || NEW.follower_id, NEW.follower_id, 'user');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_notify_follow ON public.user_follows;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.user_follows FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
