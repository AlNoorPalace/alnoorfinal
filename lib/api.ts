import type { NextApiRequest, NextApiResponse } from "next";
import type { ZodError } from "zod";

const ERROR_STATUS: Record<string, number> = {
  sold_out: 409,
  name_taken: 409,
  slug_taken: 409,
  has_bookings: 409,
  hotel_not_found: 404,
  stay_started: 409,
  over_capacity: 422,
  invalid_dates: 400,
  invalid_guests: 400,
  invalid: 400,
  room_not_found: 404,
  not_found: 404,
};
export const statusFor = (error: string) => ERROR_STATUS[error] ?? 400;

/** Responds 405 and returns false when the method isn't allowed. */
export function allow(req: NextApiRequest, res: NextApiResponse, ...methods: string[]): boolean {
  if (req.method && methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: "method_not_allowed" });
  return false;
}

export function sendInvalid(res: NextApiResponse, err: ZodError) {
  const fields: Record<string, string> = {};
  for (const i of err.issues) fields[String(i.path[0] ?? "_")] ??= i.message;
  res.status(400).json({ error: "invalid", fields });
}

export const notConfigured = (res: NextApiResponse) =>
  res.status(503).json({ error: "engine_not_configured" });

export const serverError = (res: NextApiResponse, e: unknown, what: string) => {
  console.error(`${what} failed`, e);
  res.status(500).json({ error: "server_error" });
};
