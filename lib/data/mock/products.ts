import type { Product } from '@/lib/types';

const img = (n: string) => `/images/products/${n}.png`;

/**
 * Seed products (CLAUDE.md §9). Content is rich HTML so the product page
 * exercises the same render path the dashboard will feed.
 */
export const products: Product[] = [
  {
    id: 'p-1',
    slug: 'ctp-machine',
    categorySlug: 'machineries-solutions',
    name: 'CTP Machine',
    images: [img('ctp-machine-1'), img('ctp-machine-2'), img('ctp-machine-3')],
    summary:
      'Thermal computer-to-plate system for commercial and packaging offset — repeatable dot, fast throughput, low maintenance.',
    order: 1,
    specs: [
      { label: 'Plate type', value: 'Thermal, 830 nm' },
      { label: 'Resolution', value: '2400 / 2540 dpi' },
      { label: 'Throughput', value: 'Up to 30 plates / hour' },
      { label: 'Max plate size', value: '1160 × 940 mm' },
      { label: 'Screening', value: 'AM up to 350 lpi, FM 10 µm' },
      { label: 'Loading', value: 'Manual, semi-auto or auto cassette' },
    ],
    content: `
      <p>A thermal CTP platform built for press rooms that cannot afford plate
      variation. The imaging head holds a stable dot across the full plate, so the
      curve you profile on Monday is still the curve you print on Friday.</p>
      <h2>Why press rooms choose it</h2>
      <ul>
        <li>Repeatable 1–99% dot rendering at 2400 dpi with hybrid screening support</li>
        <li>Auto-calibration routine keeps plate output aligned to the press curve</li>
        <li>Low chemistry consumption when paired with our processing programme</li>
        <li>Optional automatic plate loader for unattended overnight production</li>
      </ul>
      <h2>Installation & support</h2>
      <p>Supplied with on-site commissioning, operator training and a plate/chemistry
      starter package. Our technical support team carries wear parts locally, and CRM
      schedules preventive maintenance visits so downtime is planned, not discovered.</p>
    `,
    seo: {
      title: 'CTP Machine',
      description:
        'Thermal CTP system with 2400 dpi imaging, hybrid screening and optional auto plate loading — supplied and serviced in Bangladesh.',
    },
  },
  {
    id: 'p-2',
    slug: 'ctcp-machine',
    categorySlug: 'machineries-solutions',
    name: 'CTCP Machine',
    images: [img('ctcp-machine-1'), img('ctcp-machine-2')],
    summary:
      'UV computer-to-conventional-plate imaging — run low-cost conventional plates without giving up register or resolution.',
    order: 2,
    specs: [
      { label: 'Plate type', value: 'Conventional UV (violet-free)' },
      { label: 'Light source', value: 'UV LED array, long life' },
      { label: 'Resolution', value: '2400 dpi' },
      { label: 'Throughput', value: 'Up to 25 plates / hour' },
      { label: 'Max plate size', value: '1100 × 900 mm' },
    ],
    content: `
      <p>CTCP images standard conventional plates with a UV LED array, which keeps
      the plate bill low while still delivering CTP-class accuracy. For packaging
      houses running long jobs on familiar plate stock, it is the shortest route to
      digital plate-making.</p>
      <h2>Highlights</h2>
      <ul>
        <li>Uses widely available conventional plates — no thermal plate premium</li>
        <li>UV LED source with a long service life and low power draw</li>
        <li>Consistent 2400 dpi imaging across the full format</li>
        <li>Integrates with existing processors and punch-bend systems</li>
      </ul>
    `,
    seo: {
      title: 'CTCP Machine',
      description:
        'UV-CTCP plate imaging at 2400 dpi on conventional plates — lower plate cost with digital plate-making accuracy.',
    },
  },
  {
    id: 'p-3',
    slug: 'flexo-ctp-machine',
    categorySlug: 'machineries-solutions',
    name: 'Flexo CTP Machine',
    images: [img('flexo-ctp-machine-1'), img('flexo-ctp-machine-2')],
    summary:
      'Digital flexo plate imaging for flexible packaging and corrugated — clean highlights, stable solids, repeatable plates.',
    order: 3,
    specs: [
      { label: 'Plate type', value: 'Digital flexo photopolymer' },
      { label: 'Resolution', value: '2540 / 4000 dpi' },
      { label: 'Max plate size', value: '1067 × 1524 mm' },
      { label: 'Screening', value: 'Surface patterning, flat-top dot ready' },
    ],
    content: `
      <p>Flexo CTP brings the highlight control of digital imaging to flexible
      packaging and corrugated post-print. Flat-top dot workflows hold the 1% dot
      and print heavier solids at lower impression, which is where flexo waste
      usually comes from.</p>
      <h2>Built for packaging work</h2>
      <ul>
        <li>4000 dpi option for fine text, barcodes and vignettes</li>
        <li>Surface screening patterns for higher ink transfer on solids</li>
        <li>Large format for corrugated and wide-web flexible packaging</li>
        <li>Supported by our plate, adhesive and ink programme end to end</li>
      </ul>
    `,
    seo: {
      title: 'Flexo CTP Machine',
      description:
        'Digital flexo plate imaging up to 4000 dpi with flat-top dot and surface screening for flexible packaging and corrugated.',
    },
  },
  {
    id: 'p-4',
    slug: 'uv-coating-machine',
    categorySlug: 'machineries-solutions',
    name: 'UV Coating Machine',
    images: [img('uv-coating-machine-1'), img('uv-coating-machine-2')],
    summary:
      'Roller-coater and UV curing line for gloss, matt and spot finishes on cartons and commercial print.',
    order: 4,
    specs: [
      { label: 'Max sheet size', value: '720 × 1020 mm' },
      { label: 'Speed', value: 'Up to 7,000 sheets / hour' },
      { label: 'Curing', value: 'UV lamps with IR pre-dry' },
      { label: 'Coating', value: 'Gloss, matt, spot via blanket' },
    ],
    content: `
      <p>A UV coating line that turns a printed sheet into a finished one — high
      gloss for retail cartons, matt for premium packaging, or spot coating through
      a patterned blanket.</p>
      <ul>
        <li>Even film weight across the sheet, with quick coating changeover</li>
        <li>IR pre-dry plus UV cure for scuff-resistant, stackable output</li>
        <li>Runs with our full coating and varnish programme</li>
      </ul>
    `,
    seo: { title: 'UV Coating Machine' },
  },
  {
    id: 'p-5',
    slug: 'fountain-solution',
    categorySlug: 'press-room-chemicals-solutions',
    name: 'Fountain Solution',
    images: [img('fountain-solution-1'), img('fountain-solution-2')],
    summary:
      'Alcohol-reduced fountain concentrate that holds pH and conductivity through long runs on sheetfed offset.',
    order: 1,
    specs: [
      { label: 'Dosage', value: '3–5% by volume' },
      { label: 'pH range', value: '4.8 – 5.4' },
      { label: 'Conductivity', value: '1200 – 1800 µS/cm' },
      { label: 'Pack size', value: '20 L / 200 L' },
    ],
    content: `
      <p>Fountain chemistry is where most colour drift starts. This concentrate holds
      pH and conductivity across the run, so ink/water balance stays where the
      operator set it instead of chasing density all shift.</p>
      <ul>
        <li>Runs at reduced alcohol — lower cost and a healthier press room</li>
        <li>Protects rollers and blankets, reducing glaze and wash-up frequency</li>
        <li>Compatible with conventional, UV and hybrid ink systems</li>
      </ul>
      <p>Supplied with a dosing and water-hardness assessment for your site.</p>
    `,
    seo: { title: 'Fountain Solution' },
  },
  {
    id: 'p-6',
    slug: 'uv-blanket-wash',
    categorySlug: 'press-room-chemicals-solutions',
    name: 'UV Blanket & Roller Wash',
    images: [img('uv-blanket-wash-1')],
    summary:
      'Fast-flash wash formulated for UV and LED-UV ink systems — cuts cured residue without swelling rubber.',
    order: 2,
    specs: [
      { label: 'Application', value: 'Manual and automatic wash-up' },
      { label: 'Flash point', value: '> 62 °C' },
      { label: 'Pack size', value: '20 L / 200 L' },
    ],
    content: `
      <p>UV inks punish the wrong wash — rollers glaze, blankets swell and impression
      goes soft. This formulation lifts cured UV residue quickly and evaporates clean,
      keeping roller durometer and blanket gauge stable.</p>
      <ul>
        <li>Safe on standard press rubber and UV-compatible blankets</li>
        <li>Low odour with a high flash point for safer storage</li>
        <li>Works in automatic blanket wash systems without residue build-up</li>
      </ul>
    `,
    seo: { title: 'UV Blanket & Roller Wash' },
  },
  {
    id: 'p-7',
    slug: 'offset-sheetfed-ink',
    categorySlug: 'inks-and-coatings-solutions',
    name: 'Offset Sheetfed Process Ink',
    images: [img('offset-sheetfed-ink-1'), img('offset-sheetfed-ink-2')],
    summary:
      'Four-colour process series with high pigment load and fast setting for coated and uncoated packaging stock.',
    order: 1,
    specs: [
      { label: 'Series', value: 'Process C / M / Y / K + Pantone base' },
      { label: 'Substrate', value: 'Coated, uncoated, board' },
      { label: 'Setting', value: 'Fast set, low spray powder demand' },
      { label: 'Pack size', value: '1 kg / 2.5 kg tins' },
    ],
    content: `
      <p>A process series built for packaging density targets. High pigment load means
      you reach target density with less film, which sets faster, marks less and gets
      the stack to finishing sooner.</p>
      <ul>
        <li>Stable ink/water window — forgiving on long runs</li>
        <li>Strong gloss hold-out on coated board</li>
        <li>Pantone base set for spot-colour matching in-house</li>
      </ul>
    `,
    seo: { title: 'Offset Sheetfed Process Ink' },
  },
  {
    id: 'p-8',
    slug: 'uv-led-ink',
    categorySlug: 'inks-and-coatings-solutions',
    name: 'UV / LED-UV Curable Ink',
    images: [img('uv-led-ink-1')],
    summary:
      'Instant-cure ink system for immediate finishing — no set-off, no spray powder, straight to die cutting.',
    order: 2,
    specs: [
      { label: 'Cure', value: 'Mercury UV and LED-UV' },
      { label: 'Substrate', value: 'Board, film, synthetic, foil' },
      { label: 'Pack size', value: '1 kg / 2.5 kg' },
    ],
    content: `
      <p>Cured on delivery means the sheet is finished when it leaves the press —
      no drying racks, no spray powder, no set-off in the stack. For short-lead
      packaging work that is hours of turnaround recovered.</p>
      <ul>
        <li>Prints on non-absorbent substrates: film, foil and synthetics</li>
        <li>High scuff and chemical resistance straight off the press</li>
        <li>LED-compatible chemistry for lower energy consumption</li>
      </ul>
    `,
    seo: { title: 'UV / LED-UV Curable Ink' },
  },
  {
    id: 'p-9',
    slug: 'rubber-offset-blanket',
    categorySlug: 'blankets-plates-adhesives-papers-solutions',
    name: 'Rubber Offset Blanket',
    images: [img('rubber-offset-blanket-1'), img('rubber-offset-blanket-2')],
    summary:
      'Compressible four-ply blanket with fast release and high smash recovery for packaging run lengths.',
    order: 1,
    specs: [
      { label: 'Construction', value: '4-ply compressible' },
      { label: 'Thickness', value: '1.95 mm ± 0.02' },
      { label: 'Surface', value: 'Fast release, low-tack' },
      { label: 'Supply', value: 'Cut, drilled and barred to press' },
    ],
    content: `
      <p>The blanket decides how the dot lands. A compressible carcass absorbs
      impression variation and recovers from smash, so print stays sharp deep into
      the run instead of degrading after the first hundred thousand sheets.</p>
      <ul>
        <li>Consistent gauge across the sheet for even impression</li>
        <li>Fast release — less picking on coated and recycled board</li>
        <li>Supplied cut, drilled and barred to your press specification</li>
      </ul>
    `,
    seo: { title: 'Rubber Offset Blanket' },
  },
  {
    id: 'p-10',
    slug: 'thermal-ctp-plate',
    categorySlug: 'blankets-plates-adhesives-papers-solutions',
    name: 'Thermal CTP Plate',
    images: [img('thermal-ctp-plate-1'), img('thermal-ctp-plate-2')],
    summary:
      'Long-run thermal plate with a wide processing window and clean 1–99% dot reproduction.',
    order: 2,
    specs: [
      { label: 'Type', value: 'Positive thermal, 830 nm' },
      { label: 'Run length', value: 'Up to 250,000 impressions' },
      { label: 'Resolution', value: '1–99% at 200 lpi' },
      { label: 'Gauge', value: '0.15 / 0.30 mm' },
    ],
    content: `
      <p>A thermal plate with a wide processing window — small drifts in developer
      temperature or replenishment do not move the dot. That tolerance is what keeps
      colour consistent between plate batches.</p>
      <ul>
        <li>Up to 250,000 impressions unbaked on conventional inks</li>
        <li>Clean, high-contrast image for fast plate inspection</li>
        <li>Stocked locally in common gauges and formats</li>
      </ul>
    `,
    seo: { title: 'Thermal CTP Plate' },
  },
  {
    id: 'p-11',
    slug: 'uv-ctcp-plate',
    categorySlug: 'blankets-plates-adhesives-papers-solutions',
    name: 'UV-CTCP Plate',
    images: [img('uv-ctcp-plate-1')],
    summary:
      'Conventional plate optimised for UV LED imaging — CTP accuracy at conventional plate cost.',
    order: 3,
    specs: [
      { label: 'Type', value: 'Positive conventional, UV-sensitised' },
      { label: 'Run length', value: 'Up to 150,000 impressions' },
      { label: 'Gauge', value: '0.15 / 0.30 mm' },
    ],
    content: `
      <p>Paired with a CTCP imaging system, this plate gives packaging printers
      digital plate-making with the plate economics they already budget for.</p>
      <ul>
        <li>Fast UV exposure speed for higher plate throughput</li>
        <li>Stable coating with a long shelf life in tropical storage</li>
        <li>Processes on standard conventional plate lines</li>
      </ul>
    `,
    seo: { title: 'UV-CTCP Plate' },
  },
  {
    id: 'p-12',
    slug: 'packaging-adhesives',
    categorySlug: 'blankets-plates-adhesives-papers-solutions',
    name: 'Packaging Adhesives',
    images: [img('packaging-adhesives-1')],
    summary:
      'Water-based and hot-melt adhesives for folder gluer, rigid box and lamination lines.',
    order: 4,
    specs: [
      { label: 'Types', value: 'Water-based, hot-melt, lamination' },
      { label: 'Application', value: 'Folder gluer, rigid box, laminator' },
      { label: 'Pack size', value: '25 kg / 200 kg' },
    ],
    content: `
      <p>Bond failure shows up at the customer, not on the line. These adhesive
      grades are selected against your board, coating and line speed so the joint
      holds through packing, transport and shelf life.</p>
      <ul>
        <li>Grades for coated, UV-varnished and laminated board</li>
        <li>Fast setting speed matched to folder gluer output</li>
        <li>Lamination adhesives for gloss and matt film</li>
      </ul>
    `,
    seo: { title: 'Packaging Adhesives' },
  },
];
