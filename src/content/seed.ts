// Typed access to the bundled seed document.
// The JSON import is statically typed; the cast pins the literal schemaVersion
// and string unions. scripts/validate-seed.ts verifies it against ContentSchema.
import seedJson from './seed.json';
import type { Content } from './types';

export const seed = seedJson as unknown as Content;
export default seed;
