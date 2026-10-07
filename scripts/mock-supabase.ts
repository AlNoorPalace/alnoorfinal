// Local stand-in for Supabase, for development and automated tests.
//   npm run dev:db
// Runs the real migration + seed on an embedded Postgres (PGlite) and serves the
// small slice of the PostgREST API the site uses: POST /rest/v1/rpc/<function>.
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

const PUBLIC_FUNCTIONS = new Set([
  "room_availability", "create_booking", "get_booking", "cancel_booking",
  "admin_list_bookings", "admin_list_room_types", "admin_update_room_type",
]);

async function main() {
  const db = new PGlite(process.env.MOCK_SUPABASE_DATA_DIR || undefined);
  const hasTables = (await db.query<{ n: number }>(
    "select count(*)::int n from information_schema.tables where table_name = 'room_types'"
  )).rows[0].n;
  if (!hasTables) {
    await db.exec(readFileSync("supabase/migrations/20260101000000_booking_engine.sql", "utf8"));
    if (!process.env.MOCK_SKIP_SEED) await db.exec(readFileSync("supabase/seed.sql", "utf8"));
    if (ROOMS && !process.env.MOCK_SKIP_SEED) await db.exec(`update public.room_types set total_rooms = ${Number(ROOMS)}`);
  }

  createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    try {
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
