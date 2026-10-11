// Media (uploads) store helpers.
// Keys: uploads/<yyyy>/<mm>/<sha256[0:16]>.<ext>  — content-addressed, immutable.
import type { SniffedType } from './sniff';

export const MEDIA_KEY_RE = /^uploads\/\d{4}\/(0[1-9]|1[0-2])\/[a-f0-9]{16}\.(jpg|png|webp|gif|avif|pdf)$/;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type MediaPurpose = 'image' | 'document';

export interface MediaMetadata {
  contentType: SniffedType;
  size: number;
  purpose: MediaPurpose;
  originalName: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export const mediaUrl = (key: string) => `/api/media/${key}`;

/** Keeps a short, display-only version of the uploaded file name. */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._ -]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  return cleaned || 'file';
}
