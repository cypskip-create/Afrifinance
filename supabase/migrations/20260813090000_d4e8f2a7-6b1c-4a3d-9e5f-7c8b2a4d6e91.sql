-- Security audit fixes (2026-08-13)
-- Addresses:
--   1. CRITICAL — Users can grant themselves Premium without paying
--   2. WARNING  — No server-side limit on post/comment size or image payloads
--   3. WARNING  — Public / Signed-in users can execute SECURITY DEFINER functions directly
--   4. Data-integrity gap — payment_methods / post_reports / hidden_posts.user_id has no FK to auth.users
--   5. Defense-in-depth — notifications UPDATE policy had no WITH CHECK
--
-- NOT included (per instruction — private-room self-join items are being left alone):
--   - "Private rooms can be self-joined without an invitation"
--   - "Users can join private rooms without invitation"
--
-- NOTE: email exposure (profiles.email) and notification-forging via direct
-- INSERT were already fixed by migrations 20260803082543 and 20260804065838.
-- If the live Supabase project still flags those as open, it almost certainly
-- means those two migrations (and this one) haven't been run yet — run every
-- pending migration in the SQL Editor, in filename order, not just the newest.

-- ─────────────────────────────────────────────────────────────────────────
-- 1) Premium self-grant: profiles UPDATE was granted on the whole row, so
--    any signed-in user could do
--      supabase.from('profiles').update({ subscription_plan: 'premium_plus' })
--    and RLS (`auth.uid() = user_id`) would happily let it through — RLS
--    controls *which rows*, not *which columns*. Move to column-level grants
--    so clients can only touch the fields that are actually meant to be
--    self-editable. subscription_plan, followers_count, following_count,
--    email, id, user_id, created_at stay server/trigger-controlled only.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  full_name,
  avatar_url,
  banner_url,
  bio,
  handle,
  portfolio_public,
  tradershub_onboarded,
  updated_at
) ON public.profiles TO authenticated;

-- Belt-and-suspenders: even if a future migration re-grants full UPDATE,
-- an explicit CHECK stops subscription_plan from being changed to a paid
-- tier through anything except the service role (billing webhook).
-- Postgres CHECK constraints can't reference OLD, so this is enforced via
-- a trigger instead.
CREATE OR REPLACE FUNCTION public.prevent_self_upgrade()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'subscription_plan can only be changed by the billing system';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_self_upgrade ON public.profiles;
CREATE TRIGGER trg_prevent_self_upgrade
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_upgrade();

-- ─────────────────────────────────────────────────────────────────────────
-- 2) No server-side limit on post/comment size or image payloads.
--    Images are currently stored as base64 data URLs directly in
--    posts.image_url (TEXT, unbounded). Cap both text length and image
--    payload length at the database layer so no client bug/malicious
--    client can write multi-megabyte rows. ~2,500,000 chars is roughly a
--    1.8MB image after base64 expansion — generous for a compressed photo,
--    small enough to stop abuse.
--
--    Added NOT VALID so this migration can't fail (or lock the table for a
--    full scan) if a legacy row already violates it — new/updated rows are
--    enforced immediately either way. Run the VALIDATE CONSTRAINT lines at
--    the bottom of this file once you've confirmed there's no existing
--    oversized data (or cleaned it up), to get the same guarantee for old
--    rows too.
ALTER TABLE public.posts
  ADD CONSTRAINT posts_content_length CHECK (char_length(content) <= 2000) NOT VALID,
  ADD CONSTRAINT posts_image_url_length CHECK (image_url IS NULL OR char_length(image_url) <= 2500000) NOT VALID;

ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_content_length CHECK (char_length(content) <= 1000) NOT VALID;

ALTER TABLE public.room_messages
  ADD CONSTRAINT room_messages_content_length CHECK (char_length(content) <= 2000) NOT VALID;

-- ─────────────────────────────────────────────────────────────────────────
-- 3) SECURITY DEFINER functions run with the *owner's* privileges, not the
--    caller's — so anyone able to EXECUTE one can do anything the function
--    body does, regardless of their own RLS access. Postgres grants EXECUTE
--    to PUBLIC by default on every new function, and PUBLIC includes anon
--    and authenticated. A previous migration tried to lock down
--    is_room_member/is_room_visible with `REVOKE ... FROM anon`, but that
--    only removes the role-specific grant — the underlying PUBLIC grant
--    (which anon inherits from) was never revoked, so both functions
--    remained callable by anyone. Revoke from PUBLIC explicitly everywhere,
--    then re-grant only to the roles that actually need it.

-- Trigger-only functions: nothing outside a trigger should ever call these
-- directly (they read NEW/OLD, so a direct RPC call would just error, but
-- there's no reason to leave the surface open).
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_room_member_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_like() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_repost() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_price_alert_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_self_upgrade() FROM PUBLIC;

-- Helper functions used inside RLS policies: only "authenticated" ever
-- queries rooms/room_members/room_messages (those SELECT policies are
-- `TO authenticated`), so anon never needs to call these at all.
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_room_visible(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_room_visible(uuid, uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 4) Data-integrity gap: user_id columns without a foreign key to
--    auth.users. RLS already prevents cross-user access, this just stops
--    orphaned rows from being written against a user_id that doesn't exist,
--    and cascades cleanup on account deletion like every other user-owned
--    table in this schema already does.
-- NOT VALID for the same reason as the CHECK constraints above — these are
-- new tables so it's unlikely, but this guarantees the migration can't fail
-- on a stray row. VALIDATE lines are at the bottom of the file.
ALTER TABLE public.payment_methods
  ADD CONSTRAINT payment_methods_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.post_reports
  ADD CONSTRAINT post_reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.hidden_posts
  ADD CONSTRAINT hidden_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- ─────────────────────────────────────────────────────────────────────────
-- 5) notifications UPDATE policy only had USING (auth.uid() = user_id),
--    no WITH CHECK — a user could UPDATE a notification they own and
--    reassign its user_id to someone else. Low severity (it's their own
--    notification either way) but trivial to close.
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- OPTIONAL — run once you've verified there's no oversized legacy data
-- (or after cleaning it up). This upgrades the NOT VALID constraints above
-- to fully validated, scanning existing rows once. Safe to run any time;
-- it will simply error and tell you which table still has an offending row.
-- ALTER TABLE public.posts VALIDATE CONSTRAINT posts_content_length;
-- ALTER TABLE public.posts VALIDATE CONSTRAINT posts_image_url_length;
-- ALTER TABLE public.post_comments VALIDATE CONSTRAINT post_comments_content_length;
-- ALTER TABLE public.room_messages VALIDATE CONSTRAINT room_messages_content_length;