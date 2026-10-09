/** Where optional advance UPI payments go. Override with NEXT_PUBLIC_UPI_ID / NEXT_PUBLIC_UPI_NAME. */
export const UPI = {
  id: process.env.NEXT_PUBLIC_UPI_ID || "7338944222@okbizaxis",
  name: process.env.NEXT_PUBLIC_UPI_NAME || "Al Noor Group of Hotels",
} as const;

const VALID_ID = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9]{1,63}$/;

/**
 * A UPI payment link (also what the QR code contains). Returns null for an
 * invalid UPI id or amount so we never show a QR that can't be paid.
 */
export function upiLink(amountRupees: number, reference: string): string | null {
  if (!VALID_ID.test(UPI.id) || !Number.isFinite(amountRupees) || amountRupees <= 0 || amountRupees > 1_000_000) return null;
  const note = `Booking ${reference}`.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 50);
  const q = [
    ["pa", UPI.id],
    ["pn", UPI.name],
    ["am", amountRupees.toFixed(2)],
    ["cu", "INR"],
    ["tn", note],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `upi://pay?${q}`;
}

/** Smallest advance a guest can pay (or the whole bill, if that is less). */
export const MIN_ADVANCE = 500;

export const minAdvance = (total: number) => Math.min(MIN_ADVANCE, Math.max(Math.floor(total), 1));

/**
 * Validates the advance a guest typed. Whole rupees only, from the minimum up to
 * the booking total. Returns the amount, or an error message to show them.
 */
export function parseAdvance(input: string, total: number): { ok: true; amount: number } | { ok: false; error: string } {
  const text = input.trim();
  if (!/^\d{1,7}$/.test(text)) return { ok: false, error: "Enter a whole number of rupees." };
  const amount = Number(text);
  const min = minAdvance(total);
  if (amount < min) return { ok: false, error: `The minimum advance is ₹${min}.` };
  if (amount > total) return { ok: false, error: `That is more than your booking total of ₹${Math.floor(total)}.` };
  return { ok: true, amount };
}
