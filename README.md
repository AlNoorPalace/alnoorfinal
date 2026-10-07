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
  admin.tsx            Admin dashboard (bookings, hotels, rooms & rates, availability)
  api/availability.ts  Live availability and prices
  api/bookings/        Create, look up and cancel bookings
  api/hotels.ts        Public list of hotels (what the website shows)
  api/admin/           Admin login/session, bookings, hotels, rooms, availability, photo upload
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
lib/siteHotels.ts       Loads the hotels the website shows (database, with a built-in fallback)
lib/revalidate.ts      Refreshes site pages right after an admin change
lib/images.ts          Rules for hotel photos (allowed sources, type checks)
components/admin/      Admin screens (Bookings, Hotels, Rooms, Availability)
lib/admin/auth.ts      Signed-cookie admin session
supabase/migrations/   Database: bookings (1st file), hotels/rooms/closures/admin functions (2nd file)
scripts/               The local Supabase stand-in
tests/                 SQL, validation and service tests
data/hotels.ts         Site copy (services, reviews, stats, contacts) and the built-in hotel list used as a fallback
data/hotelContent.ts   Detail-page content derived from the data (gallery, FAQs, nearby places)
data/seo.ts            schema.org JSON-LD builders
public/img/            Optimized WebP images
styles/globals.css     Tailwind entry
tailwind.config.js     Design tokens (gold / black / white palette, fonts, type scale)
```

## Common edits

- **Hotels, rooms, rates and availability:** managed in `/admin` once Supabase is set up (see below). No code change or redeploy needed.
- **Without Supabase:** the site shows the built-in hotels from `data/hotels.ts` (edit that file to change them).
- **Phone numbers or email:** `CONTACT` in `data/hotels.ts`.
- **Colours and type:** `tailwind.config.js`.
- **Site copy** (services, reviews, stats, corporate perks): `data/hotels.ts`.

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
2. Open **SQL Editor** and run these two files **in this order** (each is safe to run once; the second can also be run later on a site that already has bookings, and it keeps all existing data):
   1. `supabase/migrations/20260101000000_booking_engine.sql` (bookings and booking functions)
   2. `supabase/migrations/20260102000000_hotel_management.sql` (hotels, rooms, closures, admin functions, photo storage; it also loads your current 7 hotels and 19 room types)
   3. `supabase/migrations/20260103000000_photos.sql` (hotel galleries and room photos; run it after the file above)

   (Or use the Supabase CLI: `supabase db push`.)
3. In **Project Settings > API** copy the **Project URL** and the **`service_role`** key into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Treat the service-role key like a password. **`SUPABASE_URL` must also be set when the site is built** (it lets the site show photos you upload).
4. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`, or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` on Windows), plus `GMAIL_USER` / `GMAIL_PASS` for emails.
5. Open `/admin`, go to **Rooms & rates**, and **set the real number of rooms for every room type**.

> **Important:** the second file loads your hotels with a **placeholder of 3 rooms per room type**, because the real counts are not in the codebase. Availability and overbooking protection are only as accurate as these numbers. Set the real counts in `/admin` **before** accepting bookings. Re-running the file never overwrites hotels, counts or rates you have edited.

### Managing hotels in the admin (`/admin`)

| Tab | What you can do |
| --- | --- |
| **Bookings** | Search, filter and cancel bookings. |
| **Hotels** | **Add** a hotel (name, city, description, phone, map location, amenities, photo), **edit** it, **hide/show** it, change the display order, or **delete** it. |
| **Rooms & rates** | **Add**, edit or delete room types for a hotel: number of rooms, nightly rate, max guests, beds, baths, and whether it can be booked. |
| **Availability** | A calendar of free rooms per night for each room type, and **close rooms** for dates (maintenance, events, blackouts). |

Good to know:

- **Changes appear on the website immediately** (the affected pages are rebuilt on save; otherwise within 5 minutes). A new hotel gets its own page at `/hotels/<url-name>` and a sitemap entry automatically.
- **Photos:** pick one of the site's bundled photos or **upload your own** (JPEG, PNG or WebP; shrunk automatically, 3 MB max). Only those two sources are accepted.
- **Hide vs delete:** *Hide* removes a hotel from the website and stops new bookings but keeps everything (including existing bookings, which guests can still look up). *Delete* is only allowed when the hotel (or room type) has **never had a booking**, because booking history is kept; otherwise hide it instead. Deleting a hotel also deletes its room types.
- **Closing rooms** takes them off sale for the dates you choose (the end date is included) and is respected by the booking engine immediately. Existing bookings are **never cancelled automatically**: if you close rooms that are already booked, you'll get a warning so you can contact those guests or cancel them in Bookings.
- **Photo uploads need the `hotel-images` storage bucket.** The second SQL file creates it. If uploads fail with a "bucket not found" error, create it by hand: Supabase **Storage > New bucket**, name `hotel-images`, tick **Public bucket**.
- A hotel with no room types yet shows "Call to book" and can't be booked online until you add rooms.
- If the database can't be reached, the website keeps working from its built-in hotels and logs a warning.

### Security notes

- All access is server-side with the service-role key. Both tables have Row Level Security enabled with no policies, and all functions are revoked from `anon`/`authenticated`, so the public anon key can't read or write anything.
- After setup, check it: this must **not** return data (expect a permission/401 error):

  ```bash
  curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/admin_list_bookings" \
    -H "apikey: <your anon key>" -H "Authorization: Bearer <your anon key>" \
    -H "Content-Type: application/json" -d '{"p":{}}'
  ```

- All new tables (`hotels`, `room_blocks`) also have Row Level Security on with no policies, and their functions are revoked from `anon`/`authenticated`. Photo **uploads** go through the admin API (type checked from the file's real bytes, size limited, random file names); the storage bucket is public for reading only.
- Hotel photos can only come from the site's bundled `/img/` files or this project's storage bucket; anything else is rejected, so a bad value can't break pages.
- Booking, lookup and login endpoints are rate limited per IP. The limiter is per server instance (best effort on serverless), and a hidden honeypot field blocks simple bots.
- Free-tier Supabase projects pause after a period of inactivity. Use a paid plan (or keep the project active) for production.

### Local development without Supabase

```bash
npm run dev:db     # embedded Postgres running the real migrations on :54321, with photo storage
# in .env.local:
#   SUPABASE_URL=http://127.0.0.1:54321
#   SUPABASE_SERVICE_ROLE_KEY=local-dev-key
#   ADMIN_PASSWORD=...  ADMIN_SESSION_SECRET=...(32+ chars)
npm run dev
```

Data is kept in memory (set `MOCK_SUPABASE_DATA_DIR=.pglite` to persist). `MOCK_ROOMS_PER_TYPE=2` changes the stock, handy for testing sold-out states. `MOCK_SKIP_SEED=1` starts with no hotels or rooms. `MOCK_MIGRATIONS_ONLY=1` starts with just the first migration, to see the "run the second file" message. This stand-in is for development and tests only.

## Layout

The desktop design applies from 1024px up (`lg`); below that the mobile layout is used (search bottom sheet, bottom action bar, swipe carousels, collapsible footer).

## Deployment

Standard Next.js app; deploys on Vercel with the environment variables above. Tracking scripts (Meta Pixel, Google Ads) are in `pages/_app.tsx`.
