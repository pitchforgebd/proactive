/**
 * Lazy GSAP loader.
 *
 * GSAP + ScrollTrigger is ~35 kB gzipped — far too much to sit in the shared
 * bundle for a set of decorative effects (CLAUDE.md §5). So it is imported at
 * runtime, once, and only after the element that needs it is close to the
 * viewport. Reduced-motion visitors never download it at all.
 */
type GsapModule = typeof import('gsap');
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger');

export interface GsapBundle {
  gsap: GsapModule['gsap'];
  ScrollTrigger: ScrollTriggerModule['ScrollTrigger'];
}

let pending: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([core, st]) => {
        core.gsap.registerPlugin(st.ScrollTrigger);
        return { gsap: core.gsap, ScrollTrigger: st.ScrollTrigger };
      },
    );
  }
  return pending;
}

/** True when the visitor asked for less motion. Checked before any animation. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Runs `onNear` once the element comes within `margin` of the viewport. Used to
 * defer the GSAP download until it is actually about to be needed.
 */
export function whenNear(
  el: Element,
  onNear: () => void,
  margin = '300px',
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onNear();
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        onNear();
      }
    },
    { rootMargin: margin },
  );

  observer.observe(el);
  return () => observer.disconnect();
}
