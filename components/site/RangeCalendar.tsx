import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTHS,
  fromISO,
  nightsBetween,
  toISO,
  todayISO,
} from "./dates";

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  onComplete?: () => void;
  /** Always show one month (for narrow containers). */
  single?: boolean;
}

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Month({
  year,
  month,
  checkIn,
  checkOut,
  hover,
  onPick,
  onHover,
  className,
}: {
  className?: string;
  year: number;
  month: number;
  checkIn: string | null;
  checkOut: string | null;
  hover: string | null;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const today = todayISO();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: days }, (_, i) => toISO(new Date(year, month, i + 1))),
  ];
  const rangeEnd = checkOut ?? (checkIn && hover && hover > checkIn ? hover : null);

  return (
    <div className={className ?? "w-[252px]"}>
      <div className="mb-3 text-center font-serif text-[19px] text-on-surface">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-widest text-gold/80">
        {WEEK.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const past = iso < today;
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange =
            checkIn && rangeEnd && iso > checkIn && iso < rangeEnd;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(iso)}
              onMouseLeave={() => onHover(null)}
              className={[
                "relative h-9 text-[13px] transition-colors",
                past ? "cursor-not-allowed text-white/20" : "text-on-surface",
                inRange ? "bg-gold/20" : "",
                isStart || isEnd
                  ? "bg-gold-gradient font-semibold !text-ink"
                  : !past
                  ? "hover:bg-gold/30"
                  : "",
              ].join(" ")}
              aria-label={iso}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RangeCalendar({
  checkIn,
  checkOut,
  onChange,
  onComplete,
  single = false,
}: Props) {
  const start = useMemo(() => {
    const d = checkIn ? fromISO(checkIn) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState(start);
  const [hover, setHover] = useState<string | null>(null);

  const next = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const canPrev = view > thisMonth;

  const pick = (iso: string) => {
    if (!checkIn || checkOut || iso <= checkIn) {
      onChange(iso, null);
      return;
    }
    onChange(checkIn, iso);
    onComplete?.();
  };

  const nights = nightsBetween(checkIn, checkOut);

  return (
    <div>
      <div className={`relative flex gap-8 px-9 ${single ? "" : "md:px-0"}`}>
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canPrev}
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
          }
          className="absolute left-0 top-0 md:-left-1 flex h-7 w-7 items-center justify-center border border-gold/40 text-gold disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <Month
          className={single ? "w-full" : "w-full md:w-[252px]"}
          year={view.getFullYear()}
          month={view.getMonth()}
          checkIn={checkIn}
          checkOut={checkOut}
          hover={hover}
          onPick={pick}
          onHover={setHover}
        />
        <Month
          className={single ? "hidden" : "hidden w-[252px] md:block"}
          year={next.getFullYear()}
          month={next.getMonth()}
          checkIn={checkIn}
          checkOut={checkOut}
          hover={hover}
          onPick={pick}
          onHover={setHover}
        />
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
          }
          className="absolute right-0 top-0 md:-right-1 flex h-7 w-7 items-center justify-center border border-gold/40 text-gold"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gold/20 pt-3 text-[12px]">
        <span className="uppercase tracking-widest text-gold">
          {nights > 0
            ? `${nights} night${nights > 1 ? "s" : ""}`
            : checkIn
            ? "Select check-out"
            : "Select check-in"}
        </span>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-on-surface-variant underline-offset-4 hover:text-gold hover:underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
