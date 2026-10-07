import type { NextApiRequest, NextApiResponse } from "next";
import { escapeHtml, getTransporter, hotelInbox } from "../../lib/mailer";

/**
 * Legacy "booking request" email. The site uses it only when the booking
 * engine (Supabase) is not configured; otherwise bookings go through
 * /api/bookings.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not allowed" });

  const { room_type, name, phone, email, branch, checkin, checkout, days, query, isCorporateBooking } =
    req.body ?? {};

  if (!name || !phone || !branch || !checkin || !checkout) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  const clean = (v: unknown) => String(v ?? "").slice(0, 80).replace(/[\r\n]/g, " ");

  const mailOptions = {
    from: `"AL Noor Booking"<${process.env.GMAIL_USER}>`,
    to: hotelInbox(),
    subject: `Booking request from ${clean(name)} at ${clean(branch)}`,
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email || "N/A")}</p>
      <p><strong>Branch:</strong> ${escapeHtml(branch)}</p>
      <p><strong>Room:</strong> ${escapeHtml(room_type)}</p>
      <p><strong>Check-in:</strong> ${escapeHtml(checkin)}</p>
      <p><strong>Check-out:</strong> ${escapeHtml(checkout)}</p>
      <p><strong>Days:</strong> ${escapeHtml(days)}</p>
      <p><strong>Corporate Booking:</strong> ${isCorporateBooking ? "Yes (20% Discount Applied)" : "No"}</p>
      <p><strong>Additional Requests:</strong> ${escapeHtml(query || "None")}</p>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Could not send the booking request." });
  }
}
