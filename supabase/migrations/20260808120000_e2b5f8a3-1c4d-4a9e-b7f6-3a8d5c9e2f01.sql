-- Creating a price alert never produced a row in `notifications`, so it never showed
-- up under the Alerts tab on the Notifications page. Client code cannot insert into
-- `notifications` directly (see migration 20260804065838 — INSERT is revoked from
-- anon/authenticated; only SECURITY DEFINER triggers or the service role may insert).
-- This adds that trigger, following the same pattern as the existing like/comment/
-- repost/follow notification triggers.

CREATE OR REPLACE FUNCTION public.notify_on_price_alert_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE direction text; msg text;
BEGIN
  direction := CASE WHEN NEW.alert_type = 'price_above' THEN 'rises above' ELSE 'falls below' END;
  msg := 'We''ll notify you when ' || NEW.symbol || ' ' || direction || ' KES ' || NEW.target_value;
  INSERT INTO notifications (user_id, type, feature, title, message, action_url, entity_id, entity_type)
  VALUES (NEW.user_id, 'alert', 'alerts', NEW.symbol || ' alert created', msg, '/stock/' || NEW.symbol, NEW.id, 'price_alert');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_price_alert_created ON public.price_alerts;
CREATE TRIGGER trg_notify_price_alert_created AFTER INSERT ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_price_alert_created();