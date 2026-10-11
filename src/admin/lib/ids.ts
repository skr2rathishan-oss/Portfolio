// Id generation: "<prefix>_<slug>_<random>" matching ID_RE in schema.ts.

export function slugify(text: string, max = 32): string {
  return (
    text
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, max)
      .replace(/_+$/g, '') || 'item'
  );
}

function randomSuffix(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function newId(prefix: string, label = ''): string {
  return `${prefix}_${slugify(label || 'item')}_${randomSuffix()}`;
}
