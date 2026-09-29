import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import type { EventItem } from '../data/events';

interface EventsCarouselProps {
  events: EventItem[];
  onRegister: (event: EventItem) => void;
}

/** Mirrors the track's `gap-6`, so the slide stride includes the gutter. */
const GAP_PX = 24;
/** How long each card is held before the deck advances on its own. */
const AUTOPLAY_MS = 4500;

export default function EventsCarousel({ events, onRegister }: EventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // One card at a time is presented as a stacked deck whose cards flip over one
  // another. A sliding track can only line up when the card width is known, and
  // at phone widths the old percentage maths drifted so the wrong card showed.
  const isDeck = cardsPerView === 1;

  // Update cards per view based on viewport width
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // The multi-card track is shifted in real pixels. Measuring the track removes
  // the guesswork of expressing the 24px gap as a percentage of the container.
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const measure = () => setWrapperWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const maxIndex = Math.max(0, events.length - cardsPerView);
  // A resize can leave the stored index past the end of a shortened track, so
  // the value that is actually rendered is clamped instead of being written
  // back to state (which would cost an extra render).
  const activeIndex = Math.min(currentIndex, maxIndex);
  const cardWidth = wrapperWidth > 0 ? (wrapperWidth - (cardsPerView - 1) * GAP_PX) / cardsPerView : 0;
  const stride = cardWidth + GAP_PX;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // The deck advances on its own and wraps around, so it keeps cycling instead
  // of parking on the last card. Hovering or focusing holds it still.
  useEffect(() => {
    if (!isDeck || isPaused || events.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [isDeck, isPaused, events.length]);

  return (
    <div
      className="relative"
      ref={wrapperRef}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Carousel Navigation Header Controls */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-green">
            {isDeck
              ? `Showing ${activeIndex + 1} of ${events.length} Programs`
              : `Showing ${activeIndex + 1}\u2013${Math.min(
                  activeIndex + cardsPerView,
                  events.length,
                )} of ${events.length} Programs`}
          </span>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous events slide"
            className="w-10 h-10 rounded-full border border-charcoal/20 bg-white hover:bg-mint hover:border-brand-green/50 flex items-center justify-center text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex >= maxIndex}
            aria-label="Next events slide"
            className="w-10 h-10 rounded-full border border-charcoal/20 bg-white hover:bg-mint hover:border-brand-green/50 flex items-center justify-center text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {isDeck ? (
        /* Every card shares one grid cell, so they flip over one another while
           the section keeps the height of the tallest card instead of
           collapsing or jumping between slides. */
        <div className="grid" style={{ perspective: '1200px' }}>
          {events.map((event, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.div
                key={event.id}
                className="col-start-1 row-start-1"
                inert={!isActive}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  rotateY: isActive ? 0 : index < activeIndex ? -35 : 35,
                  scale: isActive ? 1 : 0.94,
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: isActive ? 'auto' : 'none',
                  zIndex: isActive ? 2 : 1,
                }}
              >
                <EventCard event={event} featured={event.featured} onRegister={onRegister} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Tablet and desktop keep the original multi-card track, now shifted by
           a measured pixel stride so the cards stay aligned. */
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: -activeIndex * stride }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            {events.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0"
                style={{
                  width: `calc(${100 / cardsPerView}% - ${
                    (GAP_PX * (cardsPerView - 1)) / cardsPerView
                  }px)`,
                }}
              >
                <div className="h-full">
                  <EventCard
                    event={event}
                    featured={event.featured}
                    onRegister={onRegister}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Carousel Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              activeIndex === i
                ? 'w-8 bg-brand-green'
                : 'w-2 bg-charcoal/20 hover:bg-charcoal/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
