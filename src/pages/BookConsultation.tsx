import SEO from '../components/SEO';
import BookingCalendar from '../components/BookingCalendar';
import AnimateOnScroll from '../components/AnimateOnScroll';

export default function BookConsultation() {
  return (
    <>
      <SEO
        title="Schedule an Executive Consultation | People Growth Africa"
        description="Book a complimentary 30-minute people systems diagnostic session with People Growth Africa. Operating Mon-Fri 8am-6pm, Sat 11am-4pm WAT."
      />

      {/* Hero Header */}
      <section className="bg-deep-green text-white pt-[140px] pb-[80px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <AnimateOnScroll>
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold uppercase tracking-wider mb-3">
              Complimentary 30-Minute Diagnostic Session
            </span>
            <h1
              className="font-[family-name:var(--font-heading)] font-semibold text-white leading-[1.15] mb-4 max-w-3xl mx-auto"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)' }}
            >
              Schedule Your People Systems Consultation
            </h1>
            <p className="font-[family-name:var(--font-body)] text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Select an available consultation slot on our live calendar. Our advisory partners will review your organizational requirements and provide immediate strategic clarity.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Main Booking Interface Section */}
      <section className="py-[70px] bg-cream/40 min-h-[700px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll delay={0.1}>
            <BookingCalendar />
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
