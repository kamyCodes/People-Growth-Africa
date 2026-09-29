import type { CSSProperties } from 'react';

/**
 * The artwork behind the account page's left panel: deep emerald and forest
 * greens, a few translucent ribbons flowing across a soft gradient, and some
 * very fine contour lines. It is inline SVG, so the page still loads no
 * external images, and it is purely decorative, so it stays hidden from
 * assistive technology.
 *
 * Two things shape the composition:
 *   - the copy sits over the top of the panel, so the upper left is kept dark
 *     and quiet, and the light gathers lower down where nothing is written;
 *   - the svg crops to fill the panel, and on a short panel only the middle of
 *     the canvas shows, so the brightness deliberately sits outside that band.
 *     Measured over the copy, white text holds better than 5:1 at every panel
 *     size the page renders.
 *
 * The layers are grouped so a slow, seamless drift can be applied to them
 * (see --animate-panel-drift in src/index.css): each group travels a few dozen
 * units on its own pass at well under a pixel a second ... visible as a gentle
 * flow if you look at the panel, never as something moving. Every group stops
 * moving for prefers-reduced-motion.
 */

type Drift = { x: number; y: number; durationSeconds: number; delaySeconds: number };

/** Roughly 0.5 to 1 pixel per second: slow enough to stay calm, fast enough
 *  that the panel reads as alive rather than as a static image. */
const DRIFT: Record<'blooms' | 'sweep' | 'counter', Drift> = {
  blooms: { x: 45, y: -36, durationSeconds: 44, delaySeconds: -33 },
  sweep: { x: 24, y: -20, durationSeconds: 30, delaySeconds: -18 },
  counter: { x: -18, y: 15, durationSeconds: 38, delaySeconds: -51 },
};

function driftProps({ x, y, durationSeconds, delaySeconds }: Drift) {
  return {
    className: 'animate-panel-drift motion-reduce:animate-none',
    style: {
      '--panel-drift-x': `${x}px`,
      '--panel-drift-y': `${y}px`,
      animationDuration: `${durationSeconds}s`,
      animationDelay: `${delaySeconds}s`,
    } as CSSProperties,
  };
}

export default function EmeraldRibbon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 z-0 h-full w-full ${className}`}
      viewBox="0 0 460 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="pga-ribbon-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A3B2C" />
          <stop offset="0.45" stopColor="#0E5240" />
          <stop offset="1" stopColor="#08291E" />
        </linearGradient>

        <radialGradient id="pga-ribbon-bloom-lower" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#45D6A2" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#1D9E75" stopOpacity="0.24" />
          <stop offset="1" stopColor="#1D9E75" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="pga-ribbon-bloom-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5FE4B2" stopOpacity="0.32" />
          <stop offset="1" stopColor="#5FE4B2" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="pga-ribbon-bloom-upper" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1FA97A" stopOpacity="0.26" />
          <stop offset="1" stopColor="#1FA97A" stopOpacity="0" />
        </radialGradient>

        {/* Each ribbon fades along its length, so no end or edge is ever cut off
            inside the panel. */}
        <linearGradient id="pga-ribbon-sheen-main" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.08" stopColor="#1D9E75" stopOpacity="0" />
          <stop offset="0.42" stopColor="#2FBD8B" stopOpacity="1" />
          <stop offset="0.78" stopColor="#46D49F" stopOpacity="0.85" />
          <stop offset="1" stopColor="#46D49F" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="pga-ribbon-sheen-counter" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0.06" stopColor="#2EBD8B" stopOpacity="0" />
          <stop offset="0.45" stopColor="#38CB96" stopOpacity="1" />
          <stop offset="1" stopColor="#1D9E75" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="pga-ribbon-sheen-deep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.05" stopColor="#04180F" stopOpacity="0" />
          <stop offset="0.5" stopColor="#04180F" stopOpacity="0.9" />
          <stop offset="1" stopColor="#04180F" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="pga-ribbon-sheen-thread" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.12" stopColor="#8BEDC7" stopOpacity="0" />
          <stop offset="0.55" stopColor="#8BEDC7" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8BEDC7" stopOpacity="0" />
        </linearGradient>

        {/* One path per ribbon. The stacked copies below thicken each band
            inwards, which is what gives the edges their soft falloff. */}
        <path
          id="pga-ribbon-band-main"
          d="M -80 495 C 150 460 330 365 520 270 L 520 405 C 330 505 150 585 -80 631 Z"
        />
        <path
          id="pga-ribbon-band-counter"
          d="M 520 -20 C 320 60 160 190 -80 260 L -80 392 C 160 312 320 202 520 108 Z"
        />
        <path
          id="pga-ribbon-band-deep"
          d="M -80 610 C 160 560 360 480 520 370 L 520 485 C 360 560 160 680 -80 746 Z"
        />
        <path
          id="pga-ribbon-band-thread"
          d="M -80 505 C 150 470 330 375 520 280 L 520 331 C 330 427 150 535 -80 579 Z"
        />
      </defs>

      <rect width="460" height="640" fill="url(#pga-ribbon-base)" />

      <g {...driftProps(DRIFT.blooms)}>
        <ellipse cx="120" cy="545" rx="300" ry="215" fill="url(#pga-ribbon-bloom-lower)" />
        <ellipse cx="140" cy="555" rx="185" ry="135" fill="url(#pga-ribbon-bloom-core)" />
        <ellipse cx="400" cy="95" rx="220" ry="155" fill="url(#pga-ribbon-bloom-upper)" />
      </g>

      <g {...driftProps(DRIFT.sweep)}>
        <g fill="url(#pga-ribbon-sheen-deep)">
          <use href="#pga-ribbon-band-deep" opacity="0.07" transform="translate(20 40) scale(1.14) translate(-20 -40)" />
          <use href="#pga-ribbon-band-deep" opacity="0.1" transform="translate(20 40) scale(1.05) translate(-20 -40)" />
          <use href="#pga-ribbon-band-deep" opacity="0.14" />
        </g>

        <g fill="url(#pga-ribbon-sheen-main)">
          <use href="#pga-ribbon-band-main" opacity="0.06" transform="translate(30 24) scale(1.16) translate(-30 -24)" />
          <use href="#pga-ribbon-band-main" opacity="0.1" transform="translate(30 24) scale(1.06) translate(-30 -24)" />
          <use href="#pga-ribbon-band-main" opacity="0.17" />
        </g>

        <g fill="url(#pga-ribbon-sheen-thread)">
          <use href="#pga-ribbon-band-thread" opacity="0.1" transform="translate(30 24) scale(1.1) translate(-30 -24)" />
          <use href="#pga-ribbon-band-thread" opacity="0.16" />
        </g>
      </g>

      <g {...driftProps(DRIFT.counter)}>
        <g fill="url(#pga-ribbon-sheen-counter)">
          <use href="#pga-ribbon-band-counter" opacity="0.04" transform="scale(1.14)" />
          <use href="#pga-ribbon-band-counter" opacity="0.06" transform="scale(1.05)" />
          <use href="#pga-ribbon-band-counter" opacity="0.09" />
        </g>
      </g>

      {/* vector-effect is not inherited, so each hairline carries it: the panel
          scales the canvas by anything from 0.6 to 1.4, and without this the
          lines would thicken on a tall panel and thin away on a short one. */}
      <g fill="none" stroke="#E1F5EE" strokeWidth="1">
        <ellipse cx="520" cy="470" rx="118" ry="104" transform="rotate(-9 520 470)" strokeOpacity="0.09" vectorEffect="non-scaling-stroke" />
        <ellipse cx="520" cy="470" rx="154" ry="136" transform="rotate(-8 520 470)" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
        <ellipse cx="520" cy="470" rx="190" ry="168" transform="rotate(-7 520 470)" strokeOpacity="0.07" vectorEffect="non-scaling-stroke" />
        <ellipse cx="520" cy="470" rx="226" ry="200" transform="rotate(-6 520 470)" strokeOpacity="0.058" vectorEffect="non-scaling-stroke" />
        <ellipse cx="520" cy="470" rx="262" ry="232" transform="rotate(-5 520 470)" strokeOpacity="0.046" vectorEffect="non-scaling-stroke" />
        <path d="M -80 432 C 90 404 250 356 470 300" strokeOpacity="0.055" vectorEffect="non-scaling-stroke" />
        <path d="M -80 404 C 95 378 255 332 470 274" strokeOpacity="0.042" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
