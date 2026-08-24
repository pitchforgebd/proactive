/**
 * REVALIDATION AUDIT —  npm run check:revalidation
 *
 * PHASE2-BACKEND.md §9 requires every successful write to refresh the public
 * paths it affects. A missed call is invisible in testing (the page just stays
 * stale for up to the 60s ISR fallback) and easy to forget when adding an
 * action, so this checks it statically and fails the build script if a write
 * path has no revalidation alongside it.
 *
 * It is intentionally simple: for every exported action that writes to the
 * database, assert the same function body mentions a revalidate helper. Some
 * writes legitimately have no public effect — those are listed in ALLOWED.
 */
import { readFileSync } from 'node:fs';

/** Modules that perform database writes. */
const MODULES = [
  'app/admin/pages/actions.ts',
  'lib/admin/collection-actions.ts',
  'lib/admin/site-actions.ts',
  'app/api/contact/route.ts',
  'app/api/career/route.ts',
];

/**
 * Writes with no public-page consequence, with the reason. A submission is not
 * shown anywhere public, and the admin inbox is force-dynamic — it never reads
 * a cached copy.
 */
const ALLOWED: Record<string, string> = {
  'app/api/contact/route.ts::POST': 'a contact message appears only in the admin inbox',
  'app/api/career/route.ts::POST': 'an application appears only in the admin inbox',
  'lib/admin/site-actions.ts::markRead': 'read state is admin-only',
  'lib/admin/site-actions.ts::deleteSubmission': 'submissions are admin-only',
  'lib/admin/site-actions.ts::listSubmissions': 'read-only',
};

const WRITE = /\bdb\s*\.\s*(insert|update|delete)\s*\(/;
const REVALIDATE = /revalidate(Path|Page|Category|Product|News|Gallery|Videos|Partners|Jobs|Settings|Sitemap|CollectionLists)\s*\(/;

interface Finding {
  where: string;
  writes: boolean;
  revalidates: boolean;
  allowed?: string;
}

/** Split a module into top-level exported functions by brace depth. */
function functionsOf(source: string): { name: string; body: string }[] {
  const out: { name: string; body: string }[] = [];
  const header = /export\s+async\s+function\s+(\w+)/g;

  let match: RegExpExecArray | null;
  while ((match = header.exec(source))) {
    const name = match[1];
    const open = source.indexOf('{', match.index);
    if (open === -1) continue;

    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    out.push({ name, body: source.slice(open, end + 1) });
  }
  return out;
}

const findings: Finding[] = [];

for (const file of MODULES) {
  const source = readFileSync(file, 'utf8');
  for (const fn of functionsOf(source)) {
    if (!WRITE.test(fn.body)) continue;
    const where = `${file}::${fn.name}`;
    findings.push({
      where,
      writes: true,
      revalidates: REVALIDATE.test(fn.body),
      allowed: ALLOWED[where],
    });
  }
}

let failed = 0;
for (const f of findings) {
  if (f.revalidates) {
    console.log(`ok       ${f.where}`);
  } else if (f.allowed) {
    console.log(`exempt   ${f.where}  — ${f.allowed}`);
  } else {
    failed++;
    console.error(`MISSING  ${f.where}  — writes but never revalidates`);
  }
}

console.log(
  `\n${findings.length} write path(s) checked; ` +
    `${findings.filter((f) => f.revalidates).length} revalidate, ` +
    `${findings.filter((f) => !f.revalidates && f.allowed).length} exempt.`,
);

if (failed > 0) {
  console.error(`\n${failed} write path(s) missing revalidation.`);
  process.exit(1);
}
