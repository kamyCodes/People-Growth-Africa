import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import type { EventItem } from '../data/events';

interface EventsCarouselProps {
  events: EventItem[];
  onRegister: (event: EventItem) => void;
}

export default function EventsCarousel({ events, onRegister }: EventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardsPerView, setCardsPerView] = useState(3);

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

  const maxIndex = Math.max(0, events.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="relative">
      {/* Carousel Navigation Header Controls */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-green">
            Showing {currentIndex + 1}&ndash;{Math.min(currentIndex + cardsPerView, events.length)} of {events.length} Programs
          </span>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
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
            disabled={currentIndex >= maxIndex}
            aria-label="Next events slide"
            className="w-10 h-10 rounded-full border border-charcoal/20 bg-white hover:bg-mint hover:border-brand-green/50 flex items-center justify-center text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overflow Container for Carousel Track */}
      <div className="overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-6"
          animate={{
            x: `-${currentIndex * (100 / cardsPerView + (cardsPerView > 1 ? 24 / cardsPerView : 0))}%`,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="flex-shrink-0"
              style={{
                width:
                  cardsPerView === 1
                    ? '100%'
                    : cardsPerView === 2
                    ? 'calc(50% - 12px)'
                    : 'calc(33.333% - 16px)',
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

      {/* Carousel Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === i
                ? 'w-8 bg-brand-green'
                : 'w-2 bg-charcoal/20 hover:bg-charcoal/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
