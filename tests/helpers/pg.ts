import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

export const MIGRATIONS = [
  "supabase/migrations/20260101000000_booking_engine.sql",
  "supabase/migrations/20260102000000_hotel_management.sql",
  "supabase/migrations/20260103000000_photos.sql",
];

/** Fresh in-memory Postgres with the real migrations applied (7 hotels, 19 room types). */
export async function makeDb() {
  const db = new PGlite();
  for (const m of MIGRATIONS) await db.exec(readFileSync(m, "utf8"));

  /** Same contract as supabase.rpc(fn, { p }): one jsonb in, one jsonb out. */
  async function rpc<T = any>(fn: string, p: unknown = {}): Promise<T> {
    const r = await db.query<Record<string, T>>(`select public.${fn}($1::jsonb) as r`, [
      JSON.stringify(p),
    ]);
    return r.rows[0].r;
  }
  /** Same shape the app's service layer expects. */
  const dbApi = {
    rpc,
    async uploadImage(): Promise<string> {
      throw new Error("image upload is not available in tests");
    },
    async removeImage(): Promise<void> {},
  };
  return { db, rpc, dbApi };
}

export const iso = (offsetDays: number) => {
  const d = new Date(Date.UTC(2030, 0, 10 + offsetDays));
  return d.toISOString().slice(0, 10);
};

export const baseBooking = (over: Record<string, unknown> = {}) => ({
  hotel: "triplicane",
  room_type: "Deluxe",
  check_in: iso(0),
  check_out: iso(2),
  rooms: 1,
  adults: 2,
  children: 0,
  guest_name: "Test Guest",
  guest_phone: "9876543210",
  guest_email: "",
  notes: "",
  corporate: false,
  discount_pct: 0,
  ...over,
});
