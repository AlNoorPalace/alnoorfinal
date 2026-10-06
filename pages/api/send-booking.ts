import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .slice(0, 1000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not allowed" });

  const {
    room_type,
    name,
    phone,
    email,
    branch,
    checkin,
    checkout,
    days,
    query,
    isCorporateBooking,
  } = req.body;

  if (!name || !phone || !branch || !checkin || !checkout) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  // Single email for all hotels (update this email when provided)
  const SINGLE_EMAIL = process.env.HOTEL_BOOKING_EMAIL || "booking@alnoorpalace.in";

  const recipientEmail = SINGLE_EMAIL;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
  });

  const mailOptions = {
    from: `"AL Noor Booking"<${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: `Booking request from ${String(name).slice(0, 80).replace(/[\r\n]/g, " ")} at ${String(branch).slice(0, 80).replace(/[\r\n]/g, " ")}`,
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
      <p><strong>Corporate Booking:</strong> ${
        isCorporateBooking ? "✅ Yes (20% Discount Applied)" : "❌ No"
      }</p>
      <p><strong>Additional Requests:</strong> ${escapeHtml(query || "None")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Could not send the booking request." });
  }
}
