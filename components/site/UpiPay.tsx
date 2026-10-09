import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { minAdvance, parseAdvance, upiLink } from "../../lib/upi";
import { formatINR } from "../../data/hotels";

/**
 * Optional advance payment by UPI. The guest picks how much to pay (at least
 * ₹500, up to the booking total) and gets a QR for exactly that amount. The
 * booking stays "pay at the hotel": we can't see the payment from here, so the
 * hotel matches it using the booking reference in the UPI note.
 */
export default function UpiPay({ amount: total, reference }: { amount: number; reference: string }) {
  const min = minAdvance(total);
  const [text, setText] = useState(String(min));
  const [qr, setQr] = useState<string | null>(null);

  const parsed = parseAdvance(text, total);
  const link = parsed.ok ? upiLink(parsed.amount, reference) : null;

  useEffect(() => {
    if (!link) {
      setQr(null);
      return;
    }
    let alive = true;
    import("qrcode")
      .then((m) => m.toDataURL(link, { width: 480, margin: 1, errorCorrectionLevel: "H", color: { dark: "#000000", light: "#ffffff" } }))
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [link]);

  if (!Number.isFinite(total) || total <= 0) return null;
  const balance = parsed.ok ? total - parsed.amount : null;
  const quick = [min, total].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <section aria-label="Pay an advance by UPI" className="mt-6 w-full max-w-sm border border-gold/30 bg-surface p-5 text-center">
      <h3 className="font-serif text-[22px] text-on-surface">Pay an advance</h3>
      <p className="mt-1 text-[13px] text-on-surface-variant">
        Optional. Pay any amount from {formatINR(min)} now to secure your stay, and the rest at the hotel.
      </p>

      <label htmlFor="upi-amount" className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        Amount to pay now (₹)
      </label>
      <input
        id="upi-amount"
        inputMode="numeric"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\D/g, "").slice(0, 7))}
        aria-invalid={!parsed.ok}
        aria-describedby="upi-amount-help"
        className="mt-1 w-40 border border-gold/40 bg-surface-lowest px-3 py-2 text-center font-serif text-[22px] text-on-surface outline-none focus:border-gold"
      />
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {quick.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setText(String(v))}
            className="border border-gold/30 px-3 py-1 text-[11px] uppercase tracking-wider text-gold-soft hover:bg-gold/10"
          >
            {v === total ? `Full ${formatINR(v)}` : `Minimum ${formatINR(v)}`}
          </button>
        ))}
      </div>
      <p id="upi-amount-help" role={parsed.ok ? undefined : "alert"} className={`mt-2 text-[12px] ${parsed.ok ? "text-on-surface-variant" : "text-[#ffb4ab]"}`}>
        {parsed.ok
          ? balance === 0
            ? "Nothing left to pay at the hotel."
            : `Balance of ${formatINR(balance!)} payable at the hotel.`
          : parsed.error}
      </p>

      {parsed.ok && qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={`UPI QR code to pay ${formatINR(parsed.amount)}`} width={176} height={176} className="mx-auto mt-4 h-44 w-44 bg-white p-2" />
      )}
      {link && (
        <a
          href={link}
          className="mt-4 inline-flex items-center justify-center gap-2 border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors hover:bg-gold hover:text-ink lg:hidden"
        >
          <Smartphone size={14} /> Pay {formatINR(parsed.ok ? parsed.amount : 0)} with a UPI app
        </a>
      )}
      <p className="mt-3 text-[11px] leading-4 text-on-surface-variant">
        Scan with any UPI app. The amount and booking reference are filled in. Keep your payment screen to show at check-in.
      </p>
    </section>
  );
}
