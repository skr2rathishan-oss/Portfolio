// Validates src/content/seed.json against the content schema and checks that every
// local asset it references (strings like "/certificates/azure.jpg") exists in public/.
// With no arguments it also runs the layout fixtures in scripts/fixtures/ and a few
// resolvePage() self-tests.
//
// Usage:
//   npm run check:content                                  seed + fixtures + self-tests
//   npm run check:content -- path/to/content.json          one full document
//   npm run check:content -- --materialize scripts/fixtures/layout-all-blocks.json out.json
//                                                          write a fixture as a full document
//
// Fixture format (an overlay on seed.json):
//   { "description": string,
//     "expect": "valid" | "invalid",
//     "issuePath"?: string,            // invalid: some issue must have exactly this path
//     "matchesDefaultLayout"?: true,   // valid: parsed layout must deep-equal DEFAULT_LAYOUT
//     "set": { "<dot.path>": value } } // applied in order to a clone of seed.json; numeric segments index arrays
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultLayout, PAGE_KEYS, resolvePage } from '../src/content/layout';
import { byteSize, LIMITS, validateContent, type ValidationResult } from '../src/content/schema';
import type { Content, Section } from '../src/content/types';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const seedFile = path.join(root, 'src/content/seed.json');
const fixturesDir = path.join(root, 'scripts/fixtures');
const rel = (f: string) => path.relative(root, f);

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

function missingAssets(raw: unknown) {
  const assets: { path: string; ref: string }[] = [];
  collectLocalAssets(raw, '', assets);
  return { assets, missing: assets.filter((a) => !existsSync(path.join(publicDir, decodeURIComponent(a.ref)))) };
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`✖ Could not read ${rel(file)}: ${(err as Error).message}`);
    process.exit(1);
  }
}

/** Full-document check (schema + local assets). Prints and returns success. */
function checkDocument(file: string, raw: unknown): ValidationResult & { ok: boolean } {
  let ok = true;
  const result = validateContent(raw);
  if (!result.success) {
    ok = false;
    console.error(`✖ Schema validation failed (${result.issues.length} issue(s)):`);
    for (const issue of result.issues) console.error(`  - ${issue.path || '(root)'}: ${issue.message}`);
  }
  const { assets, missing } = missingAssets(raw);
  if (missing.length) {
    ok = false;
    console.error(`✖ ${missing.length} referenced local asset(s) missing from public/:`);
    for (const m of missing) console.error(`  - ${m.path}: ${m.ref}`);
  }
  if (ok && result.success) {
    const c = result.data;
    console.log(`✔ ${rel(file)} is valid (${byteSize(raw)} / ${LIMITS.docBytes} bytes, ${assets.length} local assets checked)`);
    console.log(
      `  projects ${c.projects.length} · technologies ${c.technologies.length} · certifications ${c.certifications.length} · ` +
        `achievements ${c.achievements.length} · roles ${c.roles.length} · programs ${c.programs.length}`,
    );
  }
  return { ...result, ok };
}

// ── Fixtures ─────────────────────────────────────────────────
interface Fixture {
  description?: string;
  expect: 'valid' | 'invalid';
  issuePath?: string;
  matchesDefaultLayout?: boolean;
  set: Record<string, unknown>;
}

function setPath(target: Record<string, unknown>, dotPath: string, value: unknown) {
  const keys = dotPath.split('.');
  let cur: Record<string, unknown> | unknown[] = target;
  keys.forEach((key, i) => {
    const last = i === keys.length - 1;
    const k: string | number = Array.isArray(cur) ? Number(key) : key;
    const bag = cur as Record<string | number, unknown>;
    if (Array.isArray(cur) && !last && bag[k] === undefined) {
      throw new Error(`Fixture path "${dotPath}": array index ${key} does not exist in seed.json`);
    }
    if (last) {
      bag[k] = structuredClone(value);
    } else {
      if (bag[k] === undefined || bag[k] === null) bag[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      cur = bag[k] as Record<string, unknown>;
    }
  });
}

function materialize(fixture: Fixture, seed: unknown): Record<string, unknown> {
  const doc = structuredClone(seed) as Record<string, unknown>;
  for (const [p, v] of Object.entries(fixture.set ?? {})) setPath(doc, p, v);
  return doc;
}

function runFixtures(seed: unknown): boolean {
  if (!existsSync(fixturesDir)) return true;
  const files = readdirSync(fixturesDir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  let ok = true;
  let passed = 0;
  for (const name of files) {
    const fixture = readJson(path.join(fixturesDir, name)) as Fixture;
    const doc = materialize(fixture, seed);
    const result = validateContent(doc);
    const fail = (msg: string) => {
      ok = false;
      console.error(`✖ fixture ${name}: ${msg}`);
    };
    if (fixture.expect === 'valid') {
      if (!result.success) {
        fail(`expected valid, got ${result.issues.length} issue(s):`);
        for (const i of result.issues) console.error(`    - ${i.path || '(root)'}: ${i.message}`);
        continue;
      }
      const { missing } = missingAssets(doc);
      if (missing.length) {
        fail(`missing local assets: ${missing.map((m) => m.ref).join(', ')}`);
        continue;
      }
      if (fixture.matchesDefaultLayout && !isDeepStrictEqual(result.data.layout, defaultLayout())) {
        fail('layout does not equal DEFAULT_LAYOUT');
        continue;
      }
    } else {
      if (result.success) {
        fail(`expected invalid (${fixture.issuePath}), but it validated`);
        continue;
      }
      if (fixture.issuePath !== undefined && !result.issues.some((i) => i.path === fixture.issuePath)) {
        fail(`expected an issue at "${fixture.issuePath}", got: ${result.issues.map((i) => `${i.path}: ${i.message}`).join(' | ')}`);
        continue;
      }
    }
    passed++;
  }
  if (ok) console.log(`✔ ${passed} layout fixture(s) behaved as expected`);
  return ok;
}

// ── resolvePage self-tests ───────────────────────────────────
function selfTests(seed: Content): boolean {
  const failures: string[] = [];
  const expect = (cond: boolean, msg: string) => {
    if (!cond) failures.push(msg);
  };
  const def = defaultLayout();
  for (const page of PAGE_KEYS) {
    expect(isDeepStrictEqual(resolvePage(seed, page), def.pages[page]!.sections), `absent layout != default (${page})`);
    expect(isDeepStrictEqual(resolvePage({ layout: def }, page), def.pages[page]!.sections), `default layout != default (${page})`);
  }
  // A missing built-in is re-inserted after its default predecessor; foreign/duplicate built-ins are dropped.
  const home = def.pages.home!.sections;
  const custom: Section = { id: 'sec_custom_a', type: 'custom', order: 1, visible: true, props: { arrangement: 'stack' }, blocks: [] };
  const stored: Section[] = [
    { ...home[3], order: 0 }, // contactCta first
    custom,
    { ...home[0], order: 2, visible: false }, // hero hidden
    { id: 'sec_foreign', type: 'about.intro', order: 3, visible: true },
    { ...home[0], id: 'sec_dupe', order: 4 },
  ];
  const resolved = resolvePage({ layout: { version: 1, pages: { home: { sections: stored } } } }, 'home');
  expect(
    isDeepStrictEqual(
      resolved.map((s) => `${s.type}:${s.order}:${s.visible}`),
      ['home.contactCta:0', 'custom:1', 'home.hero:2', 'home.coreStack:3', 'home.highlights:4'].map((x, i) =>
        i === 2 ? `${x}:false` : `${x}:true`,
      ),
    ),
    `resolvePage insertion order: ${resolved.map((s) => s.type).join(', ')}`,
  );
  if (failures.length) {
    for (const f of failures) console.error(`✖ self-test: ${f}`);
    return false;
  }
  console.log('✔ resolvePage self-tests passed');
  return true;
}

// ── Main ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args[0] === '--materialize') {
  const [, fixtureFile, out] = args;
  if (!fixtureFile) {
    console.error('Usage: --materialize <fixture.json> [out.json]');
    process.exit(1);
  }
  const doc = materialize(readJson(path.resolve(root, fixtureFile)) as Fixture, readJson(seedFile));
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  if (out) {
    writeFileSync(path.resolve(out), json);
    console.log(`✔ wrote ${out}`);
  } else {
    process.stdout.write(json);
  }
  process.exit(0);
}

const file = path.resolve(root, args[0] ?? seedFile);
const raw = readJson(file);
let failed = !checkDocument(file, raw).ok;
if (args.length === 0) {
  if (!runFixtures(raw)) failed = true;
  if (!selfTests(raw as Content)) failed = true;
}
if (failed) process.exit(1);
