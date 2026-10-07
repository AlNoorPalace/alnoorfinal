import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** A room's photo, with arrows and dots when it has more than one. Fills its (relative) parent. */
export default function RoomPhotos({ images, name, sizes }: { images: string[]; name: string; sizes: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const at = Math.min(i, n - 1);
  const step = (d: 1 | -1) => setI((c) => (Math.min(c, n - 1) + d + n) % n);

  return (
    <>
      <Image
        key={images[at]}
        src={images[at]}
        alt={n > 1 ? `${name} room, photo ${at + 1} of ${n}` : `${name} room`}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {n > 1 && (
        <>
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => step(d)}
              aria-label={d === -1 ? `Previous photo of ${name}` : `Next photo of ${name}`}
              className={`absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-ink/70 text-gold-soft backdrop-blur transition-colors hover:bg-gold hover:text-ink ${d === -1 ? "left-2" : "right-2"}`}
            >
              {d === -1 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          ))}
          <span className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" aria-hidden>
            {images.map((src, k) => (
              <span key={src} className={`h-1.5 w-1.5 rounded-full ${k === at ? "bg-gold-soft" : "bg-white/50"}`} />
            ))}
          </span>
        </>
      )}
    </>
  );
}
