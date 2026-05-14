-- 1) Allow public viewing of portfolios when owner has portfolio_public=true
CREATE POLICY "Public can view public portfolios"
ON public.portfolios
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = portfolios.user_id AND p.portfolio_public = true
  )
);

-- 2) Add user preferences table for fine-grained X-style settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  -- Privacy & Safety
  protected_account boolean DEFAULT false,
  allow_dms_from text DEFAULT 'everyone', -- everyone | following | nobody
  allow_tagging text DEFAULT 'everyone',
  show_activity_status boolean DEFAULT true,
  hide_likes boolean DEFAULT false,
  -- Content preferences
  show_sensitive_content boolean DEFAULT false,
  autoplay_videos text DEFAULT 'wifi', -- always | wifi | never
  data_saver boolean DEFAULT false,
  -- Display
  theme text DEFAULT 'system', -- light | dark | system
  font_size text DEFAULT 'default', -- small | default | large
  reduce_motion boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  -- Language & region
  language text DEFAULT 'en',
  timezone text DEFAULT 'Africa/Nairobi',
  -- Notifications (granular)
  notif_likes boolean DEFAULT true,
  notif_comments boolean DEFAULT true,
  notif_reposts boolean DEFAULT true,
  notif_follows boolean DEFAULT true,
  notif_mentions boolean DEFAULT true,
  notif_dms boolean DEFAULT true,
  notif_quality text DEFAULT 'all', -- all | filtered
  email_digest text DEFAULT 'weekly', -- daily | weekly | off
  -- Discoverability
  discoverable_by_email boolean DEFAULT true,
  discoverable_by_phone boolean DEFAULT false,
  personalized_feed boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prefs" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prefs" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prefs" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Blocked / Muted users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own blocks" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users create own blocks" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users delete own blocks" ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS public.muted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id uuid NOT NULL,
  muted_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (muter_id, muted_id)
);
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mutes" ON public.muted_users FOR SELECT USING (auth.uid() = muter_id);
CREATE POLICY "Users create own mutes" ON public.muted_users FOR INSERT WITH CHECK (auth.uid() = muter_id);
CREATE POLICY "Users delete own mutes" ON public.muted_users FOR DELETE USING (auth.uid() = muter_id);

CREATE TABLE IF NOT EXISTS public.muted_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  keyword text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.muted_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own muted keywords" ON public.muted_keywords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own muted keywords" ON public.muted_keywords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own muted keywords" ON public.muted_keywords FOR DELETE USING (auth.uid() = user_id);

-- 4) Rooms backend
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'General',
  room_type text NOT NULL DEFAULT 'text', -- text | live | scheduled
  is_private boolean DEFAULT false,
  is_live boolean DEFAULT false,
  scheduled_at timestamptz,
  topic text,
  cover_url text,
  member_count integer DEFAULT 0,
  online_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms viewable by everyone" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator updates room" ON public.rooms FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creator deletes room" ON public.rooms FOR DELETE USING (auth.uid() = creator_id);

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member', -- member | moderator | host
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable by everyone" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Users join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave rooms" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room messages viewable by everyone" ON public.room_messages FOR SELECT USING (true);
CREATE POLICY "Members post messages" ON public.room_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_messages.room_id AND user_id = auth.uid())
);
CREATE POLICY "Authors delete own messages" ON public.room_messages FOR DELETE USING (auth.uid() = user_id);

-- Maintain member_count automatically
CREATE OR REPLACE FUNCTION public.bump_room_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.rooms SET member_count = member_count + 1 WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.rooms SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER tg_room_member_count
AFTER INSERT OR DELETE ON public.room_members
FOR EACH ROW EXECUTE FUNCTION public.bump_room_member_count();

-- Indexes for perf
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_reposts_post_id ON public.post_reposts (post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members (room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON public.room_messages (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users (blocker_id);
CREATE INDEX IF NOT EXISTS idx_muted_users_muter ON public.muted_users (muter_id);