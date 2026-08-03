// Lovable AI Gateway - Stock Thesis + News Summary edge function
// Returns a concise investment thesis for a given Kenyan stock, given basic metrics.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ThesisRequest {
  mode?: "thesis" | "news_summary" | "market_insight";
  symbol?: string;
  name?: string;
  sector?: string;
  price?: number;
  changePercent?: number;
  pe?: string | number;
  eps?: string | number;
  dividend?: string | number;
  marketCap?: string;
  scores?: Record<string, number>;
  headlines?: string[];
}

function buildPrompt(body: ThesisRequest): { system: string; user: string } {
  const mode = body.mode || "thesis";
  if (mode === "news_summary") {
    return {
      system:
        "You are a Kenyan equity-research analyst. Summarize headlines in 2-3 short sentences. No emojis. Plain English. No financial advice disclaimers.",
      user: `Stock: ${body.symbol} (${body.name})\nHeadlines:\n${(body.headlines || []).map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\nWrite a 2-3 sentence plain-English summary of what these headlines mean for the stock.`,
    };
  }
  if (mode === "market_insight") {
    return {
      system:
        "You are an NSE market analyst writing one short daily insight for Kenyan retail investors. 2 sentences max. No fluff.",
      user: `Write today's NSE market insight in 2 sentences max. Focus on Safaricom, banking sector, and overall market mood.`,
    };
  }
  return {
    system:
      "You are an equity-research analyst covering the Nairobi Securities Exchange (NSE). Write concise, plain-English investment theses. No emojis, no buy/sell advice, no disclaimers. Use 3 short paragraphs labeled 'Bull case:', 'Bear case:', and 'Verdict:' (one sentence each).",
    user: `Write an investment thesis for ${body.name} (${body.symbol}) listed on NSE.
Sector: ${body.sector}
Price: KES ${body.price}
Day change: ${body.changePercent}%
P/E: ${body.pe}
EPS: ${body.eps}
Dividend: ${body.dividend}
Market cap: ${body.marketCap}
Computed scores (0-100): ${JSON.stringify(body.scores || {})}

Keep total under 90 words.`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require a signed-in user — this endpoint spends AI credits.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" },
    });
    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ThesisRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { system, user } = buildPrompt(body);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `AI gateway: ${t}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
