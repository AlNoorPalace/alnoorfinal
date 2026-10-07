# Al Noor Group of Hotels

Marketing and booking-request website for Al Noor Group of Hotels (alnoorpalace.in): seven hotels in Chennai, Bengaluru, Hyderabad and Ooty.

Built with Next.js (Pages Router), React 18, TypeScript, Tailwind CSS and Framer Motion.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server          |
| `npm run build`     | Production build              |
| `npm start`         | Serve the production build    |
| `npm run typecheck` | Type-check without emitting   |
| `npm test`          | Run the SQL, validation and service tests |
| `npm run dev:db`    | Local Supabase stand-in (see below) |
| `npm run seed:sql`  | Regenerate `supabase/seed.sql` from `data/hotels.ts` |

## Environment variables

See `.env.example` for the full list with comments.

| Variable                    | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `SUPABASE_URL`              | Supabase project URL (booking engine)                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** service-role key. Server-only, never `NEXT_PUBLIC_` |
| `ADMIN_PASSWORD`            | Password for `/admin`                                                   |
| `ADMIN_SESSION_SECRET`      | 32+ random characters used to sign the admin session cookie             |
| `GMAIL_USER` / `GMAIL_PASS` | Gmail account (and **app password**) that sends booking emails          |
| `HOTEL_BOOKING_EMAIL`       | Where the hotel's notifications go (default `booking@alnoorpalace.in`)  |
| `NEXT_PUBLIC_SITE_URL`      | Optional canonical URL (default `https://alnoorpalace.in`)              |

If Supabase is not configured the site still works: it falls back to emailing booking *requests* (needs `GMAIL_*`).

## Project structure

```
pages/
  index.tsx            Home page
  hotels.tsx           Hotels listing with city filter
  hotels/[slug].tsx    Hotel detail page (one per branch, statically generated)
  manage-booking.tsx   Guest lookup / cancel by reference + phone
  admin.tsx            Admin dashboard (bookings, rooms & rates)
  api/availability.ts  Live availability and prices
  api/bookings/        Create, look up and cancel bookings
  api/admin/           Admin login/session, bookings, rooms
  api/send-booking.ts  Legacy email request (used when Supabase isn't configured)
  _app.tsx             Global styles, tracking scripts, booking provider + modal
  _document.tsx        Fonts and favicon
components/site/
  HomeSections.tsx     Hero, destinations, hotels, rooms, about, services, corporate, stats, reviews, CTA
  BookingBar.tsx       Search bar (desktop) and search bottom sheet (phones)
  BookingModal.tsx     Room selection, guest details, success
  BookingContext.tsx   Shared search/booking state
  RangeCalendar.tsx    Date-range picker
  HotelBookingPanel.tsx, HotelGallery.tsx, Faq.tsx   Hotel detail page pieces
  SiteHeader.tsx, SiteFooter.tsx, MobileActionBar.tsx, HotelCard.tsx, Seo.tsx, motion.tsx, dates.ts
lib/booking/           Validation (zod), database adapter, service layer, emails
lib/admin/auth.ts      Signed-cookie admin session
supabase/migrations/   Database schema + booking functions
supabase/seed.sql      Generated room types (run `npm run seed:sql`)
scripts/               Seed generator and the local Supabase stand-in
tests/                 SQL, validation and service tests
data/hotels.ts         Single source of truth: hotels, rooms, prices, services, reviews, stats, contacts
data/hotelContent.ts   Detail-page content derived from the data (gallery, FAQs, nearby places)
data/seo.ts            schema.org JSON-LD builders
public/img/            Optimized WebP images
styles/globals.css     Tailwind entry
tailwind.config.js     Design tokens (gold / black / white palette, fonts, type scale)
```

## Common edits

- **Add or edit a hotel, room type or price:** `data/hotels.ts` (a new hotel automatically gets its own `/hotels/<slug>` page and sitemap entry).
- **Hotel photos:** gallery and room photos are placeholders in `data/hotelContent.ts` (look for `TODO(photo)`).
- **Replace a hotel photo:** put an optimized image in `public/img/` and update that hotel's `image` in `data/hotels.ts` (look for `TODO(photo)`).
- **Change phone numbers or email:** `CONTACT` in `data/hotels.ts`.
- **Colours and type:** `tailwind.config.js`.

## Booking engine (Supabase, pay at hotel)

Guests pick a hotel, dates and party size, see **live availability and prices**, and book instantly. They get a reference like `ALN-7K3P9Q`, and **pay at the hotel on arrival**. There is no online payment.

How it works:

- **Inventory and rates** live in the `room_types` table (rooms per type, nightly rate). **Bookings** live in `bookings`.
- A booking is created by one Postgres function (`create_booking`) that locks the room type, checks availability for every night, and inserts, so two guests can't take the last room. The check-out day is free, so back-to-back stays are fine.
- **Prices are calculated in the database**; the browser never sends a price. Corporate bookings get 20% off.
- Guests can look up or cancel a booking at `/manage-booking` with the reference **and** phone number. They can't cancel once the stay has started.
- Staff use `/admin` (password) to see and cancel bookings and to set room counts and rates.
- The guest (if they gave an email) and the hotel get emails. An email failure never undoes a booking.
- Dates use India time (IST).

### Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, in order: `supabase/migrations/20260101000000_booking_engine.sql`, then `supabase/seed.sql`. (Or use the Supabase CLI: `supabase db push`.)
3. In **Project Settings > API** copy the **Project URL** and the **`service_role`** key into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Treat the service-role key like a password.
4. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`), plus `GMAIL_USER` / `GMAIL_PASS` for emails.
5. Open `/admin`, go to **Rooms & rates**, and **set the real number of rooms for every room type**.

> **Important:** `supabase/seed.sql` uses a **placeholder of 3 rooms per room type**, because the real counts are not in the codebase. Availability and overbooking protection are only as accurate as these numbers. Set the real counts in `/admin` **before** accepting bookings. Re-running the seed never overwrites counts or rates you have edited.

### Security notes

- All access is server-side with the service-role key. Both tables have Row Level Security enabled with no policies, and all functions are revoked from `anon`/`authenticated`, so the public anon key can't read or write anything.
- After setup, check it: this must **not** return data (expect a permission/401 error):

  ```bash
  curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/admin_list_bookings" \
    -H "apikey: <your anon key>" -H "Authorization: Bearer <your anon key>" \
    -H "Content-Type: application/json" -d '{"p":{}}'
  ```

- Booking, lookup and login endpoints are rate limited per IP. The limiter is per server instance (best effort on serverless), and a hidden honeypot field blocks simple bots.
- Free-tier Supabase projects pause after a period of inactivity. Use a paid plan (or keep the project active) for production.

### Local development without Supabase

```bash
npm run dev:db     # embedded Postgres running the real migration + seed on :54321
# in .env.local:
#   SUPABASE_URL=http://127.0.0.1:54321
#   SUPABASE_SERVICE_ROLE_KEY=local-dev-key
#   ADMIN_PASSWORD=...  ADMIN_SESSION_SECRET=...(32+ chars)
npm run dev
```

Data is kept in memory (set `MOCK_SUPABASE_DATA_DIR=.pglite` to persist). `MOCK_ROOMS_PER_TYPE=2` changes the stock, handy for testing sold-out states. This stand-in is for development and tests only.

## Layout

The desktop design applies from 1024px up (`lg`); below that the mobile layout is used (search bottom sheet, bottom action bar, swipe carousels, collapsible footer).

## Deployment

Standard Next.js app; deploys on Vercel with the environment variables above. Tracking scripts (Meta Pixel, Google Ads) are in `pages/_app.tsx`.
