import { useCallback, useEffect, useState } from "react";
import type { AdminHotel, Booking } from "../../lib/booking/service";
import { api, send } from "./api";
import { Notice, btn, btnDanger, field, inr } from "./ui";

export default function BookingsTab({ hotels }: { hotels: AdminHotel[] }) {
  const [rows, setRows] = useState<Booking[]>([]);
  const [f, setF] = useState({ hotel: "", status: "", from: "", to: "", q: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    const { ok, status, data } = await api(`/api/admin/bookings?${qs}`);
    if (ok) {
      setRows(data.bookings);
      setError("");
    } else setError(status === 503 ? "Database not configured." : "Could not load bookings.");
    setLoading(false);
  }, [f]);
  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (reference: string) => {
    if (!window.confirm(`Cancel booking ${reference}? The guest's room will be released.`)) return;
    const { ok } = await send("/api/admin/bookings", "POST", { reference });
    if (ok) load();
    else setError("Could not cancel that booking.");
  };

  const remove = async (reference: string, status: string) => {
    const extra = status === "confirmed" ? " It is still confirmed: the room is released and the guest is NOT emailed (use Cancel to email them)." : "";
    if (!window.confirm(`Permanently delete booking ${reference}? This cannot be undone.${extra}`)) return;
    const { ok } = await send("/api/admin/bookings", "DELETE", { reference });
    if (ok) load();
    else setError("Could not delete that booking.");
  };

  const confirmed = rows.filter((r) => r.status === "confirmed");
  const nameOf = (b: Booking) => b.hotel_name ?? hotels.find((h) => h.slug === b.hotel)?.name ?? b.hotel;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <input aria-label="Search" className={field} placeholder="Search name, phone, reference" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select aria-label="Hotel" className={field} value={f.hotel} onChange={(e) => setF({ ...f, hotel: e.target.value })}>
          <option value="">All hotels</option>
          {hotels.map((h) => (
            <option key={h.slug} value={h.slug}>{h.name}</option>
          ))}
        </select>
        <select aria-label="Status" className={field} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">Any status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <label className="text-xs text-white/60">Check-in from <input type="date" className={`${field} ml-1`} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></label>
        <label className="text-xs text-white/60">to <input type="date" className={`${field} ml-1`} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></label>
        <button className={btn} onClick={load}>Refresh</button>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {loading ? "Loading…" : `${rows.length} booking(s) · ${confirmed.length} confirmed · ${inr(confirmed.reduce((s, r) => s + r.total, 0))} confirmed value (pay at hotel)`}
      </p>
      {error && <Notice tone="red">{error}</Notice>}
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
                <td className="px-3 py-2">{nameOf(b)}<div className="text-white/60">{b.room_type} × {b.rooms}</div></td>
                <td className="whitespace-nowrap px-3 py-2">{b.check_in} → {b.check_out}<div className="text-white/60">{b.nights} night(s)</div></td>
                <td className="px-3 py-2">{b.adults}A {b.children}C</td>
                <td className="px-3 py-2">{inr(b.total)}{b.corporate && <div className="text-xs text-[#EBC166]">corporate</div>}</td>
                <td className="px-3 py-2"><span className={b.status === "confirmed" ? "text-[#EBC166]" : "text-[#ffb4ab]"}>{b.status}</span></td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    {b.status === "confirmed" && <button className={btn} onClick={() => cancel(b.reference)}>Cancel</button>}
                    <button className={btnDanger} onClick={() => remove(b.reference, b.status)} aria-label={`Delete booking ${b.reference}`}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-white/50">No bookings match.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
