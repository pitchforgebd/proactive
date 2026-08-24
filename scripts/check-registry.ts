/**
 * Guard: every registry entry's `defaults` must satisfy its own schema.
 * A broken default would only surface when an editor adds that section type.
 */
import { sectionRegistry, sectionTypes } from '../lib/sections/registry';

let bad = 0;
for (const type of sectionTypes) {
  const e = sectionRegistry[type];
  const r = e.schema.safeParse(e.defaults);
  if (!r.success) {
    bad++;
    console.error(`FAIL ${type}:`, JSON.stringify(r.error.issues, null, 2));
  } else {
    console.log(`ok   ${type.padEnd(22)} ${e.label}`);
  }
}
console.log(bad === 0 ? `\nAll ${sectionTypes.length} section defaults valid.` : `\n${bad} invalid.`);
process.exit(bad === 0 ? 0 : 1);
