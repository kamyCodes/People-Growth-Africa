import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import precomputedData from '../data/precomputedLogoParts.json';

export interface LogoPart {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  radius: number; // relative dot radius
}

export interface LogoIntroAnimationProps {
  /** Source URL of flat logo image (PNG/SVG) */
  logoSrc: string;
  /** Optional precomputed part sampling list from build time */
  precomputedParts?: LogoPart[];
  /** Optional separate wordmark text to animate in Phase D */
  wordmarkText?: string;
  /** Target density: cell size factor. Lower = denser. */
  density?: number;
  /** Maximum rendering dots cap for Phase A performance (default 55 for 60fps) */
  maxPartsCap?: number;
  /** Callback when intro finishes */
  onComplete?: () => void;
  /** Custom overlay styling */
  className?: string;
  /** Force animation run even if sessionStorage exists */
  forceRun?: boolean;
}

function sampleLogoImage(
  logoUrl: string,
  density: number = 32,
  maxCap: number = 55
): Promise<{ parts: LogoPart[]; aspectRatio: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    img.onload = () => {
      const sampleWidth = 320;
      const aspectRatio = img.height / img.width;
      const sampleHeight = Math.round(sampleWidth * aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ parts: [], aspectRatio: 1 });
        return;
      }

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const pixels = imgData.data;

      let minX = sampleWidth,
        maxX = 0,
        minY = sampleHeight,
        maxY = 0;
      let hasPixels = false;

      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const idx = (y * sampleWidth + x) * 4;
          const alpha = pixels[idx + 3];
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const isDark = alpha > 20 && !(r > 245 && g > 245 && b > 245);

          if (isDark) {
            hasPixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasPixels) {
        minX = 0;
        maxX = sampleWidth;
        minY = 0;
        maxY = sampleHeight;
      }

      const bboxWidth = maxX - minX || sampleWidth;
      const bboxHeight = maxY - minY || sampleHeight;
      const stepG = Math.max(4, Math.floor(bboxWidth / density));
      const parts: LogoPart[] = [];
      const maxDotRadius = (stepG / bboxWidth) * 0.95;

      for (let gy = minY; gy < maxY; gy += stepG) {
        for (let gx = minX; gx < maxX; gx += stepG) {
          let sumCoverage = 0;
          let count = 0;
          let sumX = 0;
          let sumY = 0;

          for (let cy = gy; cy < Math.min(gy + stepG, maxY); cy++) {
            for (let cx = gx; cx < Math.min(gx + stepG, maxX); cx++) {
              const idx = (cy * sampleWidth + cx) * 4;
              const alpha = pixels[idx + 3] / 255;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const coverage = alpha > 0.1 ? (alpha < 0.9 ? alpha : 1 - lum * 0.8) : 0;

              if (coverage > 0.05) {
                sumCoverage += coverage;
                sumX += cx;
                sumY += cy;
                count++;
              }
            }
          }

          if (count > 0) {
            const avgCoverage = sumCoverage / (stepG * stepG);
            if (avgCoverage >= 0.08) {
              const centroidX = (sumX / count - minX) / bboxWidth;
              const centroidY = (sumY / count - minY) / bboxHeight;
              const radius = Math.max(0.005, maxDotRadius * Math.sqrt(avgCoverage));
              parts.push({ x: centroidX, y: centroidY, radius });
            }
          }
        }
      }

      let finalParts = parts;
      if (parts.length > maxCap) {
        const stride = parts.length / maxCap;
        finalParts = [];
        for (let i = 0; i < maxCap; i++) {
          finalParts.push(parts[Math.floor(i * stride)]);
        }
      }

      resolve({ parts: finalParts, aspectRatio: bboxHeight / bboxWidth });
    };
    img.onerror = () => resolve({ parts: [], aspectRatio: 1 });
  });
}

export function LogoIntroAnimation({
  logoSrc,
  precomputedParts,
  wordmarkText,
  density = 32,
  maxPartsCap = 55,
  onComplete,
  className = '',
  forceRun = false,
}: LogoIntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stippleGroupRef = useRef<SVGGElement>(null);
  const realLogoRef = useRef<HTMLImageElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeen = sessionStorage.getItem('pga_logo_animated') === 'true';
    return !prefersReducedMotion && (!hasSeen || forceRun);
  });

  const [parts, setParts] = useState<LogoPart[]>(() => {
    if (precomputedParts && precomputedParts.length > 0) return precomputedParts;
    if (precomputedData && Array.isArray(precomputedData) && precomputedData.length > 0) {
      return (precomputedData as LogoPart[]).slice(0, maxPartsCap);
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(() => parts.length > 0);

  useEffect(() => {
    if (!shouldAnimate) {
      if (onComplete) onComplete();
      return;
    }

    if (parts.length === 0) {
      sampleLogoImage(logoSrc, density, maxPartsCap).then((res) => {
        setParts(res.parts);
        setIsLoaded(true);
      });
    }
  }, [shouldAnimate, logoSrc, density, maxPartsCap, onComplete, parts.length]);

  useEffect(() => {
    if (!shouldAnimate || !isLoaded || parts.length === 0) return;

    const totalDuration = 2.6;
    const timeline = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('pga_logo_animated', 'true');
        if (onComplete) onComplete();
      },
    });

    const stippleNodes = stippleGroupRef.current?.querySelectorAll('circle') || [];

    // Hardware acceleration setup
    gsap.set(wrapperRef.current, {
      scale: 3.2,
      xPercent: 0,
      yPercent: 0,
      opacity: 1,
      force3D: true,
    });
    gsap.set(realLogoRef.current, { opacity: 0 });

    if (wordmarkRef.current) {
      gsap.set(wordmarkRef.current.children, {
        clipPath: 'inset(0% 100% 0% 0%)',
        filter: 'blur(3px)',
        opacity: 0,
      });
    }

    // Phase A: Scatter-in (0% to 24%, ~625ms)
    stippleNodes.forEach((circle, i) => {
      const part = parts[i];
      if (!part) return;

      const angle = Math.atan2(part.y - 0.5, part.x - 0.5) + (Math.random() - 0.5) * 0.3;
      const dist = (1.2 + Math.random() * 0.6) * 220;
      const startX = (part.x - 0.5) * 220 + Math.cos(angle) * dist;
      const startY = (part.y - 0.5) * 220 + Math.sin(angle) * dist;

      gsap.set(circle, {
        x: startX,
        y: startY,
        scale: 0.2,
        opacity: 0,
        transformOrigin: 'center center',
      });
    });

    stippleNodes.forEach((circle, i) => {
      const part = parts[i];
      if (!part) return;
      const targetX = (part.x - 0.5) * 220;
      const targetY = (part.y - 0.5) * 220;
      const randomDelay = Math.random() * 0.22;

      timeline.to(
        circle,
        {
          x: targetX,
          y: targetY,
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: 'back.out(1.3)',
        },
        randomDelay
      );
    });

    // Phase B: Gentle Group Breathe (24% to 46%)
    const phaseBTime = totalDuration * 0.24;
    if (stippleGroupRef.current) {
      timeline.to(
        stippleGroupRef.current,
        {
          scale: 1.03,
          duration: 0.28,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
          transformOrigin: 'center center',
        },
        phaseBTime
      );
    }

    // Phase C: Contract (46% to 58%)
    const phaseCTime = totalDuration * 0.46;
    const phaseCDuration = totalDuration * 0.12;

    timeline.to(
      wrapperRef.current,
      {
        scale: 1,
        duration: phaseCDuration,
        ease: 'power3.inOut',
      },
      phaseCTime
    );

    // Phase C.5: Fast crossfade to real crisp logo
    const crossfadeTime = phaseCTime + phaseCDuration * 0.75;
    timeline.to(
      stippleGroupRef.current,
      {
        opacity: 0,
        duration: 0.08,
        ease: 'linear',
      },
      crossfadeTime
    );

    timeline.to(
      realLogoRef.current,
      {
        opacity: 1,
        duration: 0.08,
        ease: 'linear',
      },
      crossfadeTime
    );

    // Phase D: Wordmark Reveal (50% to 92%)
    if (wordmarkRef.current && wordmarkRef.current.children.length > 0) {
      const phaseDTime = totalDuration * 0.48;
      const letters = Array.from(wordmarkRef.current.children);

      letters.forEach((letter, i) => {
        timeline.to(
          letter,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            filter: 'blur(0px)',
            opacity: 1,
            duration: 0.3,
            ease: 'expo.out',
          },
          phaseDTime + i * 0.025
        );
      });
    }

    // Phase E: Settle (92% to 100%)
    const phaseETime = totalDuration * 0.92;
    timeline.to(
      containerRef.current,
      {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      },
      phaseETime
    );

    return () => {
      timeline.kill();
    };
  }, [shouldAnimate, isLoaded, parts, onComplete]);

  // Non-animated fallback (e.g. after session refresh)
  if (!shouldAnimate) {
    return (
      <div className={`inline-flex items-center gap-1.5 md:gap-2 ${className}`}>
        <img src={logoSrc} alt="People Growth Africa" className="h-8 md:h-10 w-auto object-contain" />
        {wordmarkText && (
          <span className="font-[family-name:var(--font-heading)] font-bold text-base md:text-lg tracking-tight text-white">
            {wordmarkText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center p-1 ${className}`}
      style={{ overflow: 'visible' }}
    >
      <div ref={wrapperRef} className="relative flex items-center gap-1.5 md:gap-2">
        <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="-110 -110 220 220"
            style={{ width: '40px', height: '40px' }}
          >
            <g ref={stippleGroupRef}>
              {parts.map((part, idx) => (
                <circle
                  key={idx}
                  r={part.radius * 220}
                  fill="currentColor"
                  className="text-mint"
                />
              ))}
            </g>
          </svg>

          <img
            ref={realLogoRef}
            src={logoSrc}
            alt="People Growth Africa"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0"
          />
        </div>

        {wordmarkText && (
          <div
            ref={wordmarkRef}
            className="flex items-center font-[family-name:var(--font-heading)] font-bold text-base md:text-lg tracking-tight text-white"
          >
            {wordmarkText.split('').map((char, index) => (
              <span
                key={index}
                className="inline-block"
                style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LogoIntroAnimation;
