import { useEffect, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * The cross-fade between pages.
 *
 * App keys one of these on the location inside `<AnimatePresence mode="wait">`,
 * so a navigation fades the old page out, unmounts it, then mounts the new page
 * and fades it in. The exit is deliberately quicker than the entry: leaving a
 * page should never feel like a wait, arriving at one can afford a moment.
 *
 * Two details it owns:
 *
 * - Scroll. The outgoing page is still on screen while it fades, so resetting
 *   scroll on the location change would make it jump before your eyes. The new
 *   wrapper scrolls in its own mount effect instead, which runs while it is
 *   still at opacity 0, so the first frame anyone sees is the new page in the
 *   right place. A URL with a hash is left alone: that scroll belongs to the
 *   browser.
 * - Reduced motion. Under `prefers-reduced-motion` the pages simply swap.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (window.location.hash) return;
    // `instant`, not `auto`: the site sets `scroll-behavior: smooth` on html,
    // and auto defers to it, which would glide the page to the top while the
    // new content fades in. The outgoing page has already gone by this point,
    // so a snap is invisible; a glide is not.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' } }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
