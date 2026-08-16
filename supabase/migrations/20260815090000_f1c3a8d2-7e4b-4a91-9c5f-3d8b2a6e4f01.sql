-- Settings audit fixes (2026-08-15)
--
-- The Notifications toggles in Settings never actually gated anything —
-- notify_on_comment/notify_on_follow fired unconditionally regardless of
-- the recipient's notif_comments/notif_follows preference. Likes, reposts,
-- and mentions toggles were removed from the UI entirely instead of wired
-- up here: notify_on_like/notify_on_repost exist but there's no UI reason
-- to keep per-type control now that TradersHub settings only expose
-- Comments & replies and New followers, and there is no mention-detection
-- trigger in this schema at all (the old "Mentions" toggle never did
-- anything). If per-type control over likes/reposts is wanted again later,
-- add the same "check preference before inserting" pattern used below.

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_owner uuid; parent_owner uuid; actor_name text; recipient_wants_it boolean;
BEGIN
  SELECT user_id INTO post_owner FROM posts WHERE id = NEW.post_id;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.user_id;

  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_owner FROM post_comments WHERE id = NEW.parent_comment_id;
    IF parent_owner IS NOT NULL AND parent_owner <> NEW.user_id THEN
      SELECT COALESCE(notif_comments, true) INTO recipient_wants_it FROM user_preferences WHERE user_id = parent_owner;
      IF COALESCE(recipient_wants_it, true) THEN
        INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
        VALUES (parent_owner, NEW.user_id, 'reply', 'tradershub', 'New reply', actor_name || ' replied to your comment', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
      END IF;
    END IF;
  ELSIF post_owner IS NOT NULL AND post_owner <> NEW.user_id THEN
    SELECT COALESCE(notif_comments, true) INTO recipient_wants_it FROM user_preferences WHERE user_id = post_owner;
    IF COALESCE(recipient_wants_it, true) THEN
      INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
      VALUES (post_owner, NEW.user_id, 'comment', 'tradershub', 'New comment', actor_name || ' commented on your post', '/traders-hub?post=' || NEW.post_id, NEW.post_id, 'post');
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor_name text; recipient_wants_it boolean;
BEGIN
  IF NEW.follower_id = NEW.following_id THEN RETURN NEW; END IF;
  SELECT COALESCE(notif_follows, true) INTO recipient_wants_it FROM user_preferences WHERE user_id = NEW.following_id;
  IF NOT COALESCE(recipient_wants_it, true) THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name, 'Someone') INTO actor_name FROM profiles WHERE user_id = NEW.follower_id;
  INSERT INTO notifications (user_id, actor_id, type, feature, title, message, action_url, entity_id, entity_type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow', 'social', 'New follower', actor_name || ' started following you', '/profile/' || NEW.follower_id, NEW.follower_id, 'user');
  RETURN NEW;
END $$;

-- Drop columns the UI no longer exposes and that nothing else in the schema
-- reads, so the table stops implying controls that don't exist anywhere:
-- protected_account/allow_tagging/discoverable_by_*/personalized_feed/
-- show_activity_status/reduce_motion/high_contrast/theme/language/timezone/
-- autoplay_videos/data_saver/notif_quality/email_digest/hide_likes/
-- allow_dms_from/notif_likes/notif_reposts/notif_dms.
-- Kept: font_size (genuinely applied via lib/appearance.ts).
ALTER TABLE public.user_preferences
  DROP COLUMN IF EXISTS protected_account,
  DROP COLUMN IF EXISTS allow_tagging,
  DROP COLUMN IF EXISTS discoverable_by_email,
  DROP COLUMN IF EXISTS discoverable_by_phone,
  DROP COLUMN IF EXISTS personalized_feed,
  DROP COLUMN IF EXISTS show_activity_status,
  DROP COLUMN IF EXISTS reduce_motion,
  DROP COLUMN IF EXISTS high_contrast,
  DROP COLUMN IF EXISTS theme,
  DROP COLUMN IF EXISTS language,
  DROP COLUMN IF EXISTS timezone,
  DROP COLUMN IF EXISTS autoplay_videos,
  DROP COLUMN IF EXISTS data_saver,
  DROP COLUMN IF EXISTS notif_quality,
  DROP COLUMN IF EXISTS email_digest,
  DROP COLUMN IF EXISTS hide_likes,
  DROP COLUMN IF EXISTS allow_dms_from,
  DROP COLUMN IF EXISTS notif_likes,
  DROP COLUMN IF EXISTS notif_reposts,
  DROP COLUMN IF EXISTS notif_dms,
  DROP COLUMN IF EXISTS notif_mentions;