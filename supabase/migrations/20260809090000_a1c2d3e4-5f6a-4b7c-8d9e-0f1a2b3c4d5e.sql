-- Payment methods for Premium billing (Account > Settings > Payment methods).
-- Only masked/last-4 style data is ever stored here — this is a lightweight record
-- of "which method to charge", not a PCI-scope card vault.
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  method_type text NOT NULL DEFAULT 'mpesa', -- mpesa | card
  label text NOT NULL,
  detail text NOT NULL, -- masked phone (2547••••678) or "•••• 4242 · 08/28"
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payment methods" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own payment methods" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods (user_id);