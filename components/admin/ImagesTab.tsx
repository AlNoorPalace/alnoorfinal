import { useCallback, useEffect, useRef, useState } from "react";
import { BUNDLED_IMAGES } from "../../data/hotels";
import { explain, prepareImage, send, api } from "./api";
import { Notice, btn, btnDanger } from "./ui";

interface Slot { key: string; label: string; where: string; fallback: string; url: string | null }
interface LibFile { name: string; url: string; size: number; createdAt: string | null; usedBy: string[] }

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function ImagesTab() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [files, setFiles] = useState<LibFile[]>([]);
  const [libError, setLibError] = useState("");
  const [msg, setMsg] = useState<{ tone: "green" | "red"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pickFor, setPickFor] = useState<string | null>(null);
  const slotFile = useRef<HTMLInputElement>(null);
  const libFile = useRef<HTMLInputElement>(null);
  const uploadingSlot = useRef<string>("");

  const load = useCallback(async () => {
    const s = await api("/api/admin/site-images");
    if (s.ok) setSlots(s.data.slots);
    else setMsg({ tone: "red", text: "Could not load the website pictures. Run the latest database file (20260105000000_site_images_and_deletes.sql), then reload." });
    const l = await api("/api/admin/library");
    if (l.ok) { setFiles(l.data.files); setLibError(""); }
    else setLibError("Could not list the uploaded photos. Check that the hotel-images storage bucket exists.");
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (file: File): Promise<string | null> => {
    try {
      const { ok, data } = await send("/api/admin/upload", "POST", { data: await prepareImage(file) });
      if (ok) return data.url as string;
      setMsg({ tone: "red", text: explain(data, "Could not upload the photo.") });
    } catch {
      setMsg({ tone: "red", text: "Could not read that photo. Use JPEG, PNG or WebP." });
    }
    return null;
  };

  const setSlot = async (slot: string, url: string, okText: string) => {
    setBusy(slot);
    const { ok, data } = await send("/api/admin/site-images", "POST", { slot, url });
    setBusy(null);
    if (ok) { setMsg({ tone: "green", text: okText }); setPickFor(null); await load(); }
    else setMsg({ tone: "red", text: data?.fields ? Object.values(data.fields).join(" ") : explain(data) });
  };

  const onSlotFile = async (file: File | undefined) => {
    const slot = uploadingSlot.current;
    if (!file || !slot) return;
    setBusy(slot);
    const url = await upload(file);
    setBusy(null);
    if (url) await setSlot(slot, url, "Picture updated. The website will show it right away.");
    if (slotFile.current) slotFile.current.value = "";
  };

  const onLibFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy("library");
    let n = 0;
    for (const f of Array.from(list)) if (await upload(f)) n++;
    setBusy(null);
    if (n) setMsg({ tone: "green", text: `Uploaded ${n} photo${n > 1 ? "s" : ""}. Use them from the Hotels, Rooms or website pictures above.` });
    if (libFile.current) libFile.current.value = "";
    await load();
  };

  const removeFile = async (f: LibFile) => {
    if (!window.confirm("Delete this photo permanently?")) return;
    const { ok, data } = await send("/api/admin/upload", "DELETE", { url: f.url });
    if (!ok) setMsg({ tone: "red", text: explain(data) });
    else if (data.removed === false) setMsg({ tone: "red", text: "That photo is still used on the website, so it was not deleted. Remove it there first." });
    else setMsg({ tone: "green", text: "Photo deleted." });
    await load();
  };

  return (
    <section>
      <Notice>
        Change the pictures on the website here. Hotel and room photos are edited in the <strong>Hotels</strong> and <strong>Rooms &amp; rates</strong> tabs.
        Photos you upload are shrunk automatically (JPEG, PNG or WebP, up to 3 MB).
      </Notice>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#EBC166]">Website pictures</h2>
      <input ref={slotFile} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Choose a picture file" onChange={(e) => onSlotFile(e.target.files?.[0])} />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((s) => {
          const current = s.url ?? s.fallback;
          return (
            <li key={s.key} className="border border-white/10 bg-white/[0.03] p-4">
              <div className="relative mb-3 h-40 overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current} alt={s.label} className="h-full w-full object-cover" />
                {!s.url && <span className="absolute left-2 top-2 bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">Default</span>}
              </div>
              <h3 className="font-semibold text-white">{s.label}</h3>
              <p className="mb-3 text-xs text-white/50">{s.where}</p>
              <div className="flex flex-wrap gap-2">
                <button className={btn} disabled={busy === s.key} onClick={() => { uploadingSlot.current = s.key; slotFile.current?.click(); }} aria-label={`Upload a new picture for ${s.label}`}>
                  {busy === s.key ? "Saving…" : "Upload new"}
                </button>
                <button className={btn} aria-expanded={pickFor === s.key} onClick={() => setPickFor(pickFor === s.key ? null : s.key)} aria-label={`Choose an existing picture for ${s.label}`}>
                  Choose existing
                </button>
                {s.url && (
                  <button className={btnDanger} disabled={busy === s.key} onClick={() => window.confirm(`Remove your picture and use the default for "${s.label}"?`) && setSlot(s.key, "", "Default picture restored.")} aria-label={`Remove the custom picture for ${s.label}`}>
                    Delete
                  </button>
                )}
              </div>
              {pickFor === s.key && (
                <ul className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
                  {[...BUNDLED_IMAGES.map((b) => ({ src: b.src, label: b.label })), ...files.map((f) => ({ src: f.url, label: "Uploaded photo" }))].map((o) => (
                    <li key={o.src}>
                      <button type="button" title={o.label} aria-label={`Use: ${o.label}`} onClick={() => setSlot(s.key, o.src, "Picture updated. The website will show it right away.")} className={`block h-14 w-20 overflow-hidden border-2 ${current === o.src ? "border-[#EBC166]" : "border-transparent opacity-75 hover:border-[#EBC166] hover:opacity-100"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.src} alt={o.label} className="h-full w-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <h2 className="mb-1 mt-10 text-sm font-semibold uppercase tracking-wider text-[#EBC166]">Uploaded photos</h2>
      <p className="mb-3 text-xs text-white/50">Every photo you have uploaded. A photo that is in use can't be deleted until you remove it from where it is used.</p>
      <input ref={libFile} id="lib-upload" type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onLibFiles(e.target.files)} />
      <button className={btn} disabled={busy === "library"} onClick={() => libFile.current?.click()}>
        {busy === "library" ? "Uploading…" : "Add photos"}
      </button>
      {libError && <p role="alert" className="mt-3 text-sm text-[#ffb4ab]">{libError}</p>}
      {!libError && files.length === 0 && <p className="mt-4 text-sm text-white/50">No uploaded photos yet.</p>}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {files.map((f) => (
          <li key={f.url} className="border border-white/10 bg-white/[0.03]">
            <div className="h-28 overflow-hidden bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1 p-2 text-[11px] text-white/60">
              <div>{kb(f.size)}{f.createdAt ? ` · ${new Date(f.createdAt).toLocaleDateString("en-IN")}` : ""}</div>
              {f.usedBy.length > 0 ? (
                <div className="text-[#EBC166]">Used by: {f.usedBy.slice(0, 3).join(", ")}{f.usedBy.length > 3 ? ` +${f.usedBy.length - 3}` : ""}</div>
              ) : (
                <div>Not used</div>
              )}
              <button className={`${btnDanger} w-full !px-2 !py-1`} disabled={f.usedBy.length > 0} onClick={() => removeFile(f)} aria-label="Delete this uploaded photo" title={f.usedBy.length ? "Remove it from where it is used first" : "Delete"}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
