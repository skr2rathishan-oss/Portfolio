// Form-level validation helpers on top of the zod schemas in src/content/schema.ts.
import type { z } from 'zod';

export type FieldErrors = Record<string, string>;

/** "projects.3.sourceUrl" style path -> first message per path. */
export function issuesToErrors(issues: readonly { path: readonly PropertyKey[] | string; message: string }[]): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = typeof issue.path === 'string' ? issue.path : issue.path.map(String).join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

/**
 * Drops optional keys whose value is empty ('' / null / empty optional arrays) so that
 * `optional()` fields validate, while required fields keep '' and report "Required".
 */
export function stripEmptyOptional<T extends Record<string, unknown>>(value: T, schema: z.ZodObject): T {
  const out: Record<string, unknown> = { ...value };
  const shape = schema.shape as Record<string, z.ZodType>;
  for (const [key, field] of Object.entries(shape)) {
    const v = out[key];
    const optional = field.safeParse(undefined).success;
    if (!optional) continue;
    // Optional list fields (e.g. highlights) are omitted when empty, too.
    if (isEmpty(v) || (Array.isArray(v) && v.length === 0)) delete out[key];
  }
  return out as T;
}

export function validateItem<T>(
  schema: z.ZodObject,
  value: T,
): { ok: true; data: T } | { ok: false; errors: FieldErrors } {
  const cleaned = stripEmptyOptional(value as Record<string, unknown>, schema);
  const result = schema.safeParse(cleaned);
  if (result.success) return { ok: true, data: result.data as T };
  return { ok: false, errors: issuesToErrors(result.error.issues) };
}

export function firstError(errors: FieldErrors): string | undefined {
  return Object.values(errors)[0];
}
