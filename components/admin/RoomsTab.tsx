import { useCallback, useEffect, useState } from "react";
import type { AdminHotel, AdminRoomType } from "../../lib/booking/service";
import { api, explain, send } from "./api";
import { FieldError, Label, Notice, btn, btnDanger, btnSolid, field } from "./ui";

type Row = Omit<AdminRoomType, "total_rooms" | "base_rate" | "max_guests" | "beds" | "baths"> & {
  total_rooms: string; base_rate: string; max_guests: string; beds: string; baths: string;
};
const toRow = (r: AdminRoomType): Row => ({
  ...r, total_rooms: String(r.total_rooms), base_rate: String(r.base_rate),
  max_guests: String(r.max_guests), beds: String(r.beds), baths: String(r.baths),
});
const numbers = (r: { total_rooms: string; base_rate: string; max_guests: string; beds: string; baths: string }) => ({
  total_rooms: Number(r.total_rooms), base_rate: Number(r.base_rate),
  max_guests: Number(r.max_guests), beds: Number(r.beds), baths: Number(r.baths),
});
const blankNew = { name: "", total_rooms: "1", base_rate: "", max_guests: "2", beds: "1", baths: "1" };

export default function RoomsTab({
  hotels,
  hotelSlug,
  setHotelSlug,
  reloadHotels,
}: {
  hotels: AdminHotel[];
  hotelSlug: string;
  setHotelSlug: (s: string) => void;
  reloadHotels: () => Promise<void>;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);
  const [newRoom, setNewRoom] = useState(blankNew);
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { ok, data } = await api("/api/admin/rooms");
    if (ok) setRows((data.roomTypes as AdminRoomType[]).map(toRow));
    else setMsg({ tone: "red", text: "Could not load rooms." });
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  const hotel = hotels.find((h) => h.slug === hotelSlug);
  const mine = rows.filter((r) => r.hotel === hotelSlug);
  const edit = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (r: Row) => {
    const { ok, data } = await send("/api/admin/rooms", "POST", { id: r.id, name: r.name, active: r.active, ...numbers(r) });
    if (ok) { setMsg({ tone: "green", text: `Saved ${r.name}.` }); await load(); await reloadHotels(); }
    else setMsg({ tone: "red", text: `${r.name}: ${data?.fields ? Object.values(data.fields).join(" ") : explain(data)}` });
  };

  const remove = async (r: Row) => {
    if (!window.confirm(`Delete room type "${r.name}"? This cannot be undone.`)) return;
    const { ok, data } = await send("/api/admin/rooms", "DELETE", { id: r.id });
    if (ok) { setMsg({ tone: "green", text: `Deleted ${r.name}.` }); await load(); await reloadHotels(); }
    else setMsg({ tone: "red", text: `${r.name}: ${explain(data)}` });
  };

  const add = async () => {
    setNewErrors({});
    const { ok, data } = await send("/api/admin/rooms", "POST", { hotel: hotelSlug, name: newRoom.name, ...numbers(newRoom) });
    if (ok) {
      setMsg({ tone: "green", text: `Added ${newRoom.name} to ${hotel?.name}.` });
      setNewRoom(blankNew);
      await load();
      await reloadHotels();
    } else if (data?.fields) setNewErrors(data.fields);
    else setNewErrors({ _: explain(data) });
  };

  const cell = "px-2 py-2";
  const num = `${field} w-20`;

  return (
    <section>
      <Notice>
        <strong>Rooms</strong> is the number of rooms of that type. Availability and overbooking protection are based on it.
        New bookings use the rate shown. Untick <em>Bookable</em> to stop selling a room type.
      </Notice>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Label htmlFor="r-hotel">Hotel</Label>
        <select id="r-hotel" className={field} value={hotelSlug} onChange={(e) => setHotelSlug(e.target.value)}>
          {hotels.map((h) => <option key={h.slug} value={h.slug}>{h.name}{h.active ? "" : " (hidden)"}</option>)}
        </select>
      </div>

      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {loaded && hotels.length === 0 && <Notice tone="red">Add a hotel first (Hotels tab).</Notice>}

      {hotel && (
        <>
          <div className="mb-6 border border-[#C9A24B]/30 bg-white/[0.03] p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EBC166]">Add a room type to {hotel.name}</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div><Label htmlFor="n-name">Room name</Label><input id="n-name" className={`${field} w-48`} value={newRoom.name} placeholder="Deluxe" onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} /><FieldError msg={newErrors.name} /></div>
              <div><Label htmlFor="n-rooms">Rooms</Label><input id="n-rooms" type="number" min={0} className={num} value={newRoom.total_rooms} onChange={(e) => setNewRoom({ ...newRoom, total_rooms: e.target.value })} /></div>
              <div><Label htmlFor="n-rate">Rate / night (₹)</Label><input id="n-rate" type="number" min={1} className={`${field} w-28`} value={newRoom.base_rate} placeholder="1499" onChange={(e) => setNewRoom({ ...newRoom, base_rate: e.target.value })} /><FieldError msg={newErrors.base_rate} /></div>
              <div><Label htmlFor="n-guests">Max guests</Label><input id="n-guests" type="number" min={1} className={num} value={newRoom.max_guests} onChange={(e) => setNewRoom({ ...newRoom, max_guests: e.target.value })} /></div>
              <div><Label htmlFor="n-beds">Beds</Label><input id="n-beds" type="number" min={1} className={num} value={newRoom.beds} onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })} /></div>
              <div><Label htmlFor="n-baths">Baths</Label><input id="n-baths" type="number" min={1} className={num} value={newRoom.baths} onChange={(e) => setNewRoom({ ...newRoom, baths: e.target.value })} /></div>
              <button className={btnSolid} onClick={add}>Add room type</button>
            </div>
            {newErrors._ && <p role="alert" className="mt-3 text-sm text-[#ffb4ab]">{newErrors._}</p>}
          </div>

          <div className="overflow-x-auto border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <tr>{["Room type", "Rooms", "Rate / night (₹)", "Max guests", "Beds", "Baths", "Bookable", "Bookings", ""].map((h) => <th key={h} className={`${cell} font-medium`}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className={cell}><input aria-label={`${r.name} name`} className={`${field} w-44`} value={r.name} onChange={(e) => edit(r.id, { name: e.target.value })} /></td>
                    <td className={cell}><input type="number" min={0} aria-label={`${r.name} rooms`} className={num} value={r.total_rooms} onChange={(e) => edit(r.id, { total_rooms: e.target.value })} /></td>
                    <td className={cell}><input type="number" min={1} aria-label={`${r.name} rate`} className={`${field} w-28`} value={r.base_rate} onChange={(e) => edit(r.id, { base_rate: e.target.value })} /></td>
                    <td className={cell}><input type="number" min={1} aria-label={`${r.name} max guests`} className={num} value={r.max_guests} onChange={(e) => edit(r.id, { max_guests: e.target.value })} /></td>
                    <td className={cell}><input type="number" min={1} aria-label={`${r.name} beds`} className={num} value={r.beds} onChange={(e) => edit(r.id, { beds: e.target.value })} /></td>
                    <td className={cell}><input type="number" min={1} aria-label={`${r.name} baths`} className={num} value={r.baths} onChange={(e) => edit(r.id, { baths: e.target.value })} /></td>
                    <td className={cell}><input type="checkbox" aria-label={`${r.name} bookable`} checked={r.active} onChange={(e) => edit(r.id, { active: e.target.checked })} className="h-4 w-4 accent-[#C9A24B]" /></td>
                    <td className={`${cell} text-white/60`}>{r.bookings}</td>
                    <td className={cell}><div className="flex justify-end gap-2"><button className={btn} onClick={() => save(r)}>Save</button><button className={btnDanger} onClick={() => remove(r)}>Delete</button></div></td>
                  </tr>
                ))}
                {loaded && mine.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-white/50">No room types yet. Add one above so guests can book this hotel.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
