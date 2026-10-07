// Local stand-in for Supabase, for development and automated tests.
//   npm run dev:db
// Runs the real migrations on an embedded Postgres (PGlite) and serves the small
// slice of the Supabase API the site uses: POST /rest/v1/rpc/<function> and the
// photo storage bucket (/storage/v1/object/...). Photos are kept in memory.
// NOT for production: use a real Supabase project there.
//
// Point the site at it:
//   SUPABASE_URL=http://127.0.0.1:54321
//   SUPABASE_SERVICE_ROLE_KEY=local-dev-key
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { PGlite } from "@electric-sql/pglite";

const PORT = Number(process.env.MOCK_SUPABASE_PORT || 54321);
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "local-dev-key";
const ROOMS = process.env.MOCK_ROOMS_PER_TYPE; // optionally override the placeholder stock
const MIGRATIONS = [
  "supabase/migrations/20260101000000_booking_engine.sql",
  "supabase/migrations/20260102000000_hotel_management.sql",
  "supabase/migrations/20260103000000_photos.sql",
];

const PUBLIC_FUNCTIONS = new Set([
  "room_availability", "create_booking", "get_booking", "cancel_booking", "public_hotels",
  "admin_list_bookings", "admin_list_hotels", "admin_save_hotel", "admin_delete_hotel",
  "admin_list_room_types", "admin_save_room_type", "admin_delete_room_type",
  "admin_calendar", "admin_list_blocks", "admin_add_block", "admin_delete_block", "admin_image_in_use",
]);

const photos = new Map<string, { type: string; bytes: Buffer }>();

async function main() {
  const db = new PGlite(process.env.MOCK_SUPABASE_DATA_DIR || undefined);
  const hasTables = (await db.query<{ n: number }>(
    "select count(*)::int n from information_schema.tables where table_name = 'room_types'"
  )).rows[0].n;
  if (!hasTables) {
    // MOCK_MIGRATIONS_ONLY=1 starts with just the first migration (to test the upgrade message).
    for (const m of process.env.MOCK_MIGRATIONS_ONLY ? MIGRATIONS.slice(0, 1) : MIGRATIONS) await db.exec(readFileSync(m, "utf8"));
    if (process.env.MOCK_SKIP_SEED && !process.env.MOCK_MIGRATIONS_ONLY) await db.exec("delete from public.room_types; delete from public.hotels;");
    else if (ROOMS && !process.env.MOCK_MIGRATIONS_ONLY) await db.exec(`update public.room_types set total_rooms = ${Number(ROOMS)}`);
  }

  createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    try {
      // --- photo storage: upload (POST/PUT) and public read (GET) ---
      const up = /^\/storage\/v1\/object\/hotel-images\/([A-Za-z0-9._-]+)$/.exec(req.url ?? "");
      if (up && (req.method === "POST" || req.method === "PUT")) {
        if (req.headers.apikey !== KEY) return send(401, { message: "Invalid API key" });
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        photos.set(up[1], { type: String(req.headers["content-type"] || "application/octet-stream"), bytes: Buffer.concat(chunks) });
        return send(200, { Key: `hotel-images/${up[1]}` });
      }
      if (req.method === "DELETE" && req.url === "/storage/v1/object/hotel-images") {
        if (req.headers.apikey !== KEY) return send(401, { message: "Invalid API key" });
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const { prefixes } = JSON.parse(Buffer.concat(chunks).toString() || "{}") as { prefixes?: string[] };
        for (const name of prefixes ?? []) photos.delete(name);
        return send(200, (prefixes ?? []).map((name) => ({ name })));
      }
      const pub = /^\/storage\/v1\/object\/public\/hotel-images\/([A-Za-z0-9._-]+)$/.exec(req.url ?? "");
      if (pub && req.method === "GET") {
        const p = photos.get(pub[1]);
        if (!p) return send(404, { message: "not found" });
        res.writeHead(200, { "Content-Type": p.type, "Content-Length": p.bytes.length });
        return void res.end(p.bytes);
      }

      const m = /^\/rest\/v1\/rpc\/([a-z_]+)$/.exec(req.url ?? "");
      if (req.method !== "POST" || !m || !PUBLIC_FUNCTIONS.has(m[1])) return send(404, { message: "not found" });
      if (req.headers.apikey !== KEY) return send(401, { message: "Invalid API key" });

      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = raw ? JSON.parse(raw) : {};
      const r = await db.query<{ r: unknown }>(`select public.${m[1]}($1::jsonb) as r`, [
        JSON.stringify(body.p ?? {}),
      ]);
      send(200, r.rows[0].r);
    } catch (e) {
      send(400, { code: "P0001", message: (e as Error).message });
    }
  }).listen(PORT, "127.0.0.1", () =>
    console.log(`Mock Supabase listening on http://127.0.0.1:${PORT} (api key: ${KEY})`)
  );
}

main();
