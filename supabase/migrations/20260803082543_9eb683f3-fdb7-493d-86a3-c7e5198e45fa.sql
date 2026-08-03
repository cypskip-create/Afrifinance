-- 1. Stop exposing member email addresses through the Data API.
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;

-- 2. Notifications may only be created by the database triggers / server role.
DROP POLICY IF EXISTS "System inserts notifications" ON public.notifications;
CREATE POLICY "Only server creates notifications"
ON public.notifications FOR INSERT TO service_role WITH CHECK (true);

-- 3. Private rooms should not be readable by everyone.
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.room_members WHERE room_id = _room_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_room_visible(_room_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = _room_id
      AND (COALESCE(r.is_private, false) = false
           OR r.creator_id = _user_id
           OR public.is_room_member(r.id, _user_id))
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_room_visible(uuid, uuid) FROM anon;

DROP POLICY IF EXISTS "Rooms viewable by everyone" ON public.rooms;
CREATE POLICY "Public rooms and own rooms are viewable"
ON public.rooms FOR SELECT TO authenticated
USING (COALESCE(is_private, false) = false OR creator_id = auth.uid() OR public.is_room_member(id, auth.uid()));

DROP POLICY IF EXISTS "Members viewable by everyone" ON public.room_members;
CREATE POLICY "Members of visible rooms are viewable"
ON public.room_members FOR SELECT TO authenticated
USING (public.is_room_visible(room_id, auth.uid()));

DROP POLICY IF EXISTS "Room messages viewable by everyone" ON public.room_messages;
CREATE POLICY "Messages of visible rooms are viewable"
ON public.room_messages FOR SELECT TO authenticated
USING (public.is_room_visible(room_id, auth.uid()));