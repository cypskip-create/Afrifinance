/**
 * Maps a source's `adapter` field to how it should actually be run
 * (§10-11 of the original spec: "adding a new source should mean adding
 * an adapter, not rewriting the core"). Sources whose adapter isn't
 * registered here fall back to the generic link-following crawler
 * (crawler/crawlSource.ts) — that's the correct default for an unknown/
 * generic source, and exactly why the generic crawler exists.
 */
import { runAdapter, type AdapterRunSummary } from "./runAdapter.js";
import { nseAnnouncementsAdapter } from "./nse/announcementsAdapter.js";
import type { CrawlSummary } from "../crawler/crawlSource.js";

export const adapterRegistry: Record<string, () => Promise<AdapterRunSummary>> = {
  nse: () => runAdapter(nseAnnouncementsAdapter),
};

export function hasRegisteredAdapter(adapterId: string): boolean {
  return adapterId in adapterRegistry;
}

export async function runRegisteredAdapter(adapterId: string): Promise<AdapterRunSummary> {
  const run = adapterRegistry[adapterId];
  if (!run) throw new Error(`No adapter registered for id: ${adapterId}`);
  return run();
}

export type { CrawlSummary };