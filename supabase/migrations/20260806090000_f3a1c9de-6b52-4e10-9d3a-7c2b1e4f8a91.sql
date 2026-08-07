-- The reaction picker in the UI (CommunityReactionButton.tsx) offers 8 reactions:
-- bullish, bearish, strong_hold, insightful, watch, fire, laugh, love — plus 3 legacy
-- ones still rendered for historical data: cautious, support, disagree.
--
-- The original CHECK constraint on post_reactions/comment_reactions only ever allowed:
-- insightful, bullish, cautious, support, disagree, fire.
--
-- That means picking bearish, strong_hold, watch, laugh, or love was being rejected
-- by Postgres on every insert/upsert.
--
-- This finds whatever CHECK constraint currently exists on the "reaction" column
-- (regardless of its exact name) and replaces it with one that allows every
-- reaction id the frontend can send.

DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.post_reactions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%reaction%'
  LOOP
    EXECUTE format('ALTER TABLE public.post_reactions DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_reaction_check
  CHECK (reaction IN (
    'insightful','bullish','bearish','strong_hold','watch','fire','laugh','love',
    'cautious','support','disagree'
  ));

DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.comment_reactions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%reaction%'
  LOOP
    EXECUTE format('ALTER TABLE public.comment_reactions DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.comment_reactions ADD CONSTRAINT comment_reactions_reaction_check
  CHECK (reaction IN (
    'insightful','bullish','bearish','strong_hold','watch','fire','laugh','love',
    'cautious','support','disagree'
  ));