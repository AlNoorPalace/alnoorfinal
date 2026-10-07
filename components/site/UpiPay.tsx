import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { upiLink } from "../../lib/upi";
import { formatINR } from "../../data/hotels";

/**
 * Optional advance payment by UPI. Booking stays "pay at the hotel": this only
 * gives guests a scannable QR / app link for the exact amount. We can't see the
 * payment from here, so the hotel matches it using the booking reference.
 */
export default function UpiPay({ amount, reference }: { amount: number; reference: string }) {
  const link = upiLink(amount, reference);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!link) return;
    let alive = true;
    import("qrcode")
      .then((m) => m.toDataURL(link, { width: 480, margin: 1, errorCorrectionLevel: "H", color: { dark: "#000000", light: "#ffffff" } }))
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [link]);

  if (!link) return null;

  return (
    <section aria-label="Pay now by UPI" className="mt-6 w-full max-w-sm border border-gold/30 bg-surface p-5 text-center">
      <h3 className="font-serif text-[22px] text-on-surface">Prefer to pay now?</h3>
      <p className="mt-1 text-[13px] text-on-surface-variant">
        Optional. Pay {formatINR(amount)} by UPI now, or pay at the hotel on arrival.
      </p>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={`UPI QR code to pay ${formatINR(amount)}`} width={176} height={176} className="mx-auto mt-4 h-44 w-44 bg-white p-2" />
      )}
      <a
        href={link}
        className="mt-4 inline-flex items-center justify-center gap-2 border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors hover:bg-gold hover:text-ink lg:hidden"
      >
        <Smartphone size={14} /> Pay with a UPI app
      </a>
      <p className="mt-3 text-[11px] leading-4 text-on-surface-variant">
        Scan with any UPI app. The amount and booking reference are filled in. Keep your payment screen to show at check-in.
      </p>
    </section>
  );
}
