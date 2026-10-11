// Validates src/content/seed.json against the content schema and checks that every
// local asset it references (strings like "/certificates/azure.jpg") exists in public/.
// Usage: npm run check:content [-- path/to/content.json]
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { byteSize, LIMITS, validateContent } from '../src/content/schema';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.resolve(root, process.argv[2] ?? 'src/content/seed.json');
const publicDir = path.join(root, 'public');

function collectLocalAssets(value: unknown, at: string, out: { path: string; ref: string }[]) {
  if (typeof value === 'string') {
    // Local file reference: starts with a single "/" and the last segment has an extension.
    if (/^\/(?!\/)/.test(value) && /\.[a-z0-9]{2,5}$/i.test(value.split(/[?#]/)[0])) {
      out.push({ path: at, ref: value.split(/[?#]/)[0] });
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectLocalAssets(v, `${at}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectLocalAssets(v, at ? `${at}.${k}` : k, out);
  }
}

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`✖ Could not read ${path.relative(root, file)}: ${(err as Error).message}`);
  process.exit(1);
}

let failed = false;
const result = validateContent(raw);
if (!result.success) {
  failed = true;
  console.error(`✖ Schema validation failed (${result.issues.length} issue(s)):`);
  for (const issue of result.issues) console.error(`  - ${issue.path || '(root)'}: ${issue.message}`);
}

const assets: { path: string; ref: string }[] = [];
collectLocalAssets(raw, '', assets);
const missing = assets.filter((a) => !existsSync(path.join(publicDir, decodeURIComponent(a.ref))));
if (missing.length) {
  failed = true;
  console.error(`✖ ${missing.length} referenced local asset(s) missing from public/:`);
  for (const m of missing) console.error(`  - ${m.path}: ${m.ref}`);
}

if (failed) process.exit(1);

const c = result.success ? result.data : null;
console.log(
  `✔ ${path.relative(root, file)} is valid (${byteSize(raw)} / ${LIMITS.docBytes} bytes, ` +
    `${assets.length} local assets checked)`,
);
if (c) {
  console.log(
    `  projects ${c.projects.length} · technologies ${c.technologies.length} · certifications ${c.certifications.length} · ` +
      `achievements ${c.achievements.length} · roles ${c.roles.length} · programs ${c.programs.length}`,
  );
}
