import { FormEvent, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import AvailabilityTab from "../components/admin/AvailabilityTab";
import BookingsTab from "../components/admin/BookingsTab";
import HotelsTab from "../components/admin/HotelsTab";
import ImagesTab from "../components/admin/ImagesTab";
import RoomsTab from "../components/admin/RoomsTab";
import { api, send } from "../components/admin/api";
import { Notice, btn, field } from "../components/admin/ui";
import type { AdminHotel } from "../lib/booking/service";

type Tab = "bookings" | "hotels" | "rooms" | "availability" | "images";
const TABS: { id: Tab; label: string }[] = [
  { id: "bookings", label: "Bookings" },
  { id: "hotels", label: "Hotels" },
  { id: "rooms", label: "Rooms & rates" },
  { id: "availability", label: "Availability" },
  { id: "images", label: "Images" },
];

export default function Admin() {
  const [session, setSession] = useState<{ configured: boolean; databaseConfigured: boolean; authed: boolean } | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [hotelSlug, setHotelSlug] = useState("");
  const [hotelsError, setHotelsError] = useState(false);

  const refreshSession = useCallback(async () => {
    const { data } = await api("/api/admin/session");
    setSession(data);
  }, []);
  useEffect(() => { refreshSession(); }, [refreshSession]);

  const loadHotels = useCallback(async () => {
    const { ok, data } = await api("/api/admin/hotels");
    setHotelsError(!ok);
    if (ok) {
      setHotels(data.hotels);
      setHotelSlug((cur) => (data.hotels.some((h: AdminHotel) => h.slug === cur) ? cur : data.hotels[0]?.slug ?? ""));
    }
  }, []);
  useEffect(() => { if (session?.authed) loadHotels(); }, [session?.authed, loadHotels]);

  const goRooms = (slug: string) => { setHotelSlug(slug); setTab("rooms"); };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1]">
      <Head>
        <title>Admin | Al Noor Group of Hotels</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <header className="flex items-center justify-between border-b border-[#C9A24B]/20 px-6 py-4">
        <div className="font-serif text-xl uppercase tracking-wider text-[#EBC166]">Al Noor · Admin</div>
        {session?.authed && (
          <button className={btn} onClick={async () => { await send("/api/admin/logout", "POST", {}); refreshSession(); }}>
            Sign out
          </button>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {!session && <p className="text-white/60">Loading…</p>}
        {session && !session.configured && <Notice>The admin dashboard is not available. See the README for setup.</Notice>}
        {session?.configured && !session.authed && <Login onDone={refreshSession} />}
        {session?.authed && (
          <>
            {!session.databaseConfigured && <Notice>The booking database is not connected. See the README (Set up Supabase).</Notice>}
            {session.databaseConfigured && hotelsError && (
              <Notice tone="red">
                The hotel list could not be loaded. If you recently updated the site, run the second database file
                (<code>supabase/migrations/20260102000000_hotel_management.sql</code>) in the Supabase SQL Editor, then reload.
              </Notice>
            )}
            <div className="mb-6 flex flex-wrap gap-2" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider ${tab === t.id ? "bg-[#C9A24B] text-black" : "border border-white/15 text-white/70 hover:text-white"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {tab === "bookings" && <BookingsTab hotels={hotels} />}
            {tab === "hotels" && <HotelsTab hotels={hotels} reload={loadHotels} onAddRooms={goRooms} />}
            {tab === "rooms" && <RoomsTab hotels={hotels} hotelSlug={hotelSlug} setHotelSlug={setHotelSlug} reloadHotels={loadHotels} />}
            {tab === "images" && <ImagesTab />}
            {tab === "availability" && <AvailabilityTab hotels={hotels} initialHotel={hotelSlug} />}
          </>
        )}
      </main>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { ok, status } = await send("/api/admin/login", "POST", { password });
    if (ok) onDone();
    else setError(status === 429 ? "Too many attempts. Wait a few minutes." : "Wrong password.");
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
