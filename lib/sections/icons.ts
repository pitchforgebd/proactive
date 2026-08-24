/**
 * Icon whitelist for section data.
 *
 * Section `data` stores an icon by NAME (a string in the database), never by
 * array position. Phase 1 picked icons by index in a couple of places, which
 * meant reordering a list silently changed its icons — with the list now
 * editable that would be a live bug.
 *
 * Only names in this map can render. Anything else falls back to `fallback`,
 * so a typo in the dashboard degrades to a neutral icon instead of crashing.
 * The dashboard renders this list as a picker.
 */
import {
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  Compass,
  Cpu,
  Factory,
  Gauge,
  Globe2,
  Handshake,
  Headset,
  Layers,
  LifeBuoy,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const sectionIcons = {
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  Compass,
  Cpu,
  Factory,
  Gauge,
  Globe2,
  Handshake,
  Headset,
  Layers,
  LifeBuoy,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Truck,
  Users,
  Wrench,
} satisfies Record<string, LucideIcon>;

export type SectionIconName = keyof typeof sectionIcons;

/** Every allowed name — the dashboard icon picker iterates this. */
export const iconNames = Object.keys(sectionIcons) as SectionIconName[];

/** Resolve a stored name to a component. Unknown names degrade, never throw. */
export function resolveIcon(
  name: string | undefined,
  fallback: LucideIcon = Sparkles,
): LucideIcon {
  if (!name) return fallback;
  return sectionIcons[name as SectionIconName] ?? fallback;
}
