'use client';

import { useState, useTransition } from 'react';
import { Loader2, Save } from 'lucide-react';

import ImageField from '@/components/admin/ImageField';
import { toastFromResult } from '@/components/admin/AdminToaster';
import { saveSettings, type SettingsResult } from '@/lib/admin/site-actions';

type Values = Record<string, string>;

const control =
  'w-full rounded-md border border-ink/20 bg-paper-2 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/25';

const fields: { name: string; label: string; hint?: string; type?: string }[] = [
  { name: 'companyName', label: 'Company name' },
  { name: 'phone', label: 'Phone', hint: 'Shown in the footer and every CTA band.' },
  {
    name: 'whatsapp',
    label: 'WhatsApp number',
    hint: 'Floating chat button on the right. Use country code, e.g. +880 1855 939 450. Empty hides the button.',
  },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address' },
  {
    name: 'mapQuery',
    label: 'Map location',
    hint: 'What the lazy-loaded map searches for on the contact page.',
  },
];

const socials = [
  { name: 'facebook', label: 'Facebook' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'youtube', label: 'YouTube' },
];

/** Settings → Verification & Head Tags — tokens/IDs only; empty clears public tags. */
const seoFields: { name: string; label: string; hint?: string }[] = [
  {
    name: 'seoGoogleVerification',
    label: 'Google Search Console',
    hint: 'Verification content token only (not the full HTML meta tag).',
  },
  {
    name: 'seoBingVerification',
    label: 'Bing Webmaster Tools',
    hint: 'msvalidate.01 content token only.',
  },
  {
    name: 'seoGa4Id',
    label: 'Google Analytics 4 Measurement ID',
    hint: 'e.g. G-XXXXXXXX — loads only when set.',
  },
  {
    name: 'seoGtmId',
    label: 'Google Tag Manager Container ID',
    hint: 'e.g. GTM-XXXXXX — loads only when set.',
  },
  {
    name: 'seoMetaPixelId',
    label: 'Meta / Facebook Pixel ID',
    hint: 'Numeric Pixel ID — loads only when set.',
  },
  {
    name: 'seoFacebookDomainVerification',
    label: 'Facebook Domain Verification',
    hint: 'facebook-domain-verification content token.',
  },
  {
    name: 'seoYandexVerification',
    label: 'Yandex Webmaster',
    hint: 'Yandex verification content token.',
  },
  {
    name: 'seoPinterestVerification',
    label: 'Pinterest',
    hint: 'pinterest-site-verification content token.',
  },
  {
    name: 'seoAhrefsVerification',
    label: 'Ahrefs',
    hint: 'ahrefs-site-verification content token.',
  },
];

/** An empty social URL removes that link rather than rendering a dead one. */
export default function SettingsForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [result, setResult] = useState<SettingsResult | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setResult(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const outcome = await saveSettings(JSON.stringify(values));
          setResult(outcome);
          toastFromResult(outcome, 'Settings saved.');
        });
      }}
      className="max-w-2xl space-y-7"
    >
      {result?.message && !result.ok && (
        <p
          role="alert"
          className="flex items-center gap-2 border-l-2 border-magenta bg-magenta/5 px-4 py-3 text-sm"
        >
          {result.message}
        </p>
      )}

      <Row
        name="companyName"
        label="Company name"
        value={values.companyName ?? ''}
        onChange={set}
        error={result?.errors?.companyName}
      />

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Header logo — light theme
        </p>
        <p className="mt-1 text-xs text-graphite">
          Shown in the navbar while the site is in light mode. Upload a
          PNG/WebP/JPG (or paste a /images/… path). Clear it to restore the
          coded wordmark.
        </p>
        <div className="mt-3">
          <ImageField
            value={values.logo ?? ''}
            onChange={(url) => set('logo', url)}
            describedBy={result?.errors?.logo ? 'logo-error' : undefined}
          />
        </div>
        {result?.errors?.logo && (
          <p id="logo-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.logo}
          </p>
        )}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Header logo — dark theme
        </p>
        <p className="mt-1 text-xs text-graphite">
          Shown in the navbar while the site is in dark mode — use the light /
          reversed version of the mark here. Leave empty to use the light-theme
          logo in both modes.
        </p>
        <div className="mt-3">
          <ImageField
            value={values.logoDark ?? ''}
            onChange={(url) => set('logoDark', url)}
            describedBy={result?.errors?.logoDark ? 'logoDark-error' : undefined}
          />
        </div>
        {result?.errors?.logoDark && (
          <p id="logoDark-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.logoDark}
          </p>
        )}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Footer logo
        </p>
        <p className="mt-1 text-xs text-graphite">
          One image for the footer in both themes — the footer band stays navy,
          so use the light / reversed mark. Leave empty to fall back to the
          header logo.
        </p>
        <div className="mt-3">
          <ImageField
            value={values.logoFooter ?? ''}
            onChange={(url) => set('logoFooter', url)}
            describedBy={result?.errors?.logoFooter ? 'logoFooter-error' : undefined}
          />
        </div>
        {result?.errors?.logoFooter && (
          <p id="logoFooter-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.logoFooter}
          </p>
        )}
      </div>

      <Row
        name="logoTitle"
        label="Logo title"
        value={values.logoTitle ?? ''}
        onChange={set}
        error={result?.errors?.logoTitle}
        hint="Primary wordmark line when no logo image is set (header & footer). Default: Proactive."
      />
      <Row
        name="logoSubtitle"
        label="Logo subtitle"
        value={values.logoSubtitle ?? ''}
        onChange={set}
        error={result?.errors?.logoSubtitle}
        hint="Secondary wordmark line. Default: Trade Int'l."
      />

      <div>
        <label
          htmlFor="footerTagline"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
        >
          Footer tagline
        </label>
        <p className="mt-1 text-xs text-graphite">
          Short blurb under the footer logo. Leave empty to restore the default
          marketing line.
        </p>
        <textarea
          id="footerTagline"
          name="footerTagline"
          rows={4}
          value={values.footerTagline ?? ''}
          onChange={(e) => set('footerTagline', e.target.value)}
          className={`mt-2 ${control}`}
          aria-invalid={Boolean(result?.errors?.footerTagline)}
          aria-describedby={
            result?.errors?.footerTagline ? 'footerTagline-error' : undefined
          }
        />
        {result?.errors?.footerTagline && (
          <p id="footerTagline-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.footerTagline}
          </p>
        )}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Favicon
        </p>
        <p className="mt-1 text-xs text-graphite">
          Optional browser tab icon. Upload a square PNG or WebP (32×32 or
          512×512 recommended). Clear the field to remove the custom favicon.
        </p>
        <div className="mt-3">
          <ImageField
            value={values.favicon ?? ''}
            onChange={(url) => set('favicon', url)}
            describedBy={result?.errors?.favicon ? 'favicon-error' : undefined}
          />
        </div>
        {result?.errors?.favicon && (
          <p id="favicon-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.favicon}
          </p>
        )}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Footer QR code
        </p>
        <p className="mt-1 text-xs text-graphite">
          Optional. Upload a square QR image (PNG/WebP/JPG). Clear the field to
          hide the QR block from the public footer.
        </p>
        <div className="mt-3">
          <ImageField
            value={values.qrCode ?? ''}
            onChange={(url) => set('qrCode', url)}
            describedBy={result?.errors?.qrCode ? 'qrCode-error' : undefined}
          />
        </div>
        {result?.errors?.qrCode && (
          <p id="qrCode-error" role="alert" className="mt-1.5 text-xs text-magenta">
            {result.errors.qrCode}
          </p>
        )}
        <div className="mt-4">
          <Row
            name="qrCodeCaption"
            label="QR caption"
            hint="Optional short line under the QR (e.g. Scan for WhatsApp)."
            value={values.qrCodeCaption ?? ''}
            onChange={set}
            error={result?.errors?.qrCodeCaption}
          />
        </div>
      </div>

      {fields
        .filter((field) => field.name !== 'companyName')
        .map((field) => (
          <Row
            key={field.name}
            {...field}
            value={values[field.name] ?? ''}
            onChange={set}
            error={result?.errors?.[field.name]}
          />
        ))}

      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Social links
        </legend>
        <p className="mt-1 text-xs text-graphite">
          Leave one empty to remove it from the site.
        </p>
        <div className="mt-4 space-y-5">
          {socials.map((field) => (
            <Row
              key={field.name}
              {...field}
              value={values[field.name] ?? ''}
              onChange={set}
              error={result?.errors?.[field.name]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset id="verification-head-tags">
        <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Verification &amp; Head Tags
        </legend>
        <p className="mt-1 text-xs text-graphite">
          Tokens and measurement IDs for the public site head. Leave a field
          empty to remove that tag. Do not paste secrets or full script snippets
          into verification fields — use the dedicated GA4 / GTM / Pixel IDs.
        </p>
        <div className="mt-4 space-y-5">
          {seoFields.map((field) => (
            <Row
              key={field.name}
              {...field}
              value={values[field.name] ?? ''}
              onChange={set}
              error={result?.errors?.[field.name]}
            />
          ))}
          <div>
            <label
              htmlFor="seoCustomHeadTags"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
            >
              Custom head tags
            </label>
            <p className="mt-1 text-xs text-graphite">
              Optional &lt;meta&gt; / &lt;link&gt; only. Scripts and event handlers
              are stripped on save. Prefer the fields above for verification and
              analytics.
            </p>
            <textarea
              id="seoCustomHeadTags"
              name="seoCustomHeadTags"
              rows={5}
              value={values.seoCustomHeadTags ?? ''}
              onChange={(e) => set('seoCustomHeadTags', e.target.value)}
              aria-describedby={
                result?.errors?.seoCustomHeadTags ? 'seoCustomHeadTags-error' : undefined
              }
              className={`${control} mt-2 font-mono text-xs`}
              placeholder={'<meta name="example" content="…" />'}
            />
            {result?.errors?.seoCustomHeadTags && (
              <p
                id="seoCustomHeadTags-error"
                role="alert"
                className="mt-1.5 text-xs text-magenta"
              >
                {result.errors.seoCustomHeadTags}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-band transition-colors hover:bg-magenta hover:text-white disabled:opacity-60"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? 'Saving' : 'Save settings'}
      </button>
    </form>
  );
}

function Row({
  name,
  label,
  hint,
  type = 'text',
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite"
      >
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-graphite">{hint}</p>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${control} mt-2`}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-magenta">
          {error}
        </p>
      )}
    </div>
  );
}
