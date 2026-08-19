// Frontend mirror of backend/src/config/index.ts's ACTIVE_EXCHANGES. Kept
// as a plain constant (not fetched) because it changes exactly as often as
// a backend deploy does — if you add an exchange there, add it here too.
// This is the single source of truth the exchange picker, TopBar, and any
// "which market am I looking at" UI should read from.
export interface ExchangeMeta {
  code: string;
  name: string;
  country: string;
  currency: string;
  /** Unicode flag emoji — cheap, no image asset, renders everywhere. */
  flag: string;
}

export const EXCHANGES: ExchangeMeta[] = [
  { code: "NSE", name: "Nairobi Securities Exchange", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "NGX", name: "Nigerian Exchange", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "GSE", name: "Ghana Stock Exchange", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "JSE", name: "Johannesburg Stock Exchange", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "LuSE", name: "Lusaka Securities Exchange", country: "Zambia", currency: "ZMW", flag: "🇿🇲" },
  { code: "DSE", name: "Dar es Salaam Stock Exchange", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { code: "BRVM", name: "Bourse Régionale des Valeurs Mobilières", country: "Côte d'Ivoire & West Africa", currency: "XOF", flag: "🇨🇮" },
];

export const DEFAULT_EXCHANGE = "NSE";

export function getExchangeMeta(code: string): ExchangeMeta {
  return EXCHANGES.find((e) => e.code === code) ?? EXCHANGES[0];
}