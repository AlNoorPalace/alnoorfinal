import nodemailer from "nodemailer";

export const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .slice(0, 1000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const mailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}

export const hotelInbox = () => process.env.HOTEL_BOOKING_EMAIL || "booking@alnoorpalace.in";
