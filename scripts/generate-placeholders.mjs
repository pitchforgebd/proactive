/**
 * Generates the placeholder imagery in /public/images.
 *
 * These are real PNG rasters (not SVG) so next/image can optimize them to
 * AVIF/WebP exactly as it will with the client's photography. Every file is
 * deterministic from its name, drawn in the CMYK Precision palette: ink base,
 * cyan/magenta process glows, a halftone dot field and registration marks.
 *
 * Replace any file in place with real photography at the same dimensions and
 * nothing else has to change.
 *
 *   npm run gen:images
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ----------------------------- PNG encoding ------------------------------ */

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** rgb: Uint8Array of w*h*3 */
function encodePng(width, height, rgb) {
  const stride = width * 3;
  // One filter byte (0 = None) per scanline.
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    );
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------- Drawing --------------------------------- */

const INK = [14, 17, 22];
const INK2 = [23, 27, 33];
const PAPER = [244, 246, 248];
const CYAN = [0, 174, 239];
const MAGENTA = [236, 0, 140];
const YELLOW = [255, 212, 0];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const mix = (a, b, t) => a + (b - a) * t;

/**
 * Dark process-glow plate: the default look for hero, category, product,
 * news and gallery imagery.
 */
function drawPlate(width, height, seed) {
  const rgb = new Uint8Array(width * height * 3);
  const s = hash(seed);
  const s2 = hash(`${seed}:2`);
  const s3 = hash(`${seed}:3`);

  // Two process glows, positioned per seed.
  const cx1 = 0.18 + s * 0.4;
  const cy1 = 0.2 + s2 * 0.35;
  const cx2 = 0.55 + s2 * 0.35;
  const cy2 = 0.5 + s3 * 0.4;
  const angle = (s3 - 0.5) * 1.2;
  const dotPitch = 6 + Math.round(s * 5);
  const swapAccents = s2 > 0.5;
  const A = swapAccents ? MAGENTA : CYAN;
  const B = swapAccents ? CYAN : MAGENTA;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;

      // Base: vertical ink gradient.
      let r = mix(INK[0], INK2[0], v);
      let g = mix(INK[1], INK2[1], v);
      let b = mix(INK[2], INK2[2], v);

      // Glow A
      const ar = width / height;
      let dx = (u - cx1) * ar;
      let dy = v - cy1;
      let d = Math.sqrt(dx * dx + dy * dy);
      let f = Math.max(0, 1 - d / (0.55 + s * 0.25));
      f = f * f * (0.5 + s * 0.25);
      r += (A[0] - r) * f;
      g += (A[1] - g) * f;
      b += (A[2] - b) * f;

      // Glow B
      dx = (u - cx2) * ar;
      dy = v - cy2;
      d = Math.sqrt(dx * dx + dy * dy);
      f = Math.max(0, 1 - d / (0.5 + s2 * 0.25));
      f = f * f * (0.38 + s2 * 0.2);
      r += (B[0] - r) * f;
      g += (B[1] - g) * f;
      b += (B[2] - b) * f;

      // Diagonal press-sheet banding.
      const band = Math.sin((u * Math.cos(angle) + v * Math.sin(angle)) * 26) * 5;
      r += band;
      g += band;
      b += band;

      // Halftone dot field, denser where the plate is brighter.
      const px = x % dotPitch;
      const py = y % dotPitch;
      const half = dotPitch / 2;
      const dd = Math.sqrt((px - half) ** 2 + (py - half) ** 2);
      const lum = (r + g + b) / 765;
      const dotR = 0.9 + lum * (dotPitch * 0.3);
      if (dd < dotR) {
        const k = 0.16 * (1 - lum * 0.5);
        r += (255 - r) * k;
        g += (255 - g) * k;
        b += (255 - b) * k;
      }

      // Vignette so text overlays stay readable.
      const vd = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2);
      const vig = 1 - Math.max(0, vd - 0.42) * 0.85;
      r *= vig;
      g *= vig;
      b *= vig;

      const i = (y * width + x) * 3;
      rgb[i] = clamp(r);
      rgb[i + 1] = clamp(g);
      rgb[i + 2] = clamp(b);
    }
  }

  drawRegistration(rgb, width, height, s);
  return rgb;
}

/** Registration target + crop ticks, drawn into an existing buffer. */
function drawRegistration(rgb, width, height, s) {
  const cx = Math.round(width * (0.62 + s * 0.2));
  const cy = Math.round(height * (0.28 + s * 0.15));
  const R = Math.round(Math.min(width, height) * 0.17);
  const put = (x, y, col, a) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 3;
    rgb[i] = clamp(rgb[i] + (col[0] - rgb[i]) * a);
    rgb[i + 1] = clamp(rgb[i + 1] + (col[1] - rgb[i + 1]) * a);
    rgb[i + 2] = clamp(rgb[i + 2] + (col[2] - rgb[i + 2]) * a);
  };

  // Two rings slightly out of register.
  for (const [col, ox, oy, alpha] of [
    [CYAN, -Math.round(R * 0.09), 0, 0.5],
    [MAGENTA, Math.round(R * 0.09), Math.round(R * 0.03), 0.45],
  ]) {
    const steps = R * 8;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      for (let w = -1; w <= 1; w++) {
        put(
          Math.round(cx + ox + Math.cos(t) * (R + w)),
          Math.round(cy + oy + Math.sin(t) * (R + w)),
          col,
          alpha,
        );
      }
    }
  }

  // Crosshair through the target.
  for (let x = cx - R * 1.35; x <= cx + R * 1.35; x++) put(Math.round(x), cy, PAPER, 0.22);
  for (let y = cy - R * 1.35; y <= cy + R * 1.35; y++) put(cx, Math.round(y), PAPER, 0.22);

  // Corner crop marks.
  const m = Math.round(Math.min(width, height) * 0.045);
  const len = Math.round(m * 0.75);
  const corners = [
    [m, m, 1, 1],
    [width - m, m, -1, 1],
    [m, height - m, 1, -1],
    [width - m, height - m, -1, -1],
  ];
  for (const [x0, y0, sx, sy] of corners) {
    for (let i = 0; i < len; i++) {
      put(x0 + sx * i, y0, PAPER, 0.35);
      put(x0, y0 + sy * i, PAPER, 0.35);
    }
  }
}

/** Light plate for partner logo tiles: paper ground with a process mark. */
function drawPartnerTile(width, height, seed) {
  const rgb = new Uint8Array(width * height * 3);
  const s = hash(seed);
  const accent = s > 0.66 ? YELLOW : s > 0.33 ? MAGENTA : CYAN;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      rgb[i] = PAPER[0];
      rgb[i + 1] = PAPER[1];
      rgb[i + 2] = PAPER[2];
    }
  }

  const put = (x, y, col, a) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 3;
    rgb[i] = clamp(rgb[i] + (col[0] - rgb[i]) * a);
    rgb[i + 1] = clamp(rgb[i + 1] + (col[1] - rgb[i + 1]) * a);
    rgb[i + 2] = clamp(rgb[i + 2] + (col[2] - rgb[i + 2]) * a);
  };

  // Mark: a filled block plus a ring, then a wordmark-weight bar.
  const cy = Math.round(height / 2);
  const size = Math.round(height * 0.42);
  const x0 = Math.round(width * 0.12);

  for (let y = cy - size / 2; y < cy + size / 2; y++) {
    for (let x = x0; x < x0 + size; x++) put(Math.round(x), Math.round(y), INK, 0.9);
  }

  const rcx = x0 + size + Math.round(size * 0.55);
  const R = Math.round(size * 0.42);
  for (let i = 0; i < R * 10; i++) {
    const t = (i / (R * 10)) * Math.PI * 2;
    for (let w = -1; w <= 1; w++) {
      put(Math.round(rcx + Math.cos(t) * (R + w)), Math.round(cy + Math.sin(t) * (R + w)), accent, 0.95);
    }
  }

  const barX = rcx + R + Math.round(size * 0.5);
  const barW = width - barX - Math.round(width * 0.1);
  for (let y = cy - size * 0.16; y < cy + size * 0.16; y++) {
    for (let x = barX; x < barX + barW; x++) put(Math.round(x), Math.round(y), INK, 0.55);
  }
  for (let y = cy + size * 0.26; y < cy + size * 0.36; y++) {
    for (let x = barX; x < barX + barW * 0.6; x++) put(Math.round(x), Math.round(y), INK, 0.28);
  }

  return rgb;
}

/* ------------------------------- Manifest -------------------------------- */

const HERO = [1920, 1080];
const WIDE = [1200, 750];
const PRODUCT = [1200, 900];
const GALLERY = [1200, 900];
const PORTRAIT = [900, 1125];
const OG = [1200, 630];
const PARTNER = [320, 120];
const SOLUTION = [900, 900];

const files = [];
const add = (path, dims, kind = 'plate') =>
  files.push({ path, w: dims[0], h: dims[1], kind });

// Hero slider
['hero-01', 'hero-02', 'hero-03'].forEach((n) => add(`hero/${n}.png`, HERO));

// Categories
[
  'machineries-solutions',
  'press-room-chemicals-solutions',
  'inks-and-coatings-solutions',
  'blankets-plates-adhesives-papers-solutions',
].forEach((n) => add(`categories/${n}.png`, WIDE));

// Solutions (matches `solutions` in lib/data/mock/content.ts)
[
  'commercial-printing',
  'packaging',
  'label-printing',
  'corrugation',
  'newspaper-printing',
  'publishing',
  'digital-printing',
  'consumables',
].forEach((n) => add(`solutions/${n}.png`, SOLUTION));

// Products (matches lib/data/mock/products.ts)
[
  'ctp-machine-1', 'ctp-machine-2', 'ctp-machine-3',
  'ctcp-machine-1', 'ctcp-machine-2',
  'flexo-ctp-machine-1', 'flexo-ctp-machine-2',
  'uv-coating-machine-1', 'uv-coating-machine-2',
  'fountain-solution-1', 'fountain-solution-2',
  'uv-blanket-wash-1',
  'offset-sheetfed-ink-1', 'offset-sheetfed-ink-2',
  'uv-led-ink-1',
  'rubber-offset-blanket-1', 'rubber-offset-blanket-2',
  'thermal-ctp-plate-1', 'thermal-ctp-plate-2',
  'uv-ctcp-plate-1',
  'packaging-adhesives-1',
].forEach((n) => add(`products/${n}.png`, PRODUCT));

// News covers
[
  'warehouse-expansion',
  'flexo-ctp-commissioning',
  'technical-support-team',
  'manufacturer-partnership',
].forEach((n) => add(`news/${n}.png`, WIDE));

// Gallery
for (let i = 1; i <= 12; i++) {
  add(`gallery/gallery-${String(i).padStart(2, '0')}.png`, GALLERY);
}

// Partners
for (let i = 1; i <= 8; i++) {
  add(`partners/partner-${String(i).padStart(2, '0')}.png`, PARTNER, 'partner');
}

// Page imagery
add('about/about-company.png', WIDE);
add('about/founder-portrait.png', PORTRAIT);
add('about/global-sourcing.png', WIDE);
add('about/our-story.png', WIDE);
add('about/company-profile.png', WIDE);
add('about/parent-company-logo.png', [480, 160], 'partner');
add('about/vision-mission.png', WIDE);
add('about/career.png', WIDE);
add('og/og-default.png', OG);

/* -------------------------------- Write ---------------------------------- */

let written = 0;
for (const f of files) {
  const out = join(ROOT, 'public', 'images', f.path);
  mkdirSync(dirname(out), { recursive: true });
  const rgb =
    f.kind === 'partner'
      ? drawPartnerTile(f.w, f.h, f.path)
      : drawPlate(f.w, f.h, f.path);
  writeFileSync(out, encodePng(f.w, f.h, rgb));
  written++;
}

console.log(`Generated ${written} placeholder images in public/images.`);
