import { z } from "zod";
import { HOTELS, getHotel } from "../../data/hotels";
import { LIMITS, addDays, diffDays, todayIST } from "./config";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, "Invalid date");

const hotelSlug = z.string().refine((s) => HOTELS.some((h) => h.slug === s), "Unknown hotel");

/** Shared date rules (today is evaluated in India time). */
function checkStay<T extends { checkIn: string; checkOut: string }>(v: T, ctx: z.RefinementCtx) {
  const today = todayIST();
  if (v.checkIn < today)
    ctx.addIssue({ code: "custom", path: ["checkIn"], message: "Check-in cannot be in the past" });
  if (v.checkIn > addDays(today, LIMITS.maxAdvanceDays))
    ctx.addIssue({ code: "custom", path: ["checkIn"], message: "Too far in advance" });
  const nights = diffDays(v.checkIn, v.checkOut);
  if (nights < 1)
    ctx.addIssue({ code: "custom", path: ["checkOut"], message: "Check-out must be after check-in" });
  if (nights > LIMITS.maxNights)
    ctx.addIssue({ code: "custom", path: ["checkOut"], message: `Maximum stay is ${LIMITS.maxNights} nights` });
}

export const availabilityQuery = z
  .object({ hotel: hotelSlug, checkIn: dateStr, checkOut: dateStr })
  .superRefine(checkStay);

/** Keeps the last 10 digits of whatever the guest typed (+91, spaces, dashes). */
export const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-10);

export const createBookingBody = z
  .object({
    hotel: hotelSlug,
    roomType: z.string().min(1).max(60),
    checkIn: dateStr,
    checkOut: dateStr,
    rooms: z.number().int().min(1).max(LIMITS.maxRooms),
    adults: z.number().int().min(1).max(LIMITS.maxAdults),
    children: z.number().int().min(0).max(LIMITS.maxChildren),
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z.string().transform(normalizePhone).refine((p) => /^\d{10}$/.test(p), "Enter a valid 10-digit phone number"),
    email: z.string().trim().max(120).email("Enter a valid email address").optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional(),
    corporate: z.boolean().default(false),
    /** Honeypot: real users never fill this in. */
    website: z.string().max(0).optional(),
  })
  .superRefine(checkStay)
  .superRefine((v, ctx) => {
    if (!getHotel(v.hotel)?.rooms.some((r) => r.name === v.roomType))
      ctx.addIssue({ code: "custom", path: ["roomType"], message: "Unknown room type" });
  });

export const lookupBody = z.object({
  reference: z.string().trim().min(6).max(20),
  phone: z.string().transform(normalizePhone).refine((p) => /^\d{10}$/.test(p), "Enter the 10-digit phone number used for the booking"),
});

export type CreateBookingInput = z.infer<typeof createBookingBody>;
