import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { MIGRATIONS } from "./helpers/pg";

// The owner runs these by hand in the Supabase SQL editor, so a file must not fail
// just because an earlier one was skipped, and running a file twice must be harmless.
test("the latest file works right after the first two (earlier optional files skipped)", async () => {
  const db = new PGlite();
  for (const m of [MIGRATIONS[0], MIGRATIONS[1], MIGRATIONS[MIGRATIONS.length - 1]]) await db.exec(readFileSync(m, "utf8"));
  const r = await db.query<any>("select public.public_hotels('{}'::jsonb) r");
  assert.ok(r.rows[0].r.length >= 7);
});

test("every file can be run twice", async () => {
  const db = new PGlite();
  for (const m of MIGRATIONS) await db.exec(readFileSync(m, "utf8"));
  for (const m of MIGRATIONS.slice(1)) await db.exec(readFileSync(m, "utf8"));
  const r = await db.query<any>("select public.admin_list_room_types('{}'::jsonb) r");
  assert.ok(r.rows[0].r.length >= 19);
});

test("if the later files were run out of order, running the latest file again restores everything", async () => {
  const db = new PGlite();
  const last = MIGRATIONS[MIGRATIONS.length - 1];
  for (const m of [MIGRATIONS[0], MIGRATIONS[1], last, MIGRATIONS[3], MIGRATIONS[4], last]) await db.exec(readFileSync(m, "utf8"));
  const r = await db.query<any>("select public.public_hotels('{}'::jsonb) r");
  const parrys = r.rows[0].r.find((h: any) => h.slug === "parrys");
  assert.match(parrys.address, /NSC Bose Road/);
  assert.equal(typeof parrys.rooms[0].description, "string");
});
