import { SITE_URL, formatINR } from "../../data/hotels";
import { escapeHtml, getTransporter, hotelInbox, mailConfigured } from "../mailer";
import type { Booking } from "./service";

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", weekday: "short", timeZone: "UTC",
  });
};

function rows(b: Booking) {
  const line = (k: string, v: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#777">${escapeHtml(k)}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`;
  return [
    line("Booking reference", b.reference),
    line("Hotel", b.hotel_name ?? b.hotel),
    line("Room", `${b.room_type} × ${b.rooms}`),
    line("Check-in", fmtDate(b.check_in)),
    line("Check-out", fmtDate(b.check_out)),
    line("Nights", String(b.nights)),
    line("Guests", `${b.adults} adult(s), ${b.children} child(ren)`),
    line("Guest", `${b.guest_name} · ${b.guest_phone}`),
    line("Rate", `${formatINR(b.nightly_rate)} per room per night`),
    ...(b.discount > 0 ? [line("Corporate discount", `−${formatINR(b.discount)}`)] : []),
    line("Total (pay at hotel)", formatINR(b.total)),
    ...(b.notes ? [line("Requests", b.notes)] : []),
  ].join("");
}

/**
 * Sends the guest confirmation (if they gave an email) and the hotel
 * notification. Never throws: a mail problem must not undo a confirmed booking.
 */
export async function sendBookingEmails(b: Booking): Promise<{ guest: boolean; hotel: boolean }> {
  const out = { guest: false, hotel: false };
  if (!mailConfigured()) return out;
  const t = getTransporter();
  const from = `"Al Noor Group of Hotels"<${process.env.GMAIL_USER}>`;
  const hotelName = b.hotel_name ?? b.hotel;

  try {
    await t.sendMail({
      from,
      to: hotelInbox(),
      subject: `New booking ${b.reference} · ${hotelName} · ${b.room_type}`,
      html: `<h2>New booking (pay at hotel)</h2><table>${rows(b)}</table>`,
    });
    out.hotel = true;
  } catch (e) {
    console.error("hotel booking email failed", e);
  }

  if (b.guest_email) {
    try {
      await t.sendMail({
        from,
        to: b.guest_email,
        subject: `Your booking ${b.reference} at ${hotelName} is confirmed`,
        html: `
          <h2>Your booking is confirmed</h2>
          <p>Thank you, ${escapeHtml(b.guest_name)}. Payment is made at the hotel on arrival.</p>
          <table>${rows(b)}</table>
          <p>Need to change or cancel? Use your reference and phone number at
          <a href="${SITE_URL}/manage-booking">${SITE_URL}/manage-booking</a>.</p>
          <p>Al Noor Group of Hotels</p>`,
      });
      out.guest = true;
    } catch (e) {
      console.error("guest booking email failed", e);
    }
  }
  return out;
}

export async function sendCancellationEmail(b: Booking): Promise<void> {
  if (!mailConfigured()) return;
  try {
    await getTransporter().sendMail({
      from: `"Al Noor Group of Hotels"<${process.env.GMAIL_USER}>`,
      to: hotelInbox(),
      subject: `Cancelled ${b.reference} · ${b.hotel_name ?? b.hotel}`,
      html: `<h2>Booking cancelled (${escapeHtml(b.cancelled_by ?? "")})</h2><table>${rows(b)}</table>`,
    });
  } catch (e) {
    console.error("cancellation email failed", e);
  }
}
