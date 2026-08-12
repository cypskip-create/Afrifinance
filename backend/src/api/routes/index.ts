import { Router } from "express";
import { quotesRoutes } from "./quotes.routes.js";
import { historicalRoutes } from "./historical.routes.js";
import { companiesRoutes } from "./companies.routes.js";
import { financialsRoutes } from "./financials.routes.js";
import { corporateActionsRoutes } from "./corporateActions.routes.js";
import { moversRoutes } from "./movers.routes.js";
import { sectorsRoutes } from "./sectors.routes.js";
import { researchRoutes } from "./research.routes.js";
import { screenerRoutes } from "./screener.routes.js";

/** Every route is mounted under /api/v1. Versioning from day one — the app,
 *  TradersHub, and Media all consume this same v1 contract; a v2 later can
 *  be added alongside it without breaking existing clients.
 *
 *  NOTE: health.routes.ts is intentionally NOT included here — it's mounted
 *  separately in server.ts, ahead of the auth/rate-limit middleware, so
 *  infra probes (load balancer health checks, uptime monitors) never need
 *  an API key and never count against anyone's rate limit. */
export const apiRouter = Router();
apiRouter.use(quotesRoutes);
apiRouter.use(historicalRoutes);
apiRouter.use(companiesRoutes);
apiRouter.use(financialsRoutes);
apiRouter.use(corporateActionsRoutes);
apiRouter.use(moversRoutes);
apiRouter.use(sectorsRoutes);
apiRouter.use(researchRoutes);
apiRouter.use(screenerRoutes);