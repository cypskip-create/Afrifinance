import { useMemo } from "react";

const tickerSymbols = [
  ["SAFCOM", 17.85, 1.7],
  ["EQTY", 48.50, -1.2],
  ["KCB", 38.20, 0.9],
  ["SCBK", 215.75, 0.4],
  ["COOP", 16.45, 2.1],
  ["EABL", 165.50, -0.6],
  ["ABSA", 17.10, 1.1],
  ["NCBA", 49.85, -0.3],
  ["BAMB", 38.95, -1.9],
  ["BRIT", 5.42, 3.2],
  ["KPLC", 4.18, -2.4],
  ["BAT", 320.00, 0.8],
  ["JUB", 380.00, -0.8],
  ["DTK", 82.00, 1.4],
  ["SBIC", 8.90, 2.0],
] as const;

// A small slice of the board used in the hero panel — just enough rows to
// read as "a real exchange board", not the whole universe.
const boardRows = [
  ["SAFCOM", "Safaricom PLC", 17.85, 1.7],
  ["EQTY", "Equity Group", 48.50, -1.2],
  ["KCB", "KCB Group", 38.20, 0.9],
  ["EABL", "EA Breweries", 165.50, -0.6],
  ["COOP", "Co-op Bank", 16.45, 2.1],
] as const;

const researchModules = [
  {
    code: "R.01",
    title: "Valuation & performance",
    body: "Fair value estimates, valuation multiples against the sector, analyst price targets and how the stock has actually performed against a benchmark.",
  },
  {
    code: "R.02",
    title: "Growth & health",
    body: "Revenue and earnings trends, margins, cash flow, debt load and share dilution — the fundamentals that hold up a price move.",
  },
  {
    code: "R.03",
    title: "Ownership & insider activity",
    body: "See who holds the stock — institutions and insiders — and whether they've been buying or selling recently.",
  },
  {
    code: "R.04",
    title: "Sector heatmap & screener",
    body: "Scan the whole board by sector performance, or filter every listed company down by the exact criteria that matter to you.",
  },
  {
    code: "R.05",
    title: "Compare stocks side by side",
    body: "Line up two or three companies on the same metrics before deciding which one earns a place in your portfolio.",
  },
  {
    code: "R.06",
    title: "AI-generated investment thesis",
    body: "Get a plain-language read on a stock — the bull case, the bear case, and what to watch — generated fresh from its current numbers.",
  },
  {
    code: "R.07",
    title: "Chart indicators, your way",
    body: "Turn on moving averages, EMA, Bollinger Bands, MACD or RSI — or keep the chart clean. Switch chart types anytime, even in fullscreen.",
  },
  {
    code: "R.08",
    title: "Price alerts, on your terms",
    body: "Set a target above or below the current price. Edit it, duplicate it, or add another for the same stock — you're in control.",
  },
];

const trustItems = [
  {
    code: "S.01",
    title: "Row-level data security",
    body: "Your portfolio, watchlist and posts are protected at the database level — not just hidden in the app's interface.",
  },
  {
    code: "S.02",
    title: "You control your privacy",
    body: "Choose whether your portfolio is visible to others, mute or block any account, and report anything that shouldn't be there.",
  },
  {
    code: "S.03",
    title: "Real-time where it counts",
    body: "Price alerts are checked continuously, so you hear about a target the moment it's hit — not sometime after.",
  },
];

const ContinuaLandingPage = () => {
  const tickerItems = useMemo(() => [
    ...tickerSymbols.map(([symbol, price, change]) => ({ symbol, price, change })),
    ...tickerSymbols.map(([symbol, price, change]) => ({ symbol, price, change })),
  ], []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  /* ============================================================
     TOKENS — unchanged from the product's existing palette. Every
     color below is reused as-is; nothing here is a new hue.
     ============================================================ */
  :root{
    --bg:#F9F8F6; --bg-alt:#F2F0EE; --card:#ffffff; --border:#E4E1DD;
    --fg:#16181D; --muted:#6C727F;
    --primary:#6C4FE0; --primary-dark:#5638C4; --primary-tint:#F0ECFC;
    --accent:#FF7A45; --accent-tint:#FFEDE3;
    --bull:#25935F; --bear:#DB3024; --bear-tint:#FCEAE8;
    --radius:10px;
    --shadow: 0 1px 2px rgba(20,20,20,.04), 0 8px 24px -12px rgba(20,20,20,.12);
  }
  *{box-sizing:border-box;}
  html, body, #root{ margin:0; padding:0; scroll-behavior:smooth; }
  body{
    background:var(--bg); color:var(--fg);
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  a{ color:inherit; text-decoration:none; }
  img{ max-width:100%; display:block; }
  .wrap{ max-width:1140px; margin:0 auto; padding:0 24px; }

  /* Display type carries the market-board personality: Space Grotesk for
     headings, IBM Plex Mono for anything that reads as data — ticker
     symbols, prices, eyebrows, index codes. Inter stays for body copy. */
  h1,h2,h3,.display{ font-family:'Space Grotesk',system-ui,sans-serif; letter-spacing:-0.01em; }
  .mono{ font-family:'IBM Plex Mono',ui-monospace,monospace; font-variant-numeric:tabular-nums; }

  a:focus-visible, button:focus-visible, summary:focus-visible, input:focus-visible{
    outline:2px solid var(--primary); outline-offset:2px; border-radius:4px;
  }

  /* ---------- Buttons ---------- */
  .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    height:42px; padding:0 20px; border-radius:8px; font-weight:600; font-size:13.5px;
    font-family:'Space Grotesk',sans-serif;
    border:1px solid transparent; cursor:pointer; transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
    white-space:nowrap;
  }
  .btn:active{ transform:scale(0.97); }
  .btn-primary{ background:linear-gradient(135deg, var(--primary), var(--accent)); color:#fff; box-shadow:0 6px 18px -6px rgba(108,79,224,.45); }
  .btn-primary:hover{ filter:brightness(1.05); }
  .btn-ghost{ background:transparent; color:var(--fg); border-color:var(--border); }
  .btn-ghost:hover{ background:var(--bg-alt); }
  .btn-lg{ height:50px; padding:0 26px; font-size:15px; }

  .eyebrow{
    font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
    color:var(--primary); display:inline-flex; align-items:center; gap:8px; margin-bottom:16px;
  }
  .eyebrow::before{ content:""; width:14px; height:1px; background:var(--primary); }

  /* ============================================================
     SIGNATURE — the ticker strip. It's pinned to the very top of
     the page (no gap above it), and the same scrolling-tape motif
     reappears as texture inside the CTA band further down.
     ============================================================ */
  .ticker-strip{
    position:fixed; top:0; left:0; right:0; z-index:51; height:32px; margin:0;
    background:#101014; color:#fff; overflow:hidden; white-space:nowrap;
    border-bottom:1px solid rgba(255,255,255,.08);
  }
  .ticker-track{
    display:inline-flex; align-items:center; gap:32px; padding:8px 0;
    width:max-content;
    animation:scroll-left 34s linear infinite;
    will-change:transform;
  }
  .ticker-strip:hover .ticker-track{ animation-play-state:paused; }
  .tick{ display:inline-flex; align-items:center; gap:7px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; }
  .tick b{ font-weight:600; }
  .up{ color:#5fd39a; } .down{ color:#f19686; }
  @keyframes scroll-left{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

  header.nav{
    position:fixed; top:32px; left:0; right:0; z-index:50; margin:0; background:rgba(250,247,241,.9); backdrop-filter:blur(10px);
    border-bottom:1px solid var(--border);
  }
  .nav-inner{ display:flex; align-items:center; justify-content:space-between; height:60px; }
  .brand{ display:flex; align-items:center; gap:10px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:17px; letter-spacing:-.01em; }
  .mark{
    width:32px; height:32px; border-radius:8px; flex:none;
    display:inline-flex; align-items:center; justify-content:center;
    font-family:'Space Grotesk',sans-serif; font-weight:700; color:#0d775d; font-size:17px;
    background:#f3efe6;
  }
  nav.links{ display:flex; align-items:center; gap:28px; }
  nav.links a{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); position:relative; padding-bottom:3px; }
  nav.links a::after{ content:""; position:absolute; left:0; right:100%; bottom:0; height:1px; background:var(--accent); transition:right .2s ease; }
  nav.links a:hover{ color:var(--fg); }
  nav.links a:hover::after{ right:0; }
  .nav-cta{ display:flex; align-items:center; gap:10px; }
  .nav-cta .btn{ height:36px; padding:0 16px; font-size:12.5px; }

  /* ---------- Hero ---------- */
  .hero{ padding:56px 0 30px; }
  .hero-grid{ display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center; }
  .hero h1{ font-size:47px; line-height:1.06; font-weight:700; margin:0 0 20px; }
  .hero h1 em{ font-style:normal; color:var(--primary); }
  .hero p.lead{ font-size:17px; line-height:1.6; color:var(--muted); max-width:480px; margin:0 0 30px; }
  .hero-actions{ display:flex; gap:12px; flex-wrap:wrap; margin-bottom:26px; }
  .hero-trust{ display:flex; align-items:center; gap:18px; font-size:12.5px; color:var(--muted); flex-wrap:wrap; }
  .hero-trust span{ display:flex; align-items:center; gap:6px; }

  /* ---------- Signature hero visual: a live exchange board ---------- */
  .board{
    position:relative; background:var(--card); border:1px solid var(--border); border-radius:16px;
    box-shadow:var(--shadow); overflow:hidden;
  }
  .board-head{ display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid var(--border); }
  .board-head .label{ font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
  .board-live{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--bull); }
  .board-live .dot{ width:6px; height:6px; border-radius:50%; background:var(--bull); animation:pulse 1.8s ease-in-out infinite; }
  @keyframes pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.35; } }
  .board-cols{ display:grid; grid-template-columns:1.5fr .9fr .8fr; padding:9px 18px; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--border); }
  .board-row{ display:grid; grid-template-columns:1.5fr .9fr .8fr; align-items:center; padding:12px 18px; border-bottom:1px solid var(--border); }
  .board-row:last-of-type{ border-bottom:none; }
  .board-sym{ font-weight:600; font-size:13px; }
  .board-name{ font-size:10.5px; color:var(--muted); margin-top:1px; }
  .board-price{ font-family:'IBM Plex Mono',monospace; font-size:13px; text-align:right; }
  .board-chg{ font-family:'IBM Plex Mono',monospace; font-size:12px; text-align:right; }
  .board-foot{ padding:10px 18px; font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--muted); background:var(--bg-alt); }
  .board-flag{
    position:absolute; top:16px; right:-10px; background:var(--fg); color:#fff; font-family:'IBM Plex Mono',monospace;
    font-size:10px; font-weight:600; letter-spacing:.05em; padding:5px 12px; border-radius:999px; box-shadow:var(--shadow);
  }

  section{ padding:80px 0; scroll-margin-top:92px; }
  .section-head{ max-width:620px; margin-bottom:48px; }
  .section-head h2{ font-size:32px; font-weight:600; margin:0 0 14px; line-height:1.15; }
  .section-head p{ font-size:15.5px; color:var(--muted); line-height:1.6; margin:0; }
  .alt{ background:var(--bg-alt); }

  /* ---------- Stats — a single ledger row instead of four boxed cards ---------- */
  .stats{ display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .stat{ padding:26px 22px; text-align:center; border-right:1px solid var(--border); }
  .stat:last-child{ border-right:none; }
  .stat b{ display:block; font-family:'IBM Plex Mono',monospace; font-size:26px; font-weight:600; color:var(--primary); }
  .stat span{ font-size:11.5px; color:var(--muted); }

  /* ---------- Research modules — a ledger list, not an icon grid ---------- */
  .module-list{ display:grid; grid-template-columns:1fr 1fr; column-gap:40px; }
  .module-row{ position:relative; display:flex; gap:16px; padding:20px 0 20px 16px; border-bottom:1px solid var(--border); }
  .module-row::before{ content:""; position:absolute; left:0; top:20px; bottom:20px; width:2px; background:transparent; transition:background .18s ease; }
  .module-row:hover::before{ background:var(--accent); }
  .module-code{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; font-weight:600; color:var(--muted); padding-top:2px; flex:none; width:34px; transition:color .18s ease; }
  .module-row:hover .module-code{ color:var(--primary); }
  .module-row h3{ font-size:15.5px; font-weight:600; margin:0 0 6px; }
  .module-row p{ font-size:13.5px; color:var(--muted); line-height:1.55; margin:0; }

  /* ---------- Showcases (TradersHub / Portfolio) ---------- */
  .showcase{ display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
  .showcase.reverse .showcase-media{ order:2; }
  .showcase.reverse .showcase-copy{ order:1; }
  .showcase + .showcase{ margin-top:88px; }
  .showcase-copy h3{ font-size:25px; font-weight:600; margin:0 0 14px; line-height:1.22; }
  .showcase-copy p{ font-size:14.5px; color:var(--muted); line-height:1.65; margin:0 0 20px; }
  .check-list{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; }
  .check-list li{ display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:var(--fg); }
  .check-list svg{ flex:none; margin-top:2px; color:var(--primary); }
  .media-card{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; box-shadow:var(--shadow); }

  .post-row{ display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .post-avatar{ width:26px; height:26px; border-radius:50%; background:linear-gradient(155deg,var(--primary),var(--accent)); flex:none; }
  .post-name{ font-size:13px; font-weight:600; }
  .post-handle{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--muted); }
  .post-line{ height:7px; border-radius:3px; background:var(--bg-alt); margin-bottom:7px; }
  .react-demo{ display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; }
  .react-pill{ display:flex; align-items:center; gap:6px; background:var(--bg-alt); border-radius:999px; padding:6px 12px; font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; }
  .react-pill.on{ background:var(--primary-tint); color:var(--primary-dark); }

  .pf-value-label{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:5px; }
  .pf-value{ font-family:'IBM Plex Mono',monospace; font-size:24px; font-weight:600; }
  .pf-chip{ font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; color:var(--bull); background:#EAF6F0; padding:4px 10px; border-radius:999px; }
  .pf-chart{ height:96px; margin-top:14px; border-radius:8px; background:var(--primary-tint); position:relative; overflow:hidden; }
  .pf-chart svg{ position:absolute; inset:0; }
  .quote-chart{ height:64px; margin-top:10px; border-radius:8px; background:var(--primary-tint); position:relative; overflow:hidden; }
  .quote-chart svg{ position:absolute; inset:0; }

  /* ---------- Getting started — a real sequence, so numbering is earned ---------- */
  .steps{ display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
  .step{ position:relative; padding-top:8px; }
  .step .num{ font-family:'IBM Plex Mono',monospace; font-size:22px; font-weight:600; color:var(--primary); display:block; margin-bottom:14px; }
  .step h3{ font-size:16.5px; font-weight:600; margin:0 0 8px; }
  .step p{ font-size:13.5px; color:var(--muted); line-height:1.6; margin:0; }
  .step-line{ position:absolute; top:16px; left:44px; right:-14px; height:1px; background:var(--border); }

  /* ---------- Trust — a three-column ledger, echoing the stats strip ---------- */
  .trust-grid{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .trust-col{ padding:28px 26px; border-right:1px solid var(--border); }
  .trust-col:last-child{ border-right:none; }
  .trust-col .module-code{ display:block; margin-bottom:10px; width:auto; }
  .trust-col h4{ font-size:15px; font-weight:600; margin:0 0 8px; font-family:'Space Grotesk',sans-serif; }
  .trust-col p{ font-size:13px; color:var(--muted); line-height:1.6; margin:0; }

  /* ---------- CTA band — the ticker motif reappears as quiet texture ---------- */
  .cta-band{
    position:relative; background:linear-gradient(155deg, var(--primary-dark), var(--primary) 55%, var(--accent));
    border-radius:20px; padding:56px 48px; color:#fff; overflow:hidden;
    display:flex; align-items:center; justify-content:space-between; gap:32px;
  }
  .cta-tape{
    position:absolute; inset:0; display:flex; align-items:center; opacity:.14; pointer-events:none;
  }
  .cta-tape span{ font-family:'IBM Plex Mono',monospace; font-size:13px; white-space:nowrap; animation:scroll-left 26s linear infinite; }
  .cta-band > *{ position:relative; }
  .cta-band h2{ font-size:27px; font-weight:600; margin:0 0 8px; }
  .cta-band p{ margin:0; opacity:.9; font-size:14.5px; max-width:420px; }
  .cta-band .btn-primary{ background:#fff; color:var(--primary-dark); box-shadow:none; }
  .cta-band .btn-primary:hover{ background:#f2f2f2; }

  /* ---------- Pricing — statement cards ---------- */
  .pricing-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:760px; margin:0 auto; }
  .price-card{ background:var(--card); border:1px solid var(--border); border-radius:16px; padding:28px; }
  .price-card.premium{ border-color:transparent; background:linear-gradient(180deg, var(--primary-tint), var(--card) 42%); box-shadow:0 0 0 1.5px var(--primary); }
  .price-card .plan-name{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  .price-card.premium .plan-name{ color:var(--primary); }
  .price-card .plan-price{ font-family:'IBM Plex Mono',monospace; font-size:32px; font-weight:600; margin:10px 0 2px; }
  .price-card .plan-period{ font-size:13px; color:var(--muted); font-weight:500; }
  .price-card ul{ list-style:none; padding:0; margin:20px 0 0; display:flex; flex-direction:column; gap:10px; }
  .price-card li{ display:flex; align-items:flex-start; gap:8px; font-size:13.5px; }
  .price-card li svg{ flex:none; margin-top:2px; color:var(--primary); }
  .price-card .btn{ width:100%; margin-top:22px; }

  /* ---------- FAQ ---------- */
  .faq-item{ display:flex; gap:16px; border-bottom:1px solid var(--border); padding:22px 0; }
  .faq-code{ font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; color:var(--muted); padding-top:2px; flex:none; width:32px; }
  .faq-body{ flex:1; }
  .faq-item summary{ cursor:pointer; font-weight:600; font-size:14.5px; list-style:none; display:flex; justify-content:space-between; align-items:center; }
  .faq-item summary::-webkit-details-marker{ display:none; }
  .faq-item summary::after{ content:"+"; font-size:19px; color:var(--muted); font-weight:400; }
  .faq-item[open] summary::after{ content:"–"; }
  .faq-item p{ margin:12px 0 0; font-size:13.5px; color:var(--muted); line-height:1.6; }

  footer{ border-top:1px solid var(--border); padding:52px 0 30px; }
  .foot-grid{ display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:32px; margin-bottom:40px; }
  .foot-grid h5{ font-family:'IBM Plex Mono',monospace; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:0 0 14px; }
  .foot-grid a{ display:block; font-size:13.5px; color:var(--fg); text-decoration:none; margin-bottom:10px; }
  .foot-grid a:hover{ color:var(--primary); }
  .foot-bottom{ display:flex; justify-content:space-between; align-items:center; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:var(--muted); flex-wrap:wrap; gap:12px; }

  @media (max-width:900px){
    .hero-grid{ grid-template-columns:1fr; }
    .hero{ text-align:center; padding-top:44px; }
    .hero p.lead{ margin-left:auto; margin-right:auto; }
    .hero-actions,.hero-trust{ justify-content:center; }
    nav.links{ display:none; }
    .module-list{ grid-template-columns:1fr; }
    .showcase, .showcase.reverse{ grid-template-columns:1fr; }
    .showcase.reverse .showcase-media, .showcase.reverse .showcase-copy{ order:initial; }
    .steps{ grid-template-columns:1fr; }
    .step-line{ display:none; }
    .stats{ grid-template-columns:1fr 1fr; }
    .stat:nth-child(2){ border-right:none; }
    .stat{ border-bottom:1px solid var(--border); }
    .trust-grid{ grid-template-columns:1fr; }
    .trust-col{ border-right:none; border-bottom:1px solid var(--border); }
    .trust-col:last-child{ border-bottom:none; }
    .pricing-grid{ grid-template-columns:1fr; }
    .cta-band{ flex-direction:column; text-align:center; padding:40px 26px; }
    .foot-grid{ grid-template-columns:1fr 1fr; }
  }
  @media (max-width:560px){
    .hero h1{ font-size:32px; }
    .stats{ grid-template-columns:1fr 1fr; }
    section{ padding:56px 0; }
    .board-cols, .board-row{ grid-template-columns:1.3fr .9fr .8fr; }
  }
  @media (prefers-reduced-motion:reduce){
    .ticker-track, .cta-tape span, .board-live .dot{ animation:none; }
  }
`}</style>

<div className="ticker-strip" aria-hidden="true">
<div className="ticker-track">
{tickerItems.map((tick, index) => (
          <span className="tick" key={`${tick.symbol}-${index}`}>
            <b>{tick.symbol}</b> KES {tick.price.toFixed(2)} <span className={tick.change >= 0 ? "up" : "down"}>{tick.change >= 0 ? "▲" : "▼"} {Math.abs(tick.change).toFixed(1)}%</span>
          </span>
        ))}
</div>
</div>

<header className="nav">
  <div className="wrap nav-inner">
    <div className="brand">
      <span className="mark" aria-label="Continua logo">A</span>
      <span>Continua</span>
    </div>
    <nav className="links" aria-label="Main navigation">
      <a href="#research">Research</a>
      <a href="#tradershub">TradersHub</a>
      <a href="#portfolio">Portfolio</a>
      <a href="#pricing">Pricing</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div className="nav-cta">
      <a href="/auth" className="btn btn-ghost">Log in</a>
      <a href="/auth?mode=signup" className="btn btn-primary">Get started</a>
    </div>
  </div>
</header>

<div style={{ height: "92px" }} aria-hidden="true"></div>

<section className="hero">
  <div className="wrap hero-grid">
    <div>
      <div className="eyebrow">Built for the Nairobi Securities Exchange</div>
      <h1>Research it.<br />Track it.<br /><em>Talk it through.</em></h1>
      <p className="lead">Continua brings real NSE research, portfolio tracking and price alerts into one app — with TradersHub, a place to see what other Kenyan investors think before you decide.</p>
      <div className="hero-actions">
        <a href="/auth?mode=signup" className="btn btn-primary btn-lg">Create free account</a>
        <a href="#research" className="btn btn-ghost btn-lg">See what's inside</a>
      </div>
      <div className="hero-trust">
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"></path></svg> No brokerage account required to research</span>
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Free to start</span>
      </div>
    </div>

    <div className="board">
      <span className="board-flag">NSE · Nairobi</span>
      <div className="board-head">
        <span className="label">Exchange board</span>
        <span className="board-live"><span className="dot"></span>Live</span>
      </div>
      <div className="board-cols">
        <span>Symbol</span><span style={{ textAlign: "right" }}>Last</span><span style={{ textAlign: "right" }}>Chg</span>
      </div>
      {boardRows.map(([symbol, name, price, change]) => (
        <div className="board-row" key={symbol}>
          <div>
            <div className="board-sym">{symbol}</div>
            <div className="board-name">{name}</div>
          </div>
          <div className="board-price">{price.toFixed(2)}</div>
          <div className="board-chg" style={{ color: change >= 0 ? "var(--bull)" : "var(--bear)" }}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        </div>
      ))}
      <div className="board-foot">Delayed 15 min on Free · Real-time on Premium</div>
    </div>
  </div>
</section>

<section style={{ paddingTop: "0" }}>
  <div className="wrap">
    <div className="stats">
      <div className="stat"><b>8</b><span>Research modules per stock</span></div>
      <div className="stat"><b>3</b><span>Chart types incl. candlesticks</span></div>
      <div className="stat"><b>NSE</b><span>Nairobi Securities Exchange focus</span></div>
      <div className="stat"><b>KES</b><span>Priced &amp; tracked in shillings</span></div>
    </div>
  </div>
</section>

<section id="research">
  <div className="wrap">
    <div className="section-head">
      <div className="eyebrow">Research</div>
      <h2>Every angle on a stock, in one screen</h2>
      <p>Open any NSE-listed company and move through valuation, growth, health, dividends, ownership and risk — the way an analyst would, without needing to be one.</p>
    </div>
    <div className="module-list">
      {researchModules.map((m) => (
        <div className="module-row" key={m.code}>
          <span className="module-code mono">{m.code}</span>
          <div>
            <h3>{m.title}</h3>
            <p>{m.body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="alt" id="tradershub">
  <div className="wrap">
    <div className="showcase">
      <div className="showcase-copy">
        <div className="eyebrow">TradersHub</div>
        <h3>Numbers tell you what happened.<br />People tell you why it matters.</h3>
        <p>TradersHub is a feed built entirely around Kenyan markets — post your thesis, tag the ticker, and see how the room reacts. Threaded replies keep every conversation easy to follow, no matter how deep it goes.</p>
        <ul className="check-list">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> React with more than a like — bullish, cautious, insightful and more</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Nested replies, so you always know what's being answered</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Follow the investors whose takes you actually want to see</li>
        </ul>
      </div>
      <div className="showcase-media">
        <div className="media-card">
          <div className="post-row">
            <div className="post-avatar"></div>
            <div><div className="post-name">Cyprian K. <span className="post-handle">@cypskip</span></div></div>
          </div>
          <div className="post-line" style={{ width: "96%" }}></div>
          <div className="post-line" style={{ width: "60%" }}></div>
          <span className="pf-chip">$SAFCOM +3.4%</span>
          <div className="quote-chart">
            <svg viewBox="0 0 260 64" preserveAspectRatio="none">
              <polyline points="0,50 25,44 50,48 75,30 100,36 125,18 150,26 175,10 200,20 225,6 260,14" fill="none" stroke="#25935F" strokeWidth="2.5"></polyline>
            </svg>
          </div>
          <div className="react-demo">
            <div className="react-pill on">🐂 Bullish · 18</div>
            <div className="react-pill">🔥 Fire · 6</div>
            <div className="react-pill">🧠 Insightful · 3</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="portfolio">
  <div className="wrap">
    <div className="showcase reverse">
      <div className="showcase-copy">
        <div className="eyebrow">Portfolio</div>
        <h3>Your holdings, tracked properly — in shillings.</h3>
        <p>Log what you own and Continua keeps score: gains and losses per holding, how your allocation breaks down, and how it's all trending over time — built for the way Kenyan investors actually hold NSE stocks.</p>
        <ul className="check-list">
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Performance chart with a real crosshair — drag to see any day's value</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> A watchlist for stocks you're circling but haven't bought yet</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Notifications grouped by feature, so alerts don't get lost in noise</li>
        </ul>
      </div>
      <div className="showcase-media">
        <div className="media-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
            <div>
              <div className="pf-value-label">Portfolio value</div>
              <div className="pf-value">KES 184,650</div>
            </div>
            <span className="pf-chip">+12.4% overall</span>
          </div>
          <div className="pf-chart">
            <svg viewBox="0 0 300 96" preserveAspectRatio="none">
              <polyline points="0,80 30,74 60,78 90,55 120,62 150,40 180,48 210,26 240,34 270,14 300,22" fill="none" stroke="#25935F" strokeWidth="2.5"></polyline>
              <line x1="210" y1="0" x2="210" y2="96" stroke="#25935F" strokeOpacity=".3" strokeDasharray="3 3"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="alt">
  <div className="wrap">
    <div className="section-head" style={{ margin: "0 auto 48px", textAlign: "center" }}>
      <div className="eyebrow" style={{ justifyContent: "center" }}>Getting started</div>
      <h2>Three steps, and you're across the market</h2>
    </div>
    <div className="steps">
      <div className="step"><div className="step-line"></div><span className="num">01</span><h3>Create your account</h3><p>Sign up with email or Google — no brokerage or bank details required to start researching.</p></div>
      <div className="step"><div className="step-line"></div><span className="num">02</span><h3>Build your watchlist</h3><p>Search any NSE-listed company, add it to your watchlist, and set a price alert if you have a target in mind.</p></div>
      <div className="step"><span className="num">03</span><h3>Join the conversation</h3><p>Post your take on TradersHub, or just read what other Kenyan investors are watching this week.</p></div>
    </div>
  </div>
</section>

<section>
  <div className="wrap">
    <div className="section-head">
      <div className="eyebrow">Built to be trusted</div>
      <h2>Serious about the details you don't see</h2>
    </div>
    <div className="trust-grid">
      {trustItems.map((t) => (
        <div className="trust-col" key={t.code}>
          <span className="module-code mono">{t.code}</span>
          <h4>{t.title}</h4>
          <p>{t.body}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section style={{ paddingTop: "0" }}>
  <div className="wrap">
    <div className="cta-band">
      <div className="cta-tape" aria-hidden="true">
        <span>{tickerItems.map(t => `${t.symbol} ${t.price.toFixed(2)}`).join("   ·   ")}</span>
      </div>
      <div>
        <h2>Start researching the NSE today</h2>
        <p>Free to create an account. Bring your watchlist, set your first alert, and see what TradersHub is saying about it.</p>
      </div>
      <a href="/auth?mode=signup" className="btn btn-primary btn-lg">Create free account</a>
    </div>
  </div>
</section>

<section className="alt" id="pricing">
  <div className="wrap">
    <div className="section-head" style={{ margin: "0 auto 44px", textAlign: "center" }}>
      <div className="eyebrow" style={{ justifyContent: "center" }}>Pricing</div>
      <h2>Free to research. Premium to go deeper.</h2>
      <p style={{ margin: "0 auto" }}>Start with the essentials at no cost. Upgrade whenever you want real-time prices, unlimited AI research, and room to write long-form posts on TradersHub.</p>
    </div>
    <div className="pricing-grid">
      <div className="price-card">
        <div className="plan-name">Free</div>
        <div className="plan-price">KES 0</div>
        <div className="plan-period">Forever</div>
        <ul>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Watchlists &amp; delayed prices</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> TradersHub — post up to 500 characters</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Basic charts, incl. candlesticks</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> 3 AI theses a month</li>
        </ul>
        <a href="/auth?mode=signup" className="btn btn-ghost">Create free account</a>
      </div>
      <div className="price-card premium">
        <div className="plan-name">Premium</div>
        <div className="plan-price">KES 800<span className="plan-period">/mo</span></div>
        <div className="plan-period">or KES 7,980/year</div>
        <ul>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Real-time NSE prices, no delay</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Unlimited AI investment theses</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Long-form TradersHub posts, up to 5,000 characters</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg> Advanced screener &amp; priority alerts</li>
        </ul>
        <a href="/auth?mode=signup" className="btn btn-primary">Get Premium</a>
      </div>
    </div>
  </div>
</section>

<section id="faq">
  <div className="wrap" style={{ maxWidth: "760px" }}>
    <div className="section-head" style={{ marginBottom: "28px" }}>
      <div className="eyebrow">FAQ</div>
      <h2>Good to know</h2>
    </div>

    <details className="faq-item" open={true}>
      <div className="faq-code mono">F.01</div>
      <div className="faq-body">
        <summary>Do I need a brokerage account to use Continua?</summary>
        <p>No. You can research stocks, build a watchlist, set alerts and use TradersHub without a linked brokerage account. Continua is a research and portfolio-tracking companion, not a trading platform.</p>
      </div>
    </details>
    <details className="faq-item">
      <div className="faq-code mono">F.02</div>
      <div className="faq-body">
        <summary>Which stocks does Continua cover?</summary>
        <p>Continua is built around companies listed on the Nairobi Securities Exchange (NSE), across banking, telecoms, manufacturing, energy, insurance and more.</p>
      </div>
    </details>
    <details className="faq-item">
      <div className="faq-code mono">F.03</div>
      <div className="faq-body">
        <summary>Is TradersHub the same as my portfolio?</summary>
        <p>No — they're connected but separate. TradersHub is the social feed where you post and discuss. Your portfolio and watchlist stay private by default, and you decide if and what to share.</p>
      </div>
    </details>
    <details className="faq-item">
      <div className="faq-code mono">F.04</div>
      <div className="faq-body">
        <summary>Is Continua free?</summary>
        <p>Yes, creating an account and using the core research, watchlist, alerts and TradersHub features is free.</p>
      </div>
    </details>
  </div>
</section>

<footer>
  <div className="wrap">
    <div className="foot-grid">
      <div>
        <div className="brand" style={{ marginBottom: "12px" }}>
          <span className="mark" aria-label="Continua logo">A</span>
          <span>Continua</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "260px", lineHeight: "1.6" }}>Research, track and discuss Nairobi Securities Exchange stocks in one place.</p>
      </div>
      <div>
        <h5>Product</h5>
        <a href="#research">Research</a>
        <a href="#tradershub">TradersHub</a>
        <a href="#portfolio">Portfolio</a>
      </div>
      <div>
        <h5>Company</h5>
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">Careers</a>
      </div>
      <div>
        <h5>Legal</h5>
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Policy</a>
      </div>
    </div>
    <div className="foot-bottom">
      <span>© 2026 Continua. All rights reserved.</span>
      <span>Nairobi, Kenya</span>
    </div>
  </div>
</footer>
    </>
  );
};

export default ContinuaLandingPage;