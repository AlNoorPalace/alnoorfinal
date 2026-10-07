export const STORAGE_BUCKET = "hotel-images";
export const DEFAULT_HOTEL_IMAGE = "/img/lobby.webp";
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const storagePrefix = () => {
  const url = process.env.SUPABASE_URL;
  return url ? `${url.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/` : null;
};

/**
 * Hotel photos must be bundled with the site (/img/...) or uploaded to this
 * project's storage bucket. Anything else is rejected: the image optimiser only
 * allows these sources, and an arbitrary URL would break the page.
 */
export function isAllowedImageUrl(url: string): boolean {
  if (/^\/img\/[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(url) && !url.includes("..")) return true;
  const prefix = storagePrefix();
  return Boolean(prefix && url.startsWith(prefix) && /^[A-Za-z0-9._\-/]+$/.test(url.slice(prefix.length)) && !url.includes(".."));
}

export const safeImage = (url: unknown): string =>
  typeof url === "string" && isAllowedImageUrl(url) ? url : DEFAULT_HOTEL_IMAGE;

/** Identifies the real file type from its first bytes (never trusts the filename or client MIME type). */
export function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { mime: "image/png", ext: "png" };
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { mime: "image/webp", ext: "webp" };
  return null;
}
