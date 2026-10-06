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

## Environment variables

See `.env.example`.

| Variable              | Purpose                                                        |
| --------------------- | -------------------------------------------------------------- |
| `GMAIL_USER`          | Gmail account that sends booking-request emails                |
| `GMAIL_PASS`          | Gmail **app password** for that account                        |
| `HOTEL_BOOKING_EMAIL` | Where requests are delivered (default `booking@alnoorpalace.in`) |

Without `GMAIL_USER` / `GMAIL_PASS` the site still runs, but sending a booking request returns an error.

## Project structure

```
pages/
  index.tsx            Home page
  hotels.tsx           Hotels listing with city filter
  api/send-booking.ts  Emails a booking request to the hotel
  _app.tsx             Global styles, tracking scripts, booking provider + modal
  _document.tsx        Fonts and favicon
components/site/
  HomeSections.tsx     Hero, destinations, hotels, rooms, about, services, corporate, stats, reviews, CTA
  BookingBar.tsx       Search bar (desktop) and search bottom sheet (phones)
  BookingModal.tsx     Room selection, guest details, success
  BookingContext.tsx   Shared search/booking state
  RangeCalendar.tsx    Date-range picker
  SiteHeader.tsx, SiteFooter.tsx, MobileActionBar.tsx, HotelCard.tsx, motion.tsx, dates.ts
data/hotels.ts         Single source of truth: hotels, rooms, prices, services, reviews, stats, contacts
public/img/            Optimized WebP images
styles/globals.css     Tailwind entry
tailwind.config.js     Design tokens (gold / black / white palette, fonts, type scale)
```

## Common edits

- **Add or edit a hotel, room type or price:** `data/hotels.ts`.
- **Replace a hotel photo:** put an optimized image in `public/img/` and update that hotel's `image` in `data/hotels.ts` (look for `TODO(photo)`).
- **Change phone numbers or email:** `CONTACT` in `data/hotels.ts`.
- **Colours and type:** `tailwind.config.js`.

## How booking works today

The booking flow is a **request** flow, not a live booking engine. A guest picks a hotel, dates and guests, chooses a room (with an estimated total and optional 20% corporate discount) and submits their details. `/api/send-booking` emails the request to the hotel, who confirm by phone. There is no availability, inventory or online payment yet.

## Layout

The desktop design applies from 1024px up (`lg`); below that the mobile layout is used (search bottom sheet, bottom action bar, swipe carousels, collapsible footer).

## Deployment

Standard Next.js app; deploys on Vercel with the environment variables above. Tracking scripts (Meta Pixel, Google Ads) are in `pages/_app.tsx`.
