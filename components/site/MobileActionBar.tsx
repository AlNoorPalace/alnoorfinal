import Link from "next/link";
import { Building2, CalendarDays, Phone } from "lucide-react";
import { CONTACT } from "../../data/hotels";
import { useBooking } from "./BookingContext";

/** Fixed bottom bar, phones and tablets only. */
export default function MobileActionBar() {
  const { focusBar } = useBooking();
  const item =
    "flex h-12 min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-on-surface-variant transition-colors active:scale-95 hover:text-gold-soft";
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/15 bg-surface-lowest/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_-6px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:hidden"
    >
      <div className="flex h-[72px] items-center gap-2 px-4">
        <a href={`tel:${CONTACT.primaryTel}`} className={item}>
          <Phone size={20} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">Call</span>
        </a>
        <Link href="/hotels" className={item}>
          <Building2 size={20} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">Hotels</span>
        </Link>
        <button
          type="button"
          onClick={() => focusBar()}
          className="flex h-12 flex-[2.2] items-center justify-center gap-2 bg-gold-gradient px-4 text-eyebrow font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_4px_16px_rgba(201,162,75,0.25)] active:opacity-90"
        >
          <CalendarDays size={18} /> Book Now
        </button>
      </div>
    </nav>
  );
}
