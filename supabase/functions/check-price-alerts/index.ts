import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, currentPrice } = await req.json();
    console.log('Checking alerts for:', { symbol, currentPrice });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active alerts for this symbol
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('symbol', symbol)
      .eq('is_active', true)
      .is('triggered_at', null);

    if (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }

    const triggeredAlerts = [];

    for (const alert of alerts || []) {
      let triggered = false;

      if (alert.alert_type === 'price_above' && currentPrice >= alert.target_value) {
        triggered = true;
      } else if (alert.alert_type === 'price_below' && currentPrice <= alert.target_value) {
        triggered = true;
      }

      if (triggered) {
        // Mark alert as triggered
        await supabase
          .from('price_alerts')
          .update({ triggered_at: new Date().toISOString() })
          .eq('id', alert.id);

        triggeredAlerts.push(alert);
        console.log('Alert triggered:', alert.id);
      }
    }

    return new Response(JSON.stringify({ 
      checked: alerts?.length || 0,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});