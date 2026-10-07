export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

export async function api<T = any>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

export const send = (path: string, method: "POST" | "DELETE" | "PATCH", body: unknown) =>
  api(path, { method, body: JSON.stringify(body) });

/** Human text for an API error code. */
export function explain(data: any, fallback = "Something went wrong. Please try again."): string {
  const e = data?.error;
  const map: Record<string, string> = {
    slug_taken: "A hotel with that URL name already exists. Choose a different one.",
    name_taken: "That hotel already has a room type with this name.",
    hotel_not_found: "That hotel no longer exists. Reload the page.",
    not_found: "That item no longer exists. Reload the page.",
    invalid: "Some values are not valid. Check the fields and try again.",
    invalid_dates: "Please check the dates (the end date can't be before the start date).",
    has_bookings: `It has ${data?.bookings ?? "some"} booking(s), so it can't be deleted. Hide it or switch it off instead, so bookings are kept.`,
    unauthorized: "Your session ended. Please sign in again.",
    rate_limited: "Too many attempts. Please wait a few minutes.",
    too_large: "That photo is too large (max 3 MB).",
    unsupported_type: "Only JPEG, PNG or WebP photos are allowed.",
  };
  return map[e] ?? fallback;
}

/** Shrinks a photo in the browser (max 1600px wide, WebP) and returns base64. */
export async function prepareImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/webp", 0.85)
  );
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Removes uploaded files that are no longer used anywhere (the server double-checks and ignores bundled photos). */
export async function deleteUnusedPhotos(before: string[], after: string[]): Promise<void> {
  const keep = new Set(after);
  for (const url of before.filter((u) => !keep.has(u))) {
    try {
      await send("/api/admin/upload", "DELETE", { url });
    } catch {
      /* leftover files are harmless */
    }
  }
}
