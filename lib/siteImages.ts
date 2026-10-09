import { getDb } from "./booking/db";
import { isAllowedImageUrl } from "./images";
import { DEFAULT_SITE_IMAGES, SITE_IMAGE_SLOTS, SiteImages } from "./siteImagesDefaults";

export { DEFAULT_SITE_IMAGES, SITE_IMAGE_KEYS, SITE_IMAGE_SLOTS } from "./siteImagesDefaults";
export type { SiteImageKey, SiteImages } from "./siteImagesDefaults";

/** Picture overrides from the database (only the slots that were changed), validated. */
export async function getSiteImageOverrides(): Promise<Partial<SiteImages>> {
  const db = getDb();
  if (!db) return {};
  try {
    const rows = await db.rpc<Record<string, string>>("site_images", {});
    const out: Partial<SiteImages> = {};
    for (const s of SITE_IMAGE_SLOTS) {
      const url = rows?.[s.key];
      if (typeof url === "string" && isAllowedImageUrl(url)) out[s.key] = url;
    }
    return out;
  } catch (e) {
    // The migration may not have been run yet: the bundled pictures are used.
    console.warn("[site images] using the bundled pictures:", (e as Error).message);
    return {};
  }
}

export async function getSiteImages(): Promise<SiteImages> {
  return { ...DEFAULT_SITE_IMAGES, ...(await getSiteImageOverrides()) };
}
