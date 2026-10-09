import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "../images";

/**
 * All database access goes through Postgres functions (supabase/migrations),
 * each taking one jsonb argument and returning one jsonb value.
 */
export interface Db {
  rpc<T = unknown>(fn: string, payload: unknown): Promise<T>;
  /** Stores an image in the public hotel-images bucket and returns its public URL. */
  uploadImage(path: string, bytes: Buffer, contentType: string): Promise<string>;
  /** Removes a file from the hotel-images bucket. */
  removeImage(path: string): Promise<void>;
  /** Files in the hotel-images bucket, newest first. */
  listImages(): Promise<{ name: string; url: string; size: number; createdAt: string | null }[]>;
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
    async uploadImage(path: string, bytes: Buffer, contentType: string) {
      const { error } = await client.storage
        .from(STORAGE_BUCKET)
        .upload(path, bytes, { contentType, upsert: false, cacheControl: "31536000" });
      if (error) throw new DbError(`upload: ${error.message}`);
      return `${url.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
    },
    async listImages() {
      const { data, error } = await client.storage
        .from(STORAGE_BUCKET)
        .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new DbError(`list: ${error.message}`);
      const base = `${url.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/`;
      return (data ?? [])
        .filter((f) => f.id !== null && /\.(jpe?g|png|webp)$/i.test(f.name))
        .map((f) => ({
          name: f.name,
          url: base + f.name,
          size: Number((f.metadata as { size?: number } | null)?.size ?? 0),
          createdAt: f.created_at ?? null,
        }));
    },
    async removeImage(path: string) {
      const { error } = await client.storage.from(STORAGE_BUCKET).remove([path]);
      if (error) throw new DbError(`remove: ${error.message}`);
    },
  };
  return cached;
}
