// Shared data source for the TradersHub "Media" tab.
// Mirrors the pattern used by src/lib/stockPrices.ts: a single source of truth
// so the feed, the detail view, and notification deep-links never disagree.
//
// IDs are stable strings (not array indexes) specifically so a notification's
// `action_url` (e.g. "/traders-hub?tab=media&article=art-safcom-q3") keeps
// pointing at the right item even as new articles are added above it.

export type MediaCategory =
  | "top"
  | "earnings"
  | "markets"
  | "economy"
  | "companies"
  | "interviews";

export type MediaKind = "article" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  summary: string;
  /** Paragraphs shown in the expanded reader view. */
  body: string[];
  source: string;
  /** ISO timestamp — display time is derived via formatTimestamp(). */
  publishedAt: string;
  category: MediaCategory;
  imageUrl: string;
  /** Present only for kind === "video". */
  videoUrl?: string;
  duration?: string;
  /** e.g. "CEO, Safaricom PLC" — shown on interview/podcast videos. */
  guest?: string;
  readTime?: string;
  views: number;
  comments: number;
  stockMentions?: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
  isBreaking?: boolean;
}

export const MEDIA_CATEGORIES: { id: MediaCategory | "all"; label: string }[] = [
  { id: "all", label: "Top Stories" },
  { id: "markets", label: "Markets" },
  { id: "earnings", label: "Earnings" },
  { id: "companies", label: "Companies" },
  { id: "economy", label: "Economy" },
  { id: "interviews", label: "Videos & Interviews" },
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "art-kcb-fintech",
    kind: "article",
    title: "KCB Group announces strategic partnership with fintech startup",
    summary: "Major banking group partners with a leading fintech to revolutionize digital banking across the region.",
    body: [
      "KCB Group has entered a strategic partnership with a fast-growing fintech startup, aiming to accelerate its digital banking roadmap and reach underserved retail customers across East Africa.",
      "The partnership will integrate instant lending and merchant payment tools directly into KCB's mobile app, with a phased rollout beginning in Kenya before expanding to Uganda, Tanzania and Rwanda.",
      "Analysts covering the counter say the deal strengthens KCB's competitive position against Equity Group and Co-operative Bank in the race for digital-first customers, though the near-term earnings impact is expected to be modest.",
      "Management indicated the partnership would be earnings accretive from the second year, with upfront technology investment weighing on the current financial year.",
    ],
    source: "Capital Markets",
    publishedAt: hoursAgo(0.1),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 12450,
    comments: 89,
    stockMentions: ["KCB"],
    sentiment: "bullish",
    isBreaking: true,
  },
  {
    id: "art-safcom-q3",
    kind: "article",
    title: "Safaricom Reports Strong Q3 Results, M-Pesa Revenue Surges 23%",
    summary: "Kenya's largest telco posts 12% revenue growth driven by continued M-Pesa expansion.",
    body: [
      "Safaricom PLC posted a 12% year-on-year rise in total revenue for the third quarter, with M-Pesa once again the standout performer, growing 23% as transaction volumes and merchant adoption climbed.",
      "Mobile data revenue also grew at a double-digit pace as smartphone penetration continues to rise across the customer base, while voice revenue remained broadly flat.",
      "The board reaffirmed full-year guidance and highlighted continued investment in Ethiopia operations as a medium-term growth driver, alongside the domestic core business.",
      "Shares reacted positively in early trading, with brokerages including several local research desks reiterating buy ratings on the counter following the results.",
    ],
    source: "Business Daily",
    publishedAt: hoursAgo(2),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=500&fit=crop",
    readTime: "5 min",
    views: 8920,
    comments: 56,
    stockMentions: ["SAFCOM", "SCOM"],
    sentiment: "bullish",
  },
  {
    id: "art-nse20-high",
    kind: "article",
    title: "NSE 20 Index Hits New Monthly High on Banking Rally",
    summary: "Banking and telecom counters lead a broad market rally amid improving investor sentiment.",
    body: [
      "The NSE 20 Share Index closed at its highest level in over a month, powered by gains across the banking sector, as investors rotated back into large-cap financials.",
      "Equity Group, KCB and Co-operative Bank were among the day's top gainers, with combined turnover in banking counters accounting for more than half of total market activity.",
      "Market participants pointed to easing bond yields and renewed foreign investor interest as key catalysts, though some caution the rally could stall without a fresh earnings catalyst.",
    ],
    source: "Capital FM",
    publishedAt: hoursAgo(4),
    category: "markets",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 6540,
    comments: 42,
    stockMentions: ["EQTY", "KCB", "COOP"],
    sentiment: "bullish",
  },
  {
    id: "art-cbk-rates",
    kind: "article",
    title: "Central Bank Maintains Rates at 12.5% Amid Stable Inflation",
    summary: "CBK keeps its policy rate unchanged, citing a stable inflation outlook.",
    body: [
      "The Central Bank of Kenya's Monetary Policy Committee voted to hold the benchmark lending rate at 12.5%, in line with market expectations, citing inflation that remains comfortably within the target band.",
      "The committee noted that the shilling has stabilised against major currencies and that credit growth to the private sector, while still muted, is showing early signs of recovery.",
      "Economists broadly welcomed the decision as a sign of policy consistency, though some flagged that a prolonged hold could delay a much-needed pickup in private sector lending.",
    ],
    source: "The Star",
    publishedAt: hoursAgo(6),
    category: "economy",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop",
    readTime: "6 min",
    views: 4320,
    comments: 78,
    sentiment: "neutral",
  },
  {
    id: "art-equity-southsudan",
    kind: "article",
    title: "Equity Bank Expands to South Sudan in Regional Push",
    summary: "Regional banking group opens a new subsidiary as part of its aggressive expansion strategy.",
    body: [
      "Equity Group Holdings has opened a new banking subsidiary in South Sudan, extending its regional footprint to nine African markets as part of a long-running continental expansion drive.",
      "The lender said the new entity will initially focus on trade finance and diaspora remittances before rolling out its full retail and SME banking suite.",
      "Management has previously flagged regional subsidiaries as a key pillar of long-term growth, with non-Kenya operations now contributing a growing share of group profit.",
    ],
    source: "The Standard",
    publishedAt: hoursAgo(8),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 3890,
    comments: 34,
    stockMentions: ["EQTY"],
    sentiment: "bullish",
  },
  {
    id: "art-oil-kenya-power",
    kind: "article",
    title: "Analysis: What Rising Global Oil Prices Mean for Kenya Power",
    summary: "Expert analysis on how geopolitical tensions and energy costs could pressure margins.",
    body: [
      "Rising global crude prices are pushing up the cost of thermal power generation, a trend analysts say could squeeze margins at Kenya Power in the absence of a corresponding tariff adjustment.",
      "KenGen, which relies more heavily on geothermal and hydro capacity, is seen as comparatively insulated, though prolonged drought conditions remain a swing factor for hydro output.",
      "Analysts recommend investors watch the upcoming tariff review cycle closely, as the pass-through mechanism will largely determine how much of the cost increase reaches the state utility's bottom line.",
    ],
    source: "Reuters",
    publishedAt: hoursAgo(10),
    category: "markets",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=500&fit=crop",
    readTime: "8 min",
    views: 2450,
    comments: 23,
    stockMentions: ["KPLC", "KEGN"],
    sentiment: "bearish",
  },
  {
    id: "art-scbk-dividend",
    kind: "article",
    title: "Standard Chartered Kenya Lifts Interim Dividend as Profit Grows",
    summary: "The lender raises its interim payout after posting steady growth in net interest income.",
    body: [
      "Standard Chartered Bank Kenya raised its interim dividend after reporting steady growth in net interest income and a continued pullback in loan-loss provisions.",
      "Management pointed to disciplined cost control and strong transaction banking fees as key contributors to the improved bottom line.",
      "The bank said it remains focused on its high-margin corporate and institutional banking franchise rather than chasing retail volume growth.",
    ],
    source: "Business Daily",
    publishedAt: hoursAgo(12),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 2980,
    comments: 21,
    stockMentions: ["SCBK"],
    sentiment: "bullish",
  },
  {
    id: "art-absa-sme",
    kind: "article",
    title: "Absa Bank Kenya Sees SME Lending Momentum Build",
    summary: "The lender reports faster growth in its small-business loan book as digital onboarding scales up.",
    body: [
      "Absa Bank Kenya said its small and medium enterprise loan book grew faster than the overall balance sheet, helped by a digital onboarding platform that has cut approval times.",
      "Executives said asset quality in the segment has held up well, with non-performing loan ratios broadly stable despite the faster disbursement pace.",
      "The bank is targeting further growth in trade finance and asset-backed lending to SMEs over the coming financial year.",
    ],
    source: "Capital FM",
    publishedAt: hoursAgo(14),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 2140,
    comments: 15,
    stockMentions: ["ABSA"],
    sentiment: "bullish",
  },
  {
    id: "art-ncba-credit",
    kind: "article",
    title: "NCBA Group Flags Credit Growth Pickup Heading Into H2",
    summary: "Management points to improving loan demand across corporate and SME segments.",
    body: [
      "NCBA Group told investors it expects private-sector credit growth to accelerate in the second half of the year as corporate borrowers resume expansion plans put on hold during tighter monetary conditions.",
      "The bank's asset-finance and mobile lending units continued to be standout contributors to non-interest income during the period.",
      "Analysts said the commentary is broadly consistent with the wider banking sector, though funding costs remain a swing factor for margins.",
    ],
    source: "The Standard",
    publishedAt: hoursAgo(16),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 1870,
    comments: 12,
    stockMentions: ["NCBA"],
    sentiment: "neutral",
  },
  {
    id: "art-dtb-loanbook",
    kind: "article",
    title: "Diamond Trust Bank Posts Steady Loan Book Growth",
    summary: "The regional lender reports modest balance-sheet expansion amid a cautious lending stance.",
    body: [
      "Diamond Trust Bank Kenya reported steady growth in its loan book, with management citing a deliberately cautious underwriting stance in a still-tight interest rate environment.",
      "The lender's regional subsidiaries in Tanzania, Uganda and Burundi contributed a growing share of group earnings during the period.",
      "Provisions for bad loans eased slightly from the prior quarter, which the bank attributed to improved recoveries in its corporate book.",
    ],
    source: "NSE Filings",
    publishedAt: hoursAgo(18),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 1340,
    comments: 8,
    stockMentions: ["DTB", "DTK"],
    sentiment: "neutral",
  },
  {
    id: "art-stanbic-digital",
    kind: "article",
    title: "Stanbic Holdings Advances Digital Transaction Platform",
    summary: "The group rolls out an upgraded corporate banking platform aimed at cutting transaction times.",
    body: [
      "Stanbic Holdings has rolled out an upgraded digital transaction banking platform for its corporate and institutional clients, aiming to cut payment processing times and reduce manual reconciliation.",
      "The bank said early adoption among large corporates has been encouraging, with transaction volumes on the platform rising steadily since launch.",
      "Management reiterated its focus on fee-based income as a buffer against margin pressure in the core lending business.",
    ],
    source: "Capital Markets",
    publishedAt: hoursAgo(20),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 1120,
    comments: 6,
    stockMentions: ["STANBIC"],
    sentiment: "bullish",
  },
  {
    id: "art-britam-underwriting",
    kind: "article",
    title: "Britam Holdings Targets Underwriting Margin Recovery",
    summary: "The insurer outlines a repricing plan after a period of elevated claims.",
    body: [
      "Britam Holdings said it is repricing selected general insurance lines after a period of elevated claims eroded underwriting margins.",
      "The group's asset management arm continued to post solid inflows, partially offsetting softer performance in the insurance business.",
      "Management said it expects the combined ratio to improve gradually as repricing takes effect over the next two reporting periods.",
    ],
    source: "The Star",
    publishedAt: hoursAgo(22),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 1560,
    comments: 11,
    stockMentions: ["BRIT"],
    sentiment: "neutral",
  },
  {
    id: "art-jubilee-claims",
    kind: "article",
    title: "Jubilee Holdings Reports Lower Profit on Claims Pressure",
    summary: "Elevated medical and motor claims weigh on the insurer's bottom line for the period.",
    body: [
      "Jubilee Holdings reported a decline in net profit for the period, citing higher medical and motor claims across its regional insurance operations.",
      "The group said it has tightened underwriting criteria on the most claims-heavy segments and expects the impact to show up gradually in coming quarters.",
      "Investors reacted cautiously to the results, with some brokerages trimming near-term earnings estimates on the counter.",
    ],
    source: "Business Daily",
    publishedAt: hoursAgo(24),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 1980,
    comments: 17,
    stockMentions: ["JUB"],
    sentiment: "bearish",
  },
  {
    id: "art-eabl-volumes",
    kind: "article",
    title: "EABL Volumes Rebound as Input Cost Pressures Ease",
    summary: "East African Breweries reports a recovery in sales volumes alongside easing raw material costs.",
    body: [
      "East African Breweries reported a rebound in sales volumes across its beer and spirits portfolio, helped by easing raw material costs and a stabilising shilling.",
      "Management said premiumisation trends continued, with higher-margin spirits brands outgrowing the mainstream beer category.",
      "The company maintained its full-year guidance and flagged continued investment in local sourcing to reduce import dependence.",
    ],
    source: "Reuters Africa",
    publishedAt: hoursAgo(28),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 3210,
    comments: 26,
    stockMentions: ["EABL"],
    sentiment: "bullish",
  },
  {
    id: "art-bat-dividend",
    kind: "article",
    title: "BAT Kenya Raises Dividend Payout Despite Volume Decline",
    summary: "The tobacco maker lifts its payout ratio even as cigarette volumes continue to slide.",
    body: [
      "British American Tobacco Kenya raised its dividend payout ratio even as reported cigarette volumes declined, leaning on pricing and cost efficiencies to protect earnings.",
      "The company said illicit trade remains the biggest headwind to volume growth and called for stronger enforcement against untaxed imports.",
      "Shareholders broadly welcomed the higher payout, with the stock remaining a core holding among dividend-focused investors on the exchange.",
    ],
    source: "NSE Filings",
    publishedAt: hoursAgo(32),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 1450,
    comments: 9,
    stockMentions: ["BAT"],
    sentiment: "neutral",
  },
  {
    id: "art-totl-retail",
    kind: "article",
    title: "TotalEnergies Marketing Kenya Expands Retail Network",
    summary: "The fuel retailer opens new service stations as it targets growth beyond major urban centres.",
    body: [
      "TotalEnergies Marketing Kenya opened several new service stations as part of a push to grow its retail footprint beyond Nairobi and other major towns.",
      "The company said non-fuel retail, including convenience stores and lubricant sales, is becoming an increasingly important contributor to station-level profitability.",
      "Management flagged fuel pricing regulation as an ongoing factor shaping margins in the core distribution business.",
    ],
    source: "The Standard",
    publishedAt: hoursAgo(36),
    category: "companies",
    imageUrl: "https://images.unsplash.com/photo-1545262810-77515befe149?w=800&h=500&fit=crop",
    readTime: "3 min",
    views: 980,
    comments: 5,
    stockMentions: ["TOTL"],
    sentiment: "neutral",
  },
  {
    id: "art-bamburi-demand",
    kind: "article",
    title: "Bamburi Cement Ramps Up Production Amid Construction Demand",
    summary: "The cement maker reports higher capacity utilisation as infrastructure and housing projects pick up.",
    body: [
      "Bamburi Cement said capacity utilisation at its plants has risen as infrastructure and affordable-housing projects drive cement demand across the region.",
      "The company has been working to reduce energy costs through alternative fuel sources, a key margin lever given the energy-intensive nature of cement production.",
      "Analysts note the counter remains sensitive to public infrastructure spending cycles and cement price competition from newer entrants.",
    ],
    source: "Capital FM",
    publishedAt: hoursAgo(40),
    category: "markets",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?w=800&h=500&fit=crop",
    readTime: "4 min",
    views: 1290,
    comments: 10,
    stockMentions: ["BAMB"],
    sentiment: "bullish",
  },
  {
    id: "vid-safcom-ceo-earnings",
    kind: "video",
    title: "Earnings Call: Safaricom CEO breaks down Q3 M-Pesa growth",
    summary: "Full replay of the Q3 earnings call, with the CEO fielding analyst questions on M-Pesa and Ethiopia.",
    body: [
      "In this earnings call replay, Safaricom's CEO walks analysts through the drivers behind Q3's M-Pesa revenue surge and takes questions on the pace of Ethiopia investment.",
      "Key topics covered include merchant payment growth, data monetisation, and the medium-term margin outlook for the group.",
    ],
    source: "AfriFinance Media",
    publishedAt: hoursAgo(3),
    category: "earnings",
    imageUrl: "https://images.unsplash.com/photo-1590650046871-92c887180603?w=800&h=500&fit=crop",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: "18:42",
    guest: "CEO, Safaricom PLC",
    views: 15200,
    comments: 64,
    stockMentions: ["SAFCOM", "SCOM"],
    sentiment: "bullish",
  },
  {
    id: "vid-equity-ceo-interview",
    kind: "video",
    title: "One-on-one: Equity Group CEO on regional expansion strategy",
    summary: "A sit-down interview on the bank's push into new African markets and the outlook for the year ahead.",
    body: [
      "AfriFinance Media sits down with Equity Group's CEO to discuss the bank's newest subsidiary, the regional growth roadmap, and how management is thinking about capital allocation over the next three years.",
      "The conversation also touches on digital lending, SME credit growth, and how the bank is positioning against fintech competition.",
    ],
    source: "AfriFinance Media",
    publishedAt: hoursAgo(26),
    category: "interviews",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=500&fit=crop",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: "24:10",
    guest: "CEO, Equity Group Holdings",
    views: 9840,
    comments: 41,
    stockMentions: ["EQTY"],
    sentiment: "bullish",
  },
  {
    id: "vid-nse-weekly-podcast",
    kind: "video",
    title: "The Weekly Close: NSE market wrap with our markets desk",
    summary: "A weekly podcast-style discussion breaking down the biggest movers and what to watch next week.",
    body: [
      "Our markets desk recaps the week's biggest moves on the NSE, from the banking sector rally to the latest read on the shilling, and previews the catalysts to watch in the week ahead.",
    ],
    source: "AfriFinance Media",
    publishedAt: hoursAgo(30),
    category: "interviews",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=500&fit=crop",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: "12:05",
    guest: "AfriFinance Markets Desk",
    views: 5210,
    comments: 19,
    sentiment: "neutral",
  },
];

export function getMediaItemById(id: string): MediaItem | undefined {
  return MEDIA_ITEMS.find((m) => m.id === id);
}

/**
 * All media items that mention a given ticker (e.g. from a stock's News tab
 * or a portfolio holding's updates), most recent first. Used to drive the
 * "Recent News" / "Latest Headlines" sections on the stock page and the
 * "Updates for your holdings" section on the portfolio page — both deep-link
 * into the Media tab via `/traders-hub?tab=media&article=<id>`.
 */
export function getMediaItemsForSymbol(symbol: string): MediaItem[] {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return [];
  return MEDIA_ITEMS
    .filter((m) => (m.stockMentions || []).some((s) => s.toUpperCase() === sym))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/** Same lookup across several tickers at once (e.g. a whole portfolio), deduped. */
export function getMediaItemsForSymbols(symbols: string[]): MediaItem[] {
  const set = new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean));
  if (set.size === 0) return [];
  return MEDIA_ITEMS
    .filter((m) => (m.stockMentions || []).some((s) => set.has(s.toUpperCase())))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getMediaFeed(category: MediaCategory | "all", query: string): MediaItem[] {
  const q = query.trim().toLowerCase().replace(/^\$/, "");
  let items = MEDIA_ITEMS;
  if (category !== "all") items = items.filter((m) => m.category === category);
  if (q) {
    items = items.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q) ||
        (m.stockMentions || []).some((s) => s.toLowerCase().includes(q))
    );
  }
  return [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}