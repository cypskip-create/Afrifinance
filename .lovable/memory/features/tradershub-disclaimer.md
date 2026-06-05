---
name: tradershub-disclaimer
description: TradersHub disclaimer is FIRST-TIME ONLY, gated by profiles.tradershub_onboarded (server) with localStorage cache. Never shown again after acceptance.
type: feature
---
- DB column: `profiles.tradershub_onboarded boolean default false`.
- `TradersHubDisclaimer` checks localStorage first, then the DB column. If either is true, it never shows.
- On accept it sets BOTH localStorage and the DB column so other devices respect the decision.
- Do not gate every TradersHub visit — only first-ever load.
