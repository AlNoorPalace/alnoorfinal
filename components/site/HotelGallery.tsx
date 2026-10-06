import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { GalleryPhoto } from "../../data/hotelContent";

export default function HotelGallery({
  photos,
  name,
}: {
  photos: GalleryPhoto[];
  name: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (d: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const tile = "group relative block overflow-hidden bg-surface focus-visible:z-10";

  return (
    <>
      <div className="grid grid-cols-2 gap-2 lg:h-[440px] lg:grid-cols-4 lg:grid-rows-2">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${p.alt}`}
            className={`${tile} ${
              i === 0
                ? "col-span-2 h-56 lg:row-span-2 lg:h-auto"
                : "h-28 lg:h-auto"
            }`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            {i === photos.length - 1 && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-ink/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-soft backdrop-blur">
                <Images size={14} /> View all photos
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} photo gallery`}
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-gold/40 text-gold hover:bg-gold/10"
            >
              <X size={20} />
            </button>
            {(["prev", "next"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d === "prev" ? "Previous photo" : "Next photo"}
                onClick={(e) => {
                  e.stopPropagation();
                  step(d === "prev" ? -1 : 1);
                }}
                className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/40 bg-black/40 text-gold hover:bg-gold/10 ${
                  d === "prev" ? "left-3 lg:left-6" : "right-3 lg:right-6"
                }`}
              >
                {d === "prev" ? <ChevronLeft /> : <ChevronRight />}
              </button>
            ))}
            <AnimatePresence mode="wait">
              <motion.div
                key={open}
                className="relative h-[72vh] w-[92vw] max-w-5xl"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) step(1);
                  if (info.offset.x > 80) step(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={photos[open].src}
                  alt={photos[open].alt}
                  fill
                  sizes="92vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-5 left-0 right-0 text-center text-[12px] uppercase tracking-widest text-on-surface-variant">
              {photos[open].alt} · {open + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
