// Magic-byte detection for uploads. The declared Content-Type of an upload is
// never trusted; only these formats are accepted (no SVG / HTML / scripts).

export type SniffedType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/avif' | 'application/pdf';

export const EXTENSIONS: Record<SniffedType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

export const IMAGE_TYPES: SniffedType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const DOCUMENT_TYPES: SniffedType[] = ['application/pdf'];

const ascii = (b: Uint8Array, start: number, len: number) =>
  String.fromCharCode(...b.subarray(start, Math.min(b.length, start + len)));

export function sniffType(bytes: Uint8Array): SniffedType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  const head6 = ascii(bytes, 0, 6);
  if (head6 === 'GIF87a' || head6 === 'GIF89a') return 'image/gif';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const boxSize = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const brands: string[] = [ascii(bytes, 8, 4)];
    for (let i = 16; i + 4 <= Math.min(boxSize, 64, bytes.length); i += 4) brands.push(ascii(bytes, i, 4));
    if (brands.includes('avif') || brands.includes('avis')) return 'image/avif';
    return null;
  }
  if (ascii(bytes, 0, 5) === '%PDF-') return 'application/pdf';
  return null;
}

/** Best-effort pixel dimensions (undefined when the format/structure is not recognised). */
export function imageSize(bytes: Uint8Array, type: SniffedType): { width: number; height: number } | undefined {
  try {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    switch (type) {
      case 'image/png':
        return { width: dv.getUint32(16), height: dv.getUint32(20) };
      case 'image/gif':
        return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
      case 'image/webp': {
        const chunk = ascii(bytes, 12, 4);
        if (chunk === 'VP8 ') return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
        if (chunk === 'VP8L') {
          const b = dv.getUint32(21, true);
          return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
        }
        if (chunk === 'VP8X') {
          const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
          const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
          return { width: w, height: h };
        }
        return undefined;
      }
      case 'image/jpeg': {
        let i = 2;
        while (i + 9 < bytes.length) {
          if (bytes[i] !== 0xff) return undefined;
          const marker = bytes[i + 1];
          if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            i += 2;
            continue;
          }
          const len = dv.getUint16(i + 2);
          const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
          if (isSof) return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
          i += 2 + len;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}
