-- Migration 20260508180946 created: trg_notify_like, trg_notify_comment, trg_notify_repost, trg_notify_follow
-- Migration 20260509144405 then created a SECOND set on the exact same tables calling the
-- exact same functions: notify_on_like_trg, notify_on_comment_trg, notify_on_repost_trg,
-- notify_on_follow_trg.
--
-- Both sets were left live (the DROP IF EXISTS in each migration only matches its own
-- trigger name), so every like, comment/reply, repost, and follow has been firing its
-- notification function twice — producing two identical notification rows per action.
--
-- This drops the redundant second set and keeps the original trigger for each table.

DROP TRIGGER IF EXISTS notify_on_like_trg ON public.post_likes;
DROP TRIGGER IF EXISTS notify_on_comment_trg ON public.post_comments;
DROP TRIGGER IF EXISTS notify_on_repost_trg ON public.post_reposts;
DROP TRIGGER IF EXISTS notify_on_follow_trg ON public.user_follows;