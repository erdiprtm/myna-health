// Motion (motion.dev, MIT) for the few places where scripted motion helps (P-015). Only the small
// pieces are imported: WAAPI-based `animate` from "motion/mini" plus `inView` (~4 KB gzip together;
// the hybrid `animate` from "motion" is ~20 KB). Bundled by Astro into a file (CSP: script-src 'self').
// Pages that don't import this module ship none of it.
import { animate } from "motion/mini";

export { inView } from "motion";
export { animate };

/** Strong ease-out: calm, settles without bounce (Emil Kowalski's design-engineering curve). */
export const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * False when the visitor asked for reduced motion. Vanilla Motion does not check this itself, so
 * every caller does. Content never depends on motion: it is visible without JS and without this.
 */
export const motionOk = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;
