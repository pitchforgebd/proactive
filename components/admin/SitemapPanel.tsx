'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';

import {
  refreshSitemap,
  type SitemapRefreshResult,
} from '@/lib/admin/site-actions';
import { toastFromResult } from '@/components/admin/AdminToaster';
import type { SitemapContentTypeConfig } from '@/lib/seo/sitemap-config';
import type { SitemapUrlBreakdown } from '@/lib/seo/sitemap-summary';

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function SitemapPanel({
  sitemapUrl,
  initialBreakdown,
  contentTypes,
  cmsPages,
  isrSeconds,
}: {
  sitemapUrl: string;
  initialBreakdown: SitemapUrlBreakdown;
  contentTypes: SitemapContentTypeConfig[];
  cmsPages: Array<{
    slug: string;
    label: string;
    path: string;
    priority: number;
    changeFrequency: string;
  }>;
  isrSeconds: number;
}) {
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [result, setResult] = useState<SitemapRefreshResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="max-w-3xl space-y-8">
      {result?.message && !result.ok && (
        <p
          role="alert"
          className="flex items-start gap-2 border-l-2 border-magenta bg-magenta/5 px-4 py-3 text-sm"
        >
          <span>{result.message}</span>
        </p>
      )}

      {/* Status ----------------------------------------------------------- */}
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Sitemap status
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <StatusItem label="Mode" value="Dynamic (App Router)" />
          <StatusItem label="Status" value="Active — rebuilt from the database" />
          <StatusItem
            label="Public URL"
            value={
              <a
                href={sitemapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all text-cyan hover:underline"
              >
                {sitemapUrl}
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              </a>
            }
          />
          <StatusItem label="URL count" value={String(breakdown.total)} />
          <StatusItem
            label="Newest content lastmod"
            value={formatWhen(breakdown.newestLastModified)}
          />
          <StatusItem
            label="Last cache refresh"
            value={
              result?.refreshedAt
                ? formatWhen(result.refreshedAt)
                : 'Not refreshed this session — content writes also revalidate'
            }
          />
          <StatusItem
            label="ISR fallback"
            value={`Every ${isrSeconds}s if no on-demand revalidation`}
          />
          <StatusItem label="Physical file" value="None — /sitemap.xml is generated on demand" />
        </dl>

        <div className="overflow-x-auto rounded-md border border-ink/10">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <caption className="border-b border-ink/10 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
              Current URL breakdown
            </caption>
            <tbody>
              <BreakdownRow label="CMS / marketing pages" count={breakdown.cmsPages} />
              <BreakdownRow label="Product categories" count={breakdown.categories} />
              <BreakdownRow label="Products" count={breakdown.products} />
              <BreakdownRow label="News articles" count={breakdown.newsArticles} />
              <BreakdownRow label="Collection hubs" count={breakdown.hubs} />
              {breakdown.other > 0 && (
                <BreakdownRow label="Other" count={breakdown.other} />
              )}
              <tr className="border-t border-ink/10 bg-ink/[0.02] font-semibold">
                <th scope="row" className="px-3 py-2">
                  Total
                </th>
                <td className="px-3 py-2 font-mono tabular-nums">{breakdown.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const next = await refreshSitemap();
              setResult(next);
              toastFromResult(next, 'Sitemap cache refreshed.');
              if (next.ok && next.breakdown) setBreakdown(next.breakdown);
            });
          }}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white disabled:opacity-60"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
          )}
          {pending ? 'Refreshing' : 'Generate Sitemap Now'}
        </button>
        <p className="text-xs text-graphite">
          This revalidates the cached <code className="font-mono">/sitemap.xml</code>{' '}
          route. It does not write a file to disk or ping search engines.
        </p>
      </section>

      {/* Content-type config --------------------------------------------- */}
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Content types &amp; defaults
        </h2>
        <p className="text-xs text-graphite">
          Priority and change frequency are coded with the sitemap builder (not
          editable here). Unsupported types are listed so the panel matches the
          real site — this project has no separate Services or Portfolio routes.
        </p>
        <div className="overflow-x-auto rounded-md border border-ink/10">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] font-mono text-[10px] uppercase tracking-[0.12em] text-graphite">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Change freq.</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {contentTypes.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 align-top">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-ink">{row.label}</p>
                    <p className="mt-0.5 text-xs text-graphite">{row.description}</p>
                    {!row.supported && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-magenta">
                        Not in this site
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs tabular-nums">
                    {row.supported
                      ? row.priority !== null
                        ? row.priority.toFixed(1)
                        : 'per page'
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    {row.supported ? row.changeFrequency ?? 'per page' : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-graphite">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per CMS page ---------------------------------------------------- */}
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          CMS page priority / frequency
        </h2>
        <div className="overflow-x-auto rounded-md border border-ink/10">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] font-mono text-[10px] uppercase tracking-[0.12em] text-graphite">
              <tr>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Change freq.</th>
              </tr>
            </thead>
            <tbody>
              {cmsPages.map((p) => (
                <tr key={p.slug} className="border-b border-ink/5">
                  <td className="px-3 py-2">{p.label}</td>
                  <td className="px-3 py-2 font-mono text-xs text-graphite">{p.path}</td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {p.priority.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.changeFrequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-ink/10 px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function BreakdownRow({ label, count }: { label: string; count: number }) {
  return (
    <tr className="border-b border-ink/5">
      <th scope="row" className="px-3 py-2 font-normal text-ink">
        {label}
      </th>
      <td className="px-3 py-2 font-mono tabular-nums text-graphite">{count}</td>
    </tr>
  );
}
