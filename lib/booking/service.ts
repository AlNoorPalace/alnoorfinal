import { CORPORATE_DISCOUNT_PCT, diffDays, todayIST } from "./config";
import type { Db } from "./db";
import type { CreateBookingInput } from "./schemas";

export interface RoomAvailability {
  room_type: string;
  total_rooms: number;
  available: number;
  rate: number;
  max_guests: number;
}

export interface Booking {
  reference: string;
  hotel: string;
  room_type: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  notes: string | null;
  corporate: boolean;
  nightly_rate: number;
  subtotal: number;
  discount: number;
  total: number;
  status: "confirmed" | "cancelled";
  payment_method: string;
  created_at: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
}

type Result<T> = ({ ok: true } & T) | { ok: false; error: string; [k: string]: unknown };

export const getAvailability = (db: Db, q: { hotel: string; checkIn: string; checkOut: string }) =>
  db.rpc<RoomAvailability[]>("room_availability", {
    hotel: q.hotel,
    check_in: q.checkIn,
    check_out: q.checkOut,
  });

export const createBooking = (db: Db, v: CreateBookingInput) =>
  db.rpc<Result<{ booking: Booking }>>("create_booking", {
    hotel: v.hotel,
    room_type: v.roomType,
    check_in: v.checkIn,
    check_out: v.checkOut,
    rooms: v.rooms,
    adults: v.adults,
    children: v.children,
    guest_name: v.name,
    guest_phone: v.phone,
    guest_email: v.email ?? "",
    notes: v.notes ?? "",
    corporate: v.corporate,
    discount_pct: v.corporate ? CORPORATE_DISCOUNT_PCT : 0,
  });

export const lookupBooking = (db: Db, v: { reference: string; phone: string }) =>
  db.rpc<Result<{ booking: Booking }>>("get_booking", v);

export const cancelBooking = (db: Db, v: { reference: string; phone: string }) =>
  db.rpc<Result<{ booking: Booking; already_cancelled?: boolean }>>("cancel_booking", {
    ...v,
    today: todayIST(),
  });

export const adminCancel = (db: Db, reference: string) =>
  db.rpc<Result<{ booking: Booking }>>("cancel_booking", { reference, admin: true, today: todayIST() });

export const adminListBookings = (
  db: Db,
  f: { hotel?: string; status?: string; from?: string; to?: string; q?: string }
) => db.rpc<Booking[]>("admin_list_bookings", { ...f, limit: 300 });

export interface AdminRoomType {
  id: string;
  hotel: string;
  name: string;
  total_rooms: number;
  base_rate: number;
  max_guests: number;
  active: boolean;
}

export const adminListRoomTypes = (db: Db) => db.rpc<AdminRoomType[]>("admin_list_room_types", {});

export const adminUpdateRoomType = (
  db: Db,
  v: { id: string; total_rooms?: number; base_rate?: number; active?: boolean }
) => db.rpc<Result<{ room_type: AdminRoomType }>>("admin_update_room_type", v);

export const nightsFor = (checkIn: string, checkOut: string) => diffDays(checkIn, checkOut);
