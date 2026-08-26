// Image inputs are the biggest attack surface we accept from users: a "photo"
// can be an SVG with scripts, a 50 MB bomb, a mislabelled file, or a URL to a
// tracking pixel. Rules:
//   - data URLs: only image/jpeg, image/png, image/webp; valid base64; the
//     decoded bytes must START with that format's magic number; decoded size
//     and pixel dimensions are capped (dimensions are read from the headers —
//     no decoder runs on the server).
//   - https URLs: only hosts we know (login-provider avatars).
//   - our own cover set: `/covers/<name>.png` served from public/ (see
//     STOCK_COVERS in lib/create-event).
//   - nothing else (no http:, blob:, javascript:, svg, gif, bmp, heic).

import "server-only";
import { HttpError } from "@/lib/server/http";

/** Event artwork is uploaded (data URL) or one of our own covers — no remote hosts. */
export const EVENT_IMAGE_HOSTS: readonly string[] = [];
export const AVATAR_HOSTS = [
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "pollar.xyz",
] as const;

const DATA_RE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
/** One of aygo's own covers in public/covers — a plain file name, no traversal. */
const LOCAL_COVER_RE = /^\/covers\/[a-z0-9-]{1,60}\.(png|jpg|jpeg|webp)$/;

export type ImageLimits = { maxBytes: number; maxPixels: number; hosts: readonly string[] };

export const EVENT_IMAGE_LIMITS: ImageLimits = {
  maxBytes: 1_200_000,
  maxPixels: 4096,
  hosts: EVENT_IMAGE_HOSTS,
};
export const THUMB_LIMITS: ImageLimits = { maxBytes: 150_000, maxPixels: 640, hosts: EVENT_IMAGE_HOSTS };
export const AVATAR_LIMITS: ImageLimits = { maxBytes: 200_000, maxPixels: 1024, hosts: AVATAR_HOSTS };

const ascii = (b: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...b.subarray(from, to));

function readDimensions(kind: string, b: Uint8Array): { w: number; h: number } | null {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (kind === "png") {
    if (b.length < 24 || ascii(b, 12, 16) !== "IHDR") return null;
    return { w: dv.getUint32(16), h: dv.getUint32(20) };
  }
  if (kind === "webp") {
    if (b.length < 30) return null;
    const chunk = ascii(b, 12, 16);
    if (chunk === "VP8 ")
      return { w: dv.getUint16(26, true) & 0x3fff, h: dv.getUint16(28, true) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = dv.getUint32(21, true);
      return { w: (bits & 0x3fff) + 1, h: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X")
      return {
        w: (dv.getUint32(24, true) & 0xffffff) + 1,
        h: (dv.getUint32(27, true) & 0xffffff) + 1,
      };
    return null;
  }
  // JPEG: walk the marker segments to the first SOFn (start of frame).
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    if (len < 2) return null;
    const sof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (sof) return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    i += 2 + len;
  }
  return null;
}

function magicMatches(kind: string, b: Uint8Array): boolean {
  if (b.length < 12) return false;
  if (kind === "jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (kind === "png")
    return (
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
    );
  if (kind === "webp") return ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP";
  return false;
}

/** Validate one image source; returns it unchanged when acceptable. */
export function validateImage(src: unknown, field: string, limits: ImageLimits): string {
  if (typeof src !== "string" || src.length === 0)
    throw new HttpError(400, `${field} must be an image`);
  const tooBig = () =>
    new HttpError(400, `${field} is too large (max ${Math.round(limits.maxBytes / 1000)} KB)`);
  if (src.startsWith("data:")) {
    // Base64 inflates by 4/3; refuse before decoding so a bomb costs nothing.
    if (src.length > Math.ceil(limits.maxBytes * 1.37) + 64) throw tooBig();
    const m = src.match(DATA_RE);
    if (!m) throw new HttpError(400, `${field} must be a JPEG, PNG or WebP image`);
    const [, kind, b64] = m;
    if (b64.length % 4 !== 0) throw new HttpError(400, `${field} is not valid base64`);
    // Only the header is needed for the checks; decode a bounded prefix.
    const head = Buffer.from(b64.slice(0, 8192), "base64");
    const bytes = new Uint8Array(head.buffer, head.byteOffset, head.byteLength);
    if (!magicMatches(kind, bytes))
      throw new HttpError(400, `${field} isn't a real ${kind.toUpperCase()} file`);
    if (Math.floor((b64.length * 3) / 4) > limits.maxBytes) throw tooBig();
    const dims = readDimensions(kind, bytes);
    if (!dims || dims.w < 1 || dims.h < 1)
      throw new HttpError(400, `${field} has an unreadable header`);
    if (dims.w > limits.maxPixels || dims.h > limits.maxPixels)
      throw new HttpError(400, `${field} is too big (max ${limits.maxPixels}px per side)`);
    return src;
  }
  if (LOCAL_COVER_RE.test(src)) return src;
  if (src.length > 1024) throw new HttpError(400, `${field} URL is too long`);
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw new HttpError(400, `${field} must be an uploaded photo or an allowed image URL`);
  }
  if (url.protocol !== "https:") throw new HttpError(400, `${field} must use https`);
  if (!limits.hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)))
    throw new HttpError(400, `${field} must come from an allowed image host`);
  return src;
}
