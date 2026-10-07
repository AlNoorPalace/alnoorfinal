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
