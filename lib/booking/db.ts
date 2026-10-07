import { createClient } from "@supabase/supabase-js";

/**
 * All database access goes through Postgres functions (supabase/migrations),
 * each taking one jsonb argument and returning one jsonb value.
 */
export interface Db {
  rpc<T = unknown>(fn: string, payload: unknown): Promise<T>;
}

export class DbError extends Error {}

let cached: Db | null | undefined;

/** Returns null when Supabase is not configured (the site then falls back to email requests). */
export function getDb(): Db | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return (cached = null);

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cached = {
    async rpc<T>(fn: string, payload: unknown) {
      const { data, error } = await client.rpc(fn, { p: payload });
      if (error) throw new DbError(`${fn}: ${error.message}`);
      return data as T;
    },
  };
  return cached;
}
