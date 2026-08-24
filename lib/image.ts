// Client-side image helpers. Avatars are stored as small data URLs (square,
// center-cropped, JPEG) so a real uploaded photo works with zero external
// storage — it rides in the profile JSON both locally and in Postgres.

const AVATAR_SIZE = 240;
/** Longest side of a stored event photo — sharp on a phone, ~150–300 KB as JPEG. */
const COVER_MAX = 1400;

/** Read a picked image file into a 240×240 center-cropped JPEG data URL. */
export async function fileToAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}

/**
 * Read a picked photo into a JPEG data URL, downscaled so its longest side is
 * at most 1400px. Nothing is cropped — the aspect ratio is kept and the host
 * picks the focal point afterwards (see `CoverCard`).
 */
export async function fileToCover(file: File): Promise<string> {
  // Honor EXIF orientation (phone photos) where the browser supports the option.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(
    () => createImageBitmap(file),
  );
  try {
    const scale = Math.min(1, COVER_MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}

/** Longest side of the list thumbnail (~30–60 KB as JPEG). */
const THUMB_MAX = 480;

/** Downscale an image source (data URL or http URL) into a small JPEG data URL. */
export async function makeThumb(src: string): Promise<string> {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
  const scale = Math.min(1, THUMB_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
}
