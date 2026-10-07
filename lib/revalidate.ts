import type { NextApiResponse } from "next";
import { aggregateRooms } from "../data/rooms";
import { getSiteHotels } from "./siteHotels";

/**
 * Rebuilds the pages that show hotel data right after an admin change, so the
 * website updates immediately instead of waiting for the periodic refresh.
 * Failures are logged, never thrown: the change itself already succeeded.
 */
export async function revalidateSite(res: NextApiResponse, extraSlugs: string[] = []) {
  try {
    const hotels = await getSiteHotels();
    const slugs = new Set([...hotels.map((h) => h.slug), ...extraSlugs]);
    const paths = [
      "/",
      "/hotels",
      "/manage-booking",
      ...Array.from(slugs).map((s) => `/hotels/${s}`),
      ...aggregateRooms(hotels).map((r) => `/rooms/${r.slug}`),
    ];
    await Promise.all(
      paths.map((p) =>
        res.revalidate(p).catch((e: unknown) => console.warn(`[revalidate] ${p}:`, (e as Error).message))
      )
    );
  } catch (e) {
    console.warn("[revalidate] skipped:", (e as Error).message);
  }
}
