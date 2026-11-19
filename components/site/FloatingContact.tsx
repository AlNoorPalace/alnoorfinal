import { useRouter } from "next/router";
import { Phone } from "lucide-react";
import { CONTACT } from "../../data/hotels";

const WHATSAPP_URL = `${CONTACT.whatsapp}?text=${encodeURIComponent("Hello Al Noor, I'd like to know about booking a room.")}`;

function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden focusable="false">
      <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.01L4 29l8.12-1.57a12 12 0 0 0 3.92.66h.01C22.7 28.09 28 22.7 28 16.05 28 9.4 22.68 3 16.04 3Zm0 22.07h-.01a9.97 9.97 0 0 1-5.08-1.39l-.36-.22-4.82.93.99-4.7-.24-.38a9.9 9.9 0 0 1-1.52-5.27c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.91 7.05c0 5.5-4.47 9.97-9.88 9.97Zm5.47-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

/**
 * WhatsApp and call buttons that stay in the bottom-right corner on every page,
 * on phones and on desktop. On phones they sit above the bottom action bar.
 */
export default function FloatingContact() {
  const { pathname } = useRouter();
  if (pathname.startsWith("/admin")) return null;

  // Round icon buttons (small footprint, so they cover as little of the page as possible).
  // On desktop a label slides out on hover or keyboard focus.
  const base =
    "group pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft lg:h-14 lg:w-14";
  const tip =
    "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-surface-lowest/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block";
  return (
    <div
      className="pointer-events-none fixed right-4 z-[60] flex flex-col items-end gap-3 bottom-[calc(72px+0.75rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:right-6"
      data-testid="floating-contact"
    >
      <a
        href={`tel:${CONTACT.primaryTel}`}
        aria-label={`Call Al Noor on ${CONTACT.phones[0].label}`}
        className={`${base} bg-gold-gradient !text-ink`}
      >
        <Phone size={24} aria-hidden />
        <span className={tip} aria-hidden>Call us</span>
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Al Noor on WhatsApp"
        className={`${base} bg-[#25D366]`}
      >
        <WhatsAppIcon />
        <span className={tip} aria-hidden>WhatsApp</span>
      </a>
    </div>
  );
}
