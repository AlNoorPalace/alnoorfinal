import { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

  const branchEmails: Record<string, string> = {
    "Triplicane Branch": "booking@alnoorpalace.in",
    "Parrys Branch": "booking@alnoorresidency.in",
    "Bengaluru Branch": "booking.blr@alnoorpalace.in",
  };

  // Change the email to testing before sending a request...Developer())...

  const recipientEmail = branchEmails[branch] || "booking@alnoorpalace.in";

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"AL Noor Booking"<${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: `Booking request from ${name} at ${branch}`,
    html: `
        <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email || "N/A"}</p>
      <p><strong>Branch:</strong> ${branch}</p>
      <p><strong>Room:</strong> ${room_type}</p>
      <p><strong>Check-in:</strong> ${checkin}</p>
      <p><strong>Check-out:</strong> ${checkout}</p>
      <p><strong>Days:</strong> ${days}</p>
      <p><strong>Corporate Booking:</strong> ${
        isCorporateBooking ? "✅ Yes (20% Discount Applied)" : "❌ No"
      }</p>
      <p><strong>Additional Requests:</strong> ${query || "None"}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
