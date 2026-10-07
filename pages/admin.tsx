import { FormEvent, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { HOTELS } from "../data/hotels";

interface AdminBooking {
  reference: string; hotel: string; room_type: string; check_in: string; check_out: string;
  nights: number; rooms: number; adults: number; children: number; guest_name: string;
  guest_phone: string; guest_email: string | null; notes: string | null; corporate: boolean;
  total: number; status: "confirmed" | "cancelled"; created_at: string;
}
interface RoomRow { id: string; hotel: string; name: string; total_rooms: number; base_rate: number; max_guests: number; active: boolean }

const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);
const hotelName = (slug: string) => HOTELS.find((h) => h.slug === slug)?.name.replace("Al Noor ", "") ?? slug;

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  return { res, data: await res.json().catch(() => ({})) };
}

export default function Admin() {
  const [session, setSession] = useState<{ configured: boolean; databaseConfigured: boolean; authed: boolean } | null>(null);
  const [tab, setTab] = useState<"bookings" | "rooms">("bookings");

  const refreshSession = useCallback(async () => {
    const { data } = await api("/api/admin/session");
    setSession(data);
  }, []);
  useEffect(() => { refreshSession(); }, [refreshSession]);

  const field = "border border-white/15 bg-[#1c1b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#C9A24B]";
  const btn = "border border-[#C9A24B]/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#EBC166] hover:bg-[#C9A24B]/10 disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1]">
      <Head>
        <title>Admin | Al Noor Group of Hotels</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <header className="flex items-center justify-between border-b border-[#C9A24B]/20 px-6 py-4">
        <div className="font-serif text-xl uppercase tracking-wider text-[#EBC166]">Al Noor · Admin</div>
        {session?.authed && (
          <button className={btn} onClick={async () => { await api("/api/admin/logout", { method: "POST", body: "{}" }); refreshSession(); }}>
            Sign out
          </button>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {!session && <p className="text-white/60">Loading…</p>}
        {session && !session.configured && (
          <Notice>The admin dashboard is not available. See the README for setup.</Notice>
        )}
        {session?.configured && !session.authed && <Login onDone={refreshSession} field={field} btn={btn} />}
        {session?.authed && (
          <>
            {!session.databaseConfigured && (
              <Notice>The booking database is not connected. See the README (Set up Supabase).</Notice>
            )}
            <div className="mb-6 flex gap-2">
              {(["bookings", "rooms"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider ${tab === t ? "bg-[#C9A24B] text-black" : "border border-white/15 text-white/70 hover:text-white"}`}>
                  {t === "bookings" ? "Bookings" : "Rooms & rates"}
                </button>
              ))}
            </div>
            {tab === "bookings" ? <Bookings field={field} btn={btn} /> : <Rooms field={field} btn={btn} />}
          </>
        )}
      </main>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 border border-[#C9A24B]/40 bg-[#C9A24B]/10 p-4 text-sm text-[#EBC166]">{children}</p>;
}

function Login({ onDone, field, btn }: { onDone: () => void; field: string; btn: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { res } = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) onDone();
    else setError(res.status === 429 ? "Too many attempts. Wait a few minutes." : "Wrong password.");
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-4 border border-white/10 p-6">
      <h1 className="font-serif text-2xl">Sign in</h1>
      <input type="password" aria-label="Admin password" className={`${field} w-full`} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      {error && <p role="alert" className="text-sm text-[#ffb4ab]">{error}</p>}
      <button className={`${btn} w-full`}>Sign in</button>
    </form>
  );
}

function Bookings({ field, btn }: { field: string; btn: string }) {
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [f, setF] = useState({ hotel: "", status: "", from: "", to: "", q: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    const { res, data } = await api(`/api/admin/bookings?${qs}`);
    if (res.ok) { setRows(data.bookings); setError(""); } else setError(res.status === 503 ? "Database not configured." : "Could not load bookings.");
    setLoading(false);
  }, [f]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (reference: string) => {
    if (!window.confirm(`Cancel booking ${reference}? The guest's room will be released.`)) return;
    const { res } = await api("/api/admin/bookings", { method: "POST", body: JSON.stringify({ reference }) });
    if (res.ok) load(); else setError("Could not cancel that booking.");
  };

  const confirmed = rows.filter((r) => r.status === "confirmed");
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <input aria-label="Search" className={field} placeholder="Search name, phone, reference" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select aria-label="Hotel" className={field} value={f.hotel} onChange={(e) => setF({ ...f, hotel: e.target.value })}>
          <option value="">All hotels</option>
          {HOTELS.map((h) => <option key={h.slug} value={h.slug}>{hotelName(h.slug)}</option>)}
        </select>
        <select aria-label="Status" className={field} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">Any status</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
        </select>
        <label className="text-xs text-white/60">Check-in from <input type="date" className={`${field} ml-1`} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></label>
        <label className="text-xs text-white/60">to <input type="date" className={`${field} ml-1`} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></label>
        <button className={btn} onClick={load}>Refresh</button>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {loading ? "Loading…" : `${rows.length} booking(s) · ${confirmed.length} confirmed · ${inr(confirmed.reduce((s, r) => s + r.total, 0))} confirmed value (pay at hotel)`}
      </p>
      {error && <p role="alert" className="mb-3 text-sm text-[#ffb4ab]">{error}</p>}
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
            <tr>{["Reference", "Guest", "Hotel · Room", "Stay", "Guests", "Total", "Status", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.reference} className="border-t border-white/10 align-top">
                <td className="px-3 py-2 font-mono text-[#EBC166]">{b.reference}<div className="font-sans text-[11px] text-white/40">{new Date(b.created_at).toLocaleString("en-IN")}</div></td>
                <td className="px-3 py-2">{b.guest_name}<div className="text-white/60"><a href={`tel:${b.guest_phone}`}>{b.guest_phone}</a></div>{b.guest_email && <div className="text-white/40">{b.guest_email}</div>}{b.notes && <div className="mt-1 text-xs italic text-white/50">“{b.notes}”</div>}</td>
                <td className="px-3 py-2">{hotelName(b.hotel)}<div className="text-white/60">{b.room_type} × {b.rooms}</div></td>
                <td className="px-3 py-2 whitespace-nowrap">{b.check_in} → {b.check_out}<div className="text-white/60">{b.nights} night(s)</div></td>
                <td className="px-3 py-2">{b.adults}A {b.children}C</td>
                <td className="px-3 py-2">{inr(b.total)}{b.corporate && <div className="text-xs text-[#EBC166]">corporate</div>}</td>
                <td className="px-3 py-2"><span className={b.status === "confirmed" ? "text-[#EBC166]" : "text-[#ffb4ab]"}>{b.status}</span></td>
                <td className="px-3 py-2 text-right">{b.status === "confirmed" && <button className={btn} onClick={() => cancel(b.reference)}>Cancel</button>}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-white/50">No bookings match.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Rooms({ field, btn }: { field: string; btn: string }) {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api("/api/admin/rooms").then(({ res, data }) => {
      if (res.ok) setRows(data.roomTypes);
      else setError("Could not load rooms.");
      setLoaded(true);
    });
  }, []);

  const edit = (id: string, patch: Partial<RoomRow>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const save = async (r: RoomRow) => {
    const { res } = await api("/api/admin/rooms", { method: "PATCH", body: JSON.stringify({ id: r.id, total_rooms: Number(r.total_rooms), base_rate: Number(r.base_rate), active: r.active }) });
    setSaved((s) => ({ ...s, [r.id]: res.ok ? "Saved" : "Invalid values" }));
    setTimeout(() => setSaved((s) => ({ ...s, [r.id]: "" })), 2500);
  };

  return (
    <section>
      <Notice>
        <strong>Set the real number of rooms for each room type before taking bookings.</strong> Availability and
        overbooking protection are based on these counts. New bookings use the rates below.
      </Notice>
      {error && <p role="alert" className="mb-3 text-sm text-[#ffb4ab]">{error}</p>}
      {loaded && !error && rows.length === 0 && (
        <p role="status" className="mb-3 border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 p-4 text-sm text-[#ffb4ab]">
          No room types found, so guests can&apos;t book online. Run <code>supabase/seed.sql</code> in the Supabase SQL Editor, then reload this page.
        </p>
      )}
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
            <tr>{["Hotel", "Room type", "Rooms", "Rate / night (₹)", "Max guests", "Bookable", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-3 py-2">{hotelName(r.hotel)}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2"><input type="number" min={0} aria-label={`${hotelName(r.hotel)} ${r.name} rooms`} className={`${field} w-24`} value={r.total_rooms} onChange={(e) => edit(r.id, { total_rooms: e.target.value as unknown as number })} /></td>
                <td className="px-3 py-2"><input type="number" min={1} aria-label={`${hotelName(r.hotel)} ${r.name} rate`} className={`${field} w-28`} value={r.base_rate} onChange={(e) => edit(r.id, { base_rate: e.target.value as unknown as number })} /></td>
                <td className="px-3 py-2 text-white/60">{r.max_guests}</td>
                <td className="px-3 py-2"><input type="checkbox" aria-label={`${hotelName(r.hotel)} ${r.name} bookable`} checked={r.active} onChange={(e) => edit(r.id, { active: e.target.checked })} className="h-4 w-4 accent-[#C9A24B]" /></td>
                <td className="px-3 py-2 text-right"><button className={btn} onClick={() => save(r)}>Save</button> <span className="ml-2 text-xs text-[#EBC166]">{saved[r.id]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
