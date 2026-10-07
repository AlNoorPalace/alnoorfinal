import { z } from "zod";
import { AMENITY_OPTIONS } from "../../data/hotels";
import { isAllowedImageUrl } from "../images";

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens, e.g. mysore-palace")
  .max(40);

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

/** "" / null / a number string -> number | null, within range. */
const coord = (min: number, max: number) =>
  z
    .union([z.number(), z.string(), z.null()])
    .transform((v) => (v === null || v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= min && v <= max), `Must be between ${min} and ${max}`);

const photoList = (max: number) =>
  z.array(z.string().refine(isAllowedImageUrl, "Use a site photo or upload a photo")).max(max, `At most ${max} photos`);

export const hotelSave = z
  .object({
    mode: z.enum(["create", "update"]),
    slug,
    name: z.string().trim().min(2, "Enter the hotel name").max(80).optional(),
    city: z.string().trim().min(2, "Enter the city").max(60).optional(),
    state: z.string().trim().max(60).optional(),
    tagline: z.string().trim().max(160).optional(),
    description: z.string().trim().max(1500).optional(),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, "").slice(-10))
      .refine((v) => v === "" || v.length === 10, "Enter a 10-digit phone number")
      .optional(),
    lat: coord(-90, 90).optional(),
    lng: coord(-180, 180).optional(),
    image: z.string().refine(isAllowedImageUrl, "Choose one of the site photos or upload a photo").optional(),
    images: photoList(12).optional(),
    amenities: z.array(z.enum(AMENITY_OPTIONS)).max(AMENITY_OPTIONS.length).optional(),
    active: z.boolean().optional(),
    sort_order: z.number().int().min(0).max(1000).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "create") {
      if (!v.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Enter the hotel name" });
      if (!v.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter the city" });
    }
  });

export const hotelDelete = z.object({ slug });

export const roomSave = z
  .object({
    id: z.string().uuid().optional(),
    hotel: slug.optional(),
    name: z.string().trim().min(1, "Enter a room name").max(60).optional(),
    total_rooms: z.number().int().min(0).max(500).optional(),
    base_rate: z.number().int().min(1).max(1_000_000).optional(),
    max_guests: z.number().int().min(1).max(20).optional(),
    beds: z.number().int().min(1).max(20).optional(),
    baths: z.number().int().min(1).max(20).optional(),
    active: z.boolean().optional(),
    images: photoList(8).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.id) {
      if (!v.hotel) ctx.addIssue({ code: "custom", path: ["hotel"], message: "Choose a hotel" });
      if (!v.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Enter a room name" });
      if (v.base_rate === undefined) ctx.addIssue({ code: "custom", path: ["base_rate"], message: "Enter the nightly rate" });
    }
  });

export const idBody = z.object({ id: z.string().uuid() });

export const calendarQuery = z.object({
  roomTypeId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
});

export const blockAdd = z.object({
  room_type_id: z.string().uuid(),
  from: date,
  to: date,
  rooms: z.number().int().min(1).max(500).optional(),
  reason: z.string().trim().max(200).optional(),
});

export const uploadBody = z.object({
  data: z.string().min(100).max(5_000_000), // base64
});

export const deleteImageBody = z.object({ url: z.string().max(500) });
