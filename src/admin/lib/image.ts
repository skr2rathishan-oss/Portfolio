// Client-side image preparation: downscale + re-encode as WebP (q 0.85) before upload.
// GIFs (possibly animated) and unsupported inputs are uploaded unchanged; the server
// sniffs the bytes and rejects anything that is not JPEG/PNG/WebP/GIF/AVIF.

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export interface PreparedImage {
  blob: Blob;
  fileName: string;
  width?: number;
  height?: number;
}

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '').slice(0, 80) || 'image';
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File, maxDim: number): Promise<PreparedImage> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return { blob: file, fileName: file.name };
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { blob: file, fileName: file.name };
  }
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return { blob: file, fileName: file.name };
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, 'image/webp', 0.85);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
    ext = 'jpg';
  }
  if (!blob) return { blob: file, fileName: file.name };
  // Keep the original when re-encoding did not help and no resize was needed.
  if (scale === 1 && blob.size >= file.size && /^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    return { blob: file, fileName: file.name, width, height };
  }
  return { blob, fileName: `${baseName(file.name)}.${ext}`, width, height };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
