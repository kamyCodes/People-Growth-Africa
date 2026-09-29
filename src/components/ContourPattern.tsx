import type { CSSProperties, ReactNode } from 'react';
import EmeraldRibbon from './EmeraldRibbon';

/**
 * The drifting contour lines behind the account panels: the auth column, the
 * dashboard heading and the two email flow pages.
 *
 * The pattern is pure inline SVG, so no page that uses it needs an external
 * image. It is decorative everywhere it appears, so it stays hidden from
 * assistive technology, and it holds still for anyone who asked for less
 * motion (see --animate-contour-drift in src/index.css).
 */

type Cluster = {
  cx: number;
  cy: number;
  strokeClass: string;
  opacity: number;
  rings: number[];
  rotateStep: number;
  /* A drift of a few user units, the seconds one pass of it takes, and where
     in that pass the cluster starts. Slow and short on purpose: it should
     register as a living page, not as something moving. */
  drift: [x: number, y: number];
  durationSeconds: number;
  delaySeconds: number;
};

/**
 * portrait suits a tall panel (the auth column), band a wide one (a page or
 * dashboard heading). Two canvases rather than one because the svg crops to
 * fill, so a cluster placed for a 460x640 column would fall outside a band.
 */
type Variant = 'portrait' | 'band';

const RING_PATH =
  'M 0 -100 C 62 -92 98 -48 96 6 C 94 58 74 84 24 98 C -26 111 -88 70 -96 12 C -103 -44 -54 -107 0 -100 Z';

const VARIANTS: Record<Variant, { viewBox: string; clusters: Cluster[] }> = {
  portrait: {
    viewBox: '0 0 460 640',
    clusters: [
      {
        cx: 424,
        cy: 60,
        strokeClass: 'stroke-brand-green',
        opacity: 0.5,
        rings: [2.8, 2.28, 1.82, 1.42, 1.06, 0.76, 0.5, 0.28],
        rotateStep: 9,
        drift: [7, -6],
        durationSeconds: 84,
        delaySeconds: -18,
      },
      {
        cx: 36,
        cy: 566,
        strokeClass: 'stroke-mint',
        opacity: 0.22,
        rings: [2.2, 1.72, 1.3, 0.95, 0.64, 0.38],
        rotateStep: -7,
        drift: [-6, 6],
        durationSeconds: 96,
        delaySeconds: -51,
      },
      {
        cx: -34,
        cy: 238,
        strokeClass: 'stroke-brand-green',
        opacity: 0.34,
        rings: [1.6, 1.16, 0.78, 0.45],
        rotateStep: 11,
        drift: [5, 5],
        durationSeconds: 68,
        delaySeconds: -7,
      },
      {
        cx: 474,
        cy: 432,
        strokeClass: 'stroke-mint',
        opacity: 0.26,
        rings: [1.5, 1.06, 0.68, 0.36],
        rotateStep: -13,
        drift: [-4, -5],
        durationSeconds: 108,
        delaySeconds: -66,
      },
    ],
  },
  band: {
    viewBox: '0 0 900 320',
    clusters: [
      {
        cx: 132,
        cy: 54,
        strokeClass: 'stroke-brand-green',
        opacity: 0.5,
        rings: [2.5, 2.05, 1.65, 1.3, 0.98, 0.68, 0.4],
        rotateStep: 9,
        drift: [7, -5],
        durationSeconds: 84,
        delaySeconds: -18,
      },
      {
        cx: 452,
        cy: 268,
        strokeClass: 'stroke-mint',
        opacity: 0.22,
        rings: [2.1, 1.68, 1.28, 0.92, 0.58],
        rotateStep: -7,
        drift: [-6, 5],
        durationSeconds: 96,
        delaySeconds: -51,
      },
      {
        cx: 792,
        cy: 76,
        strokeClass: 'stroke-mint',
        opacity: 0.26,
        rings: [2.3, 1.85, 1.45, 1.08, 0.74, 0.44],
        rotateStep: 11,
        drift: [-5, -6],
        durationSeconds: 108,
        delaySeconds: -66,
      },
      {
        cx: -24,
        cy: 216,
        strokeClass: 'stroke-brand-green',
        opacity: 0.34,
        rings: [1.7, 1.24, 0.84, 0.48],
        rotateStep: -13,
        drift: [5, 5],
        durationSeconds: 68,
        delaySeconds: -7,
      },
    ],
  },
};

export default function ContourPattern({
  variant = 'band',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const { viewBox, clusters } = VARIANTS[variant];

  return (
    <svg
      className={`absolute inset-0 z-0 h-full w-full ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* One wobbly closed ring; every contour is a copy of this path. The id
            is per variant, which is unique because a page renders one panel. */}
        <path
          id={`pga-contour-${variant}`}
          d={RING_PATH}
          vectorEffect="non-scaling-stroke"
        />
      </defs>
      {clusters.map((cluster, clusterIndex) => (
        /* The outer group carries the drift and the inner one the transform
           that places the rings, so the CSS transform never flattens a cluster
           onto the origin. motion-reduce hands back the still pattern. */
        <g
          key={clusterIndex}
          className="animate-panel-drift motion-reduce:animate-none"
          style={
            {
              '--panel-drift-x': `${cluster.drift[0]}px`,
              '--panel-drift-y': `${cluster.drift[1]}px`,
              animationDuration: `${cluster.durationSeconds}s`,
              animationDelay: `${cluster.delaySeconds}s`,
            } as CSSProperties
          }
        >
          <g
            className={`fill-none ${cluster.strokeClass}`}
            strokeOpacity={cluster.opacity}
            strokeWidth={1.25}
            strokeLinecap="round"
          >
            {cluster.rings.map((scale, ringIndex) => (
              <use
                key={ringIndex}
                href={`#pga-contour-${variant}`}
                transform={`translate(${cluster.cx} ${cluster.cy}) rotate(${cluster.rotateStep * ringIndex}) scale(${scale})`}
              />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

/**
 * A deep green panel with artwork behind its content, so every account surface
 * carries the same texture. Content sits above the artwork and the wash that
 * keeps text contrast.
 *
 * `art` picks the piece: the ribbon artwork is composed for the tall column on
 * the account page, the contour pattern for wide headings. They need different
 * washes because they carry their own light in different places, and the wash
 * exists to hold the copy's contrast, which is what was measured.
 */
export function ContourPanel({
  children,
  variant = 'band',
  art = 'contours',
  className = '',
}: {
  children: ReactNode;
  variant?: Variant;
  art?: 'contours' | 'ribbons';
  className?: string;
}) {
  const wash =
    art === 'ribbons'
      ? 'from-deep-green/45 via-deep-green/10 to-transparent'
      : 'from-deep-green/55 via-deep-green/25 to-brand-green/45';

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-deep-green text-white ${className}`}
    >
      {art === 'ribbons' ? <EmeraldRibbon /> : <ContourPattern variant={variant} />}
      <div
        className={`absolute inset-0 z-[1] bg-gradient-to-br ${wash}`}
        aria-hidden="true"
      />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
