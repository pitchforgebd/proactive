import DottedMap from 'dotted-map';
import { cn } from '@/lib/utils';

/**
 * Animated sourcing-network map — dot-matrix world silhouette (built from real
 * country geometry via `dotted-map`, computed server-side) with our sourcing
 * countries pulsing and flight-path arcs converging on Dhaka.
 *
 * Deliberately NOT `dangerouslySetInnerHTML` (see components/ui/RichText.tsx —
 * that is the one place raw HTML is allowed). Every dot and path here is real
 * JSX built from `getPoints()`, so the whole thing is one static, server-
 * rendered SVG: no client JavaScript, nothing to hydrate, nothing to fetch.
 * The "animation" is pure CSS (globals.css `.map-*` rules), so it still moves
 * with zero JS cost and degrades under `prefers-reduced-motion` automatically.
 */

interface CountryMarker {
  lat: number;
  lng: number;
  label: string;
}

/** Bangladesh — the hub every sourcing line converges on. */
const HUB: CountryMarker = { lat: 23.8103, lng: 90.4125, label: 'Dhaka, Bangladesh — HQ' };

/** Same nine markets as the "Countries We Source From" grid below it. */
const SOURCE_COUNTRIES: CountryMarker[] = [
  { lat: 35.8617, lng: 104.1954, label: 'China' },
  { lat: 20.5937, lng: 78.9629, label: 'India' },
  { lat: 51.1657, lng: 10.4515, label: 'Germany' },
  { lat: 35.9078, lng: 127.7669, label: 'South Korea' },
  { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { lat: 4.2105, lng: 101.9758, label: 'Malaysia' },
  { lat: 36.2048, lng: 138.2529, label: 'Japan' },
  { lat: 38.9637, lng: 35.2433, label: 'Turkey' },
  { lat: 23.6978, lng: 120.9605, label: 'Taiwan' },
];

/** Gentle "flight path" curve, always bowed toward the top of the map. */
function flightPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const bow = Math.min(Math.hypot(x2 - x1, y2 - y1) * 0.22, 9);
  return `M ${x1} ${y1} Q ${mx} ${my - bow} ${x2} ${y2}`;
}

export default async function WorldMap({ className }: { className?: string }) {
  const map = new DottedMap({ height: 58, grid: 'diagonal' });

  const hub = map.addPin({ lat: HUB.lat, lng: HUB.lng, data: { kind: 'hub' } });
  const sources = SOURCE_COUNTRIES.map((c) => ({
    ...map.addPin({ lat: c.lat, lng: c.lng, data: { kind: 'source' } }),
    label: c.label,
  }));

  // Base dots: everything dotted-map laid out, minus the pins we just added.
  const baseDots = map
    .getPoints()
    .filter((p) => !(p.data as { kind?: string } | undefined)?.kind);

  const { width, height } = map.image;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`World map of Proactive Trade International's sourcing network — ${SOURCE_COUNTRIES.map((c) => c.label).join(', ')} — converging on Dhaka, Bangladesh`}
      className={cn('h-auto w-full', className)}
    >
      <g className="fill-graphite" style={{ opacity: 0.5 }}>
        {baseDots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={0.34} />
        ))}
      </g>

      {sources.map((p, i) => (
        <path key={`route-${i}`} d={flightPath(p.x, p.y, hub.x, hub.y)} className="map-route" fill="none" />
      ))}

      {sources.map((p, i) => (
        <circle key={`source-${i}`} cx={p.x} cy={p.y} r={0.85} className="map-pin map-pin--source">
          <title>{p.label}</title>
        </circle>
      ))}

      <circle cx={hub.x} cy={hub.y} r={1.4} className="map-ping map-ping--a" fill="none" />
      <circle cx={hub.x} cy={hub.y} r={1.4} className="map-ping map-ping--b" fill="none" />
      <circle cx={hub.x} cy={hub.y} r={1.3} className="map-pin map-pin--hub">
        <title>{HUB.label}</title>
      </circle>
    </svg>
  );
}
