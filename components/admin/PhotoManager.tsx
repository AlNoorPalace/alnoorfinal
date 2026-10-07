import { useRef, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { explain, prepareImage, send } from "./api";
import { FieldError, btn } from "./ui";

/**
 * A list of photos you can add to, delete from and reorder. The first photo is
 * the main one. Uploaded files and bundled site photos are both supported.
 */
export default function PhotoManager({
  id,
  photos,
  onChange,
  max,
  stock,
  firstLabel,
  emptyNote,
}: {
  id: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  max: number;
  stock: { src: string; label: string }[];
  firstLabel: string;
  emptyNote: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stockOpen, setStockOpen] = useState(false);

  const room = max - photos.length;

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, Math.max(room, 0))) {
        try {
          const { ok, data } = await send("/api/admin/upload", "POST", { data: await prepareImage(file) });
          if (ok) added.push(data.url);
          else setError(explain(data, "Could not upload a photo."));
        } catch {
          setError("Could not read one of the photos. Use JPEG, PNG or WebP.");
        }
      }
      if (files.length > room) setError(`You can have at most ${max} photos here.`);
      if (added.length) onChange([...photos, ...added]);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (i: number) => onChange(photos.filter((_, n) => n !== i));
  const makeFirst = (i: number) => onChange([photos[i], ...photos.filter((_, n) => n !== i)]);
  const unused = stock.filter((s) => !photos.includes(s.src));

  return (
    <div>
      {photos.length === 0 ? (
        <p className="mb-3 text-xs text-white/50">{emptyNote}</p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-3">
          {photos.map((src, i) => (
            <li key={src} className={`w-32 border-2 ${i === 0 ? "border-[#EBC166]" : "border-white/15"}`}>
              <div className="relative h-20 overflow-hidden bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Delete photo ${i + 1}`}
                  title="Delete this photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/75 text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-black"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between px-1.5 py-1 text-[10px] uppercase tracking-wider">
                {i === 0 ? (
                  <span className="font-semibold text-[#EBC166]">{firstLabel}</span>
                ) : (
                  <button type="button" onClick={() => makeFirst(i)} className="flex items-center gap-1 text-white/60 hover:text-[#EBC166]" aria-label={`Make photo ${i + 1} the ${firstLabel.toLowerCase()}`}>
                    <ArrowLeft size={11} /> Make {firstLabel.toLowerCase()}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} id={id} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files)} />
        <button type="button" className={btn} disabled={busy || room <= 0} onClick={() => fileRef.current?.click()}>
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        {unused.length > 0 && (
          <button type="button" className={btn} disabled={room <= 0} onClick={() => setStockOpen((o) => !o)} aria-expanded={stockOpen}>
            {stockOpen ? "Hide site photos" : "Pick a site photo"}
          </button>
        )}
        <span className="text-xs text-white/40">{photos.length}/{max} · JPEG, PNG or WebP, shrunk automatically</span>
      </div>

      {stockOpen && room > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {unused.map((s) => (
            <li key={s.src}>
              <button type="button" title={s.label} aria-label={`Add site photo: ${s.label}`} onClick={() => onChange([...photos, s.src])} className="block h-14 w-20 overflow-hidden border-2 border-transparent opacity-75 hover:border-[#EBC166] hover:opacity-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.label} className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldError msg={error} />
    </div>
  );
}
