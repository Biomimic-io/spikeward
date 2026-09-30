export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ASSETS: Fetcher;
  /** Cloudflare Email Routing. Optional: without it, alerts go to the webhook only. */
  EMAIL?: SendEmail;
  SPIKEWARD_SECRET: string;
}

export const VERSION = "0.1.0";
export const REPO = "Biomimic-io/spikeward";
