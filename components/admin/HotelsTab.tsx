import { useRef, useState } from "react";
import { AMENITY_OPTIONS, BUNDLED_IMAGES } from "../../data/hotels";
import type { AdminHotel } from "../../lib/booking/service";
import { deleteUnusedPhotos, explain, send } from "./api";
import PhotoManager from "./PhotoManager";
import { FieldError, Label, Notice, btn, btnDanger, btnSolid, field } from "./ui";

interface Form {
  mode: "create" | "update";
  slug: string;
  name: string;
  city: string;
  state: string;
  tagline: string;
  description: string;
  phone: string;
  lat: string;
  lng: string;
  /** Main photo first, then the gallery. */
  photos: string[];
  amenities: string[];
  active: boolean;
  sort_order: string;
}

const DEFAULT_PHOTO = "/img/lobby.webp";

const blank = (nextOrder: number): Form => ({
  mode: "create", slug: "", name: "", city: "", state: "", tagline: "", description: "",
  phone: "", lat: "", lng: "", photos: [], amenities: ["Wi-Fi", "Parking"],
  active: true, sort_order: String(nextOrder),
});

/** The cover is only a real photo when it is not the default placeholder with nothing else uploaded. */
const hotelPhotos = (h: AdminHotel): string[] => {
  const all = [h.image, ...(h.images ?? [])];
  const real = all.filter((u, i) => all.indexOf(u) === i);
  return real.length === 1 && real[0] === DEFAULT_PHOTO ? [] : real;
};

const fromHotel = (h: AdminHotel): Form => ({
  mode: "update", slug: h.slug, name: h.name, city: h.city, state: h.state, tagline: h.tagline,
  description: h.description, phone: h.phone, lat: h.lat === null ? "" : String(h.lat),
  lng: h.lng === null ? "" : String(h.lng), photos: hotelPhotos(h), amenities: h.amenities,
  active: h.active, sort_order: String(h.sort_order),
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export default function HotelsTab({
  hotels,
  reload,
  onAddRooms,
}: {
  hotels: AdminHotel[];
  reload: () => Promise<void>;
  onAddRooms: (slug: string) => void;
}) {
  const [form, setForm] = useState<Form | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "green" | "red"; text: string; slug?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const initialPhotos = useRef<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = (f: Form) => {
    setForm(f);
    initialPhotos.current = f.photos;
    setErrors({});
    setMessage(null);
    setSlugTouched(f.mode === "update");
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setErrors({});
    const payload: Record<string, unknown> = {
      mode: form.mode, slug: form.slug.trim(), name: form.name, city: form.city, state: form.state,
      tagline: form.tagline, description: form.description, phone: form.phone,
      lat: form.lat.trim(), lng: form.lng.trim(),
      image: form.photos[0] ?? DEFAULT_PHOTO, images: form.photos.slice(1), amenities: form.amenities,
      active: form.active,
    };
    if (form.sort_order.trim() !== "") payload.sort_order = Number(form.sort_order);
    const { ok, data } = await send("/api/admin/hotels", "POST", payload);
    setSaving(false);
    if (ok) {
      await deleteUnusedPhotos(initialPhotos.current, form.photos);
      await reload();
      setMessage({
        tone: "green",
        text: form.mode === "create" ? `${data.hotel.name} was added.` : `${data.hotel.name} was saved.`,
        slug: form.mode === "create" ? data.hotel.slug : undefined,
      });
      setForm(null);
      return;
    }
    if (data?.fields) setErrors(data.fields);
    else setErrors({ _: explain(data) });
  };

  const toggleActive = async (h: AdminHotel) => {
    const { ok, data } = await send("/api/admin/hotels", "POST", { mode: "update", slug: h.slug, active: !h.active });
    if (ok) await reload();
    else setMessage({ tone: "red", text: explain(data) });
  };

  const remove = async (h: AdminHotel) => {
    if (!window.confirm(`Delete ${h.name}? Its rooms will be removed too. This cannot be undone.`)) return;
    const { ok, data } = await send("/api/admin/hotels", "DELETE", { slug: h.slug });
    if (ok) {
      setMessage({ tone: "green", text: `${h.name} was deleted.` });
      await reload();
    } else setMessage({ tone: "red", text: `${h.name}: ${explain(data)}` });
  };

  const nextOrder = hotels.reduce((m, h) => Math.max(m, h.sort_order), 0) + 1;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          Hotels shown on the website. Hidden hotels are not shown or bookable. Changes appear on the site straight away.
        </p>
        <button className={btnSolid} onClick={() => open(blank(nextOrder))}>+ Add hotel</button>
      </div>

      {message && (
        <Notice tone={message.tone}>
          {message.text}{" "}
          {message.slug && (
            <button className="ml-2 underline" onClick={() => onAddRooms(message.slug!)}>
              Add rooms to this hotel →
            </button>
          )}
        </Notice>
      )}

      {form && (
        <div ref={panelRef} className="mb-8 border border-[#C9A24B]/40 bg-white/[0.03] p-5">
          <h2 className="mb-4 font-serif text-xl">{form.mode === "create" ? "Add a hotel" : `Edit ${form.name}`}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="h-name">Hotel name *</Label>
              <input id="h-name" className={`${field} w-full`} value={form.name}
                onChange={(e) => set({ name: e.target.value, ...(form.mode === "create" && !slugTouched ? { slug: slugify(e.target.value) } : {}) })}
                placeholder="Al Noor Mysore" />
              <FieldError msg={errors.name} />
            </div>
            <div>
              <Label htmlFor="h-slug" hint={form.mode === "create" ? "used in the web address" : "cannot be changed"}>URL name *</Label>
              <input id="h-slug" className={`${field} w-full`} value={form.slug} disabled={form.mode === "update"}
                onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} placeholder="al-noor-mysore" />
              {form.slug && <p className="mt-1 text-xs text-white/40">/hotels/{form.slug}</p>}
              <FieldError msg={errors.slug} />
            </div>
            <div>
              <Label htmlFor="h-city">City *</Label>
              <input id="h-city" className={`${field} w-full`} value={form.city} onChange={(e) => set({ city: e.target.value })} placeholder="Mysuru" />
              <FieldError msg={errors.city} />
            </div>
            <div>
              <Label htmlFor="h-state">State</Label>
              <input id="h-state" className={`${field} w-full`} value={form.state} onChange={(e) => set({ state: e.target.value })} placeholder="Karnataka" />
              <FieldError msg={errors.state} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="h-tagline" hint="one short line">Tagline</Label>
              <input id="h-tagline" className={`${field} w-full`} maxLength={160} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="A calm stay near the palace" />
              <FieldError msg={errors.tagline} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="h-desc">Description</Label>
              <textarea id="h-desc" rows={4} maxLength={1500} className={`${field} w-full`} value={form.description} onChange={(e) => set({ description: e.target.value })} />
              <FieldError msg={errors.description} />
            </div>
            <div>
              <Label htmlFor="h-phone" hint="10 digits; blank uses the main number">Phone</Label>
              <input id="h-phone" inputMode="numeric" className={`${field} w-full`} value={form.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="9876543210" />
              <FieldError msg={errors.phone} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="h-lat" hint="for the map">Latitude</Label>
                <input id="h-lat" className={`${field} w-full`} value={form.lat} onChange={(e) => set({ lat: e.target.value })} placeholder="12.2958" />
                <FieldError msg={errors.lat} />
              </div>
              <div>
                <Label htmlFor="h-lng">Longitude</Label>
                <input id="h-lng" className={`${field} w-full`} value={form.lng} onChange={(e) => set({ lng: e.target.value })} placeholder="76.6394" />
                <FieldError msg={errors.lng} />
              </div>
              <p className="col-span-2 -mt-1 text-xs text-white/40">
                In Google Maps, right-click the hotel and click the two numbers to copy them. Leave blank to hide the map.
              </p>
            </div>

            <div className="md:col-span-2">
              <Label hint="The first photo is the cover. The rest fill the hotel's gallery.">Photos</Label>
              <PhotoManager
                id="h-photo"
                photos={form.photos}
                onChange={(photos) => set({ photos })}
                max={12}
                stock={BUNDLED_IMAGES}
                firstLabel="Cover"
                emptyNote="No photos yet. The site will show a default photo until you add one."
              />
              <FieldError msg={errors.image || errors.images} />
            </div>

            <div className="md:col-span-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-[#C9A24B]" checked={form.amenities.includes(a)}
                      onChange={(e) => set({ amenities: e.target.checked ? [...form.amenities, a] : form.amenities.filter((x) => x !== a) })} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-6 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[#C9A24B]" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
                Show on the website and allow bookings
              </label>
              <div>
                <Label htmlFor="h-order" hint="lower shows first">Display order</Label>
                <input id="h-order" type="number" min={0} className={`${field} w-24`} value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} />
                <FieldError msg={errors.sort_order} />
              </div>
            </div>
          </div>
          {errors._ && <p role="alert" className="mt-4 text-sm text-[#ffb4ab]">{errors._}</p>}
          <div className="mt-6 flex gap-3">
            <button className={btnSolid} disabled={saving} onClick={save}>{saving ? "Saving…" : form.mode === "create" ? "Add hotel" : "Save changes"}</button>
            <button className={btn} onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
            <tr>{["Hotel", "City", "Rooms", "Bookings", "On website", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.slug} className="border-t border-white/10 align-middle">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.image} alt="" className="h-10 w-14 object-cover" />
                    <div>{h.name}<div className="text-xs text-white/40">/hotels/{h.slug}</div></div>
                  </div>
                </td>
                <td className="px-3 py-2">{h.city}{h.state && <span className="text-white/40">, {h.state}</span>}</td>
                <td className="px-3 py-2">{h.room_types} type(s)</td>
                <td className="px-3 py-2">{h.bookings}</td>
                <td className="px-3 py-2"><span className={h.active ? "text-[#EBC166]" : "text-white/40"}>{h.active ? "Visible" : "Hidden"}</span></td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button className={btn} onClick={() => open(fromHotel(h))}>Edit</button>
                    <button className={btn} onClick={() => onAddRooms(h.slug)}>Rooms</button>
                    <button className={btn} onClick={() => toggleActive(h)}>{h.active ? "Hide" : "Show"}</button>
                    <button className={btnDanger} onClick={() => remove(h)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-white/50">No hotels yet. Click “Add hotel”.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
