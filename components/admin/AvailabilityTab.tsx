import { useCallback, useEffect, useState } from "react";
import type { AdminHotel, AdminRoomType, CalendarDay, RoomBlock } from "../../lib/booking/service";
import { api, explain, send } from "./api";
import { Label, Notice, btn, btnSolid, field } from "./ui";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const shift = (month: string, by: number) => {
  const [y, m] = month.split("-").map(Number);
  return monthOf(new Date(y, m - 1 + by, 1));
};

export default function AvailabilityTab({ hotels, initialHotel }: { hotels: AdminHotel[]; initialHotel: string }) {
  const [hotelSlug, setHotelSlug] = useState(initialHotel || hotels[0]?.slug || "");
  const [rooms, setRooms] = useState<AdminRoomType[]>([]);
  const [roomId, setRoomId] = useState("");
  const [month, setMonth] = useState(monthOf(new Date()));
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [msg, setMsg] = useState<{ tone: "green" | "red" | "gold"; text: string } | null>(null);
  const [form, setForm] = useState({ from: "", to: "", rooms: "", reason: "" });

  useEffect(() => {
    api("/api/admin/rooms").then(({ ok, data }) => ok && setRooms(data.roomTypes));
  }, []);

  const myRooms = rooms.filter((r) => r.hotel === hotelSlug);
  const room = myRooms.find((r) => r.id === roomId);

  // keep a valid room selected when the hotel (or list) changes
  useEffect(() => {
    if (!myRooms.some((r) => r.id === roomId)) setRoomId(myRooms[0]?.id ?? "");
  }, [hotelSlug, rooms]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    if (!roomId) { setDays([]); setBlocks([]); return; }
    const { ok, data } = await api(`/api/admin/availability?roomTypeId=${roomId}&month=${month}`);
    if (ok) { setDays(data.days); setBlocks(data.blocks); }
    else setMsg({ tone: "red", text: explain(data, "Could not load the calendar.") });
  }, [roomId, month]);
  useEffect(() => { load(); }, [load]);

  const close = async () => {
    setMsg(null);
    const payload: Record<string, unknown> = { room_type_id: roomId, from: form.from, to: form.to || form.from, reason: form.reason };
    if (form.rooms.trim() !== "") payload.rooms = Number(form.rooms);
    const { ok, data } = await send("/api/admin/availability", "POST", payload);
    if (!ok) return setMsg({ tone: "red", text: data?.fields ? Object.values(data.fields).join(" ") : explain(data) });
    setForm({ from: "", to: "", rooms: "", reason: "" });
    setMsg(data.overbookedNights > 0
      ? { tone: "gold", text: `Closed. Warning: on ${data.overbookedNights} night(s) there are already more bookings than rooms left. Existing bookings were NOT cancelled; contact those guests or cancel them in Bookings.` }
      : { tone: "green", text: "Rooms closed for those dates. They can no longer be booked." });
    load();
  };

  const reopen = async (b: RoomBlock) => {
    if (!window.confirm(`Reopen ${b.rooms} room(s) of ${b.room_type} for ${b.from}${b.to !== b.from ? ` to ${b.to}` : ""}?`)) return;
    const { ok, data } = await send("/api/admin/availability", "DELETE", { id: b.id });
    if (ok) { setMsg({ tone: "green", text: "Reopened." }); load(); } else setMsg({ tone: "red", text: explain(data) });
  };

  const [y, m] = month.split("-").map(Number);
  const lead = days.length ? new Date(days[0].date + "T00:00:00Z").getUTCDay() : 0;
  const total = room?.total_rooms ?? 0;

  return (
    <section>
      <Notice>
        See how many rooms are free each day, and <strong>close rooms</strong> for maintenance, events or any dates you don&apos;t want to sell.
        Closed rooms are removed from availability straight away. Existing bookings are never cancelled automatically.
      </Notice>

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div><Label htmlFor="a-hotel">Hotel</Label>
          <select id="a-hotel" className={field} value={hotelSlug} onChange={(e) => setHotelSlug(e.target.value)}>
            {hotels.map((h) => <option key={h.slug} value={h.slug}>{h.name}</option>)}
          </select></div>
        <div><Label htmlFor="a-room">Room type</Label>
          <select id="a-room" className={field} value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={myRooms.length === 0}>
            {myRooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.total_rooms} rooms)</option>)}
          </select></div>
      </div>

      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {hotelSlug && myRooms.length === 0 && <Notice tone="red">This hotel has no room types yet. Add some in the Rooms tab.</Notice>}

      {room && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button className={btn} aria-label="Previous month" onClick={() => setMonth(shift(month, -1))}>←</button>
              <h2 className="font-serif text-xl">{MONTHS[m - 1]} {y}</h2>
              <button className={btn} aria-label="Next month" onClick={() => setMonth(shift(month, 1))}>→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-white/40">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1" data-testid="calendar">
              {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
              {days.map((d) => {
                const soldOut = d.available === 0;
                return (
                  <button key={d.date} type="button" title={`${d.date}: ${d.available} of ${total} free, ${d.booked} booked, ${d.blocked} closed`}
                    aria-label={`${d.date}: ${d.available} free`}
                    onClick={() => setForm((f) => ({ ...f, from: d.date, to: d.date }))}
                    className={`min-h-[64px] border p-1.5 text-left text-xs transition-colors hover:border-[#EBC166] ${soldOut ? "border-[#ffb4ab]/40 bg-[#ffb4ab]/10" : d.booked + d.blocked > 0 ? "border-[#C9A24B]/40 bg-[#C9A24B]/10" : "border-white/10"}`}>
                    <div className="flex items-baseline justify-between"><span className="text-white/50">{Number(d.date.slice(8))}</span><span className={`text-base font-semibold ${soldOut ? "text-[#ffb4ab]" : "text-white"}`}>{d.available}</span></div>
                    <div className="mt-0.5 text-[10px] leading-tight text-white/50">{d.booked > 0 && <div>{d.booked} booked</div>}{d.blocked > 0 && <div className="text-[#EBC166]">{d.blocked} closed</div>}</div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-white/40">Number = rooms still free of {total}. Click a day to start closing it.</p>
          </div>

          <div>
            <div className="mb-6 border border-[#C9A24B]/30 bg-white/[0.03] p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EBC166]">Close rooms</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="b-from">From (night)</Label><input id="b-from" type="date" className={`${field} w-full`} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
                  <div><Label htmlFor="b-to" hint="inclusive">To</Label><input id="b-to" type="date" className={`${field} w-full`} value={form.to} min={form.from} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="b-rooms" hint={`blank = all ${total}`}>How many rooms</Label><input id="b-rooms" type="number" min={1} max={total} className={`${field} w-28`} value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} /></div>
                <div><Label htmlFor="b-reason">Reason (optional)</Label><input id="b-reason" maxLength={200} className={`${field} w-full`} value={form.reason} placeholder="Renovation, private event…" onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
                <button className={btnSolid} disabled={!form.from} onClick={close}>Close these rooms</button>
              </div>
            </div>

            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">Current & upcoming closures</h2>
            {blocks.length === 0 && <p className="text-sm text-white/40">None for this room type.</p>}
            <ul className="space-y-2" data-testid="closures">
              {blocks.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 border border-white/10 p-3 text-sm">
                  <div><div>{b.from}{b.to !== b.from && <> → {b.to}</>}</div><div className="text-xs text-white/50">{b.rooms} room(s){b.reason && <> · {b.reason}</>}</div></div>
                  <button className={btn} onClick={() => reopen(b)}>Reopen</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
