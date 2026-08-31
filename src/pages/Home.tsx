import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import AnimateOnScroll from '../components/AnimateOnScroll';
import SEO from '../components/SEO';
import BookingCalendar from '../components/BookingCalendar';
import EventCard from '../components/EventCard';
import EventRegistrationModal from '../components/EventRegistrationModal';
import { eventsList, type EventItem } from '../data/events';

/* ── Data ────────────────────────────────────────────────────────── */

const stats = [
  { number: '10–100', label: 'Employee range of businesses served' },
  { number: '15+', label: 'Specialised HR service areas' },
  { number: '2025', label: 'Year founded' },
  { number: 'Nigeria', label: 'Location' },
];

const vmCards = [
  {
    title: 'Vision',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    text: 'A Pan-African economy where every business, regardless of size, has access to world-class people practices, and where the growth of a business and the growth of its people are inseparable.',
  },
  {
    title: 'Mission',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: 'To help organisations across Africa build the people, systems and cultures that turn everyday work into meaningful growth for employees and businesses alike.',
  },
  {
    title: 'Target',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    text: 'Growth-stage businesses across Nigeria and Africa, agribusinesses, SMEs, and startups, typically 10 to 100 employees, ready to move from informal to intentional people practices.',
  },
];

const specialties = [
  { name: 'HR Advisory & Consulting', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
  { name: 'Learning & Development', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
  { name: 'Organisational Design', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { name: 'Culture Development', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
  { name: 'Performance Management', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  { name: 'HR Audits & Compliance', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { name: 'Agribusiness Workforce Development', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { name: 'Career Development Programmes', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg> },
  { name: 'Recruitment & Talent Management', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { name: 'HR Retainerships', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { name: 'People Strategy for SMEs', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
  { name: 'Workforce Formalisation', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { name: 'Nigerian Labour Law Compliance', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> },
  { name: 'Team Effectiveness', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { name: 'Leadership Development', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
];

const values = [
  { num: '01', title: 'Transparency', text: "We believe honest conversations build the strongest organisations. No hidden agendas, no jargon, just clear guidance you can act on." },
  { num: '02', title: 'Excellence', text: "Good enough isn't. We bring rigorous, evidence-based practices adapted to the African business context, not imported templates that don't fit." },
  { num: '03', title: 'Partnership', text: "We don't just deliver a report and leave. We walk alongside you, building internal capability so your people systems grow with your business." },
  { num: '04', title: 'Local Expertise', text: "Africa isn't a monolith. We bring deep understanding of the regulatory, cultural, and operational realities across the continent's diverse markets." },
];

const faqs = [
  { q: 'What does People Growth Africa do?', a: 'We are an HR and organisational consulting firm based in Apapa, Lagos, helping businesses across Nigeria and Africa build structured, effective people systems. From recruitment and performance management to organisational design, culture development, and Nigerian labour law compliance, we provide practical solutions tailored to the realities of operating on the continent.' },
  { q: 'Who do you work with?', a: 'We work with growth-stage businesses across Nigeria and Africa, agribusinesses, SMEs, and startups, typically 10 to 100 employees. These are companies that have outgrown informal people management but do not yet have the systems to match their ambition.' },
  { q: 'How does an engagement start?', a: "It starts with a free 30-minute consultation where we learn about your business, your team, and the people challenges you're facing. From there, we propose a tailored engagement, whether that's a focused diagnostic, a full HR transformation project, or ongoing advisory support." },
  { q: 'What industries do you serve?', a: 'We work across a wide range of industries including agribusiness, financial services, technology, logistics, education, healthcare, manufacturing, and professional services. Our approach is always adapted to the specific regulatory environment and workforce dynamics of your sector.' },
  { q: 'What makes you different from a generic HR consultant?', a: "Three things. First, we are exclusively focused on African businesses. Second, we don't just advise; we implement alongside you, training your managers and building internal capability. Third, we are here for the long term, staying until the growth takes root." },
  { q: 'Do you handle Nigerian labour law compliance and HR audits?', a: 'Yes. HR Audits & Compliance and Nigerian Labour Law Compliance are two of our core specialities. We help businesses audit their current people practices against Nigerian regulations, identify gaps, and build compliant systems.' },
];

/* ── Page ────────────────────────────────────────────────────────── */

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const VISIBLE_FAQS = 3;

  // Scroll-triggered fade-in for legacy elements
  useEffect(() => {
    const ids = ['services', 'about', 'events', 'testimonials', 'contact'];
    const handleAnchor = () => {
      const hash = window.location.hash.slice(1);
      if (ids.includes(hash)) {
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    handleAnchor();
    window.addEventListener('hashchange', handleAnchor);
    return () => window.removeEventListener('hashchange', handleAnchor);
  }, []);

  return (
    <>
      <SEO
        title="People Growth Africa | HR & People Consulting for African Business"
        description="People Growth Africa helps growth-stage businesses across Nigeria and Africa build the people systems, cultures, and practices that turn everyday work into meaningful growth."
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-deep-green overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1920&q=80&auto=format"
            alt="African professionals in a boardroom meeting discussing strategy"
            className="w-full h-full object-cover opacity-35"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-deep-green/92 via-deep-green/75 to-brand-green/60 z-[1]" />
        <div className="relative z-[2] max-w-[1200px] mx-auto px-6 pt-[150px] pb-[100px]">
          <AnimateOnScroll delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-mint text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              HR &bull; Organizational Architecture &bull; Pan-African Growth
            </div>
            <h1
              className="font-[family-name:var(--font-heading)] font-semibold text-white leading-[1.1] mb-6 max-w-[780px]"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 4.8rem)' }}
            >
              Build the People Systems<br />Behind <span className="text-mint">Every Growing Business.</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <p
              className="font-[family-name:var(--font-body)] text-white/80 max-w-[560px] leading-relaxed mb-10"
              style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)' }}
            >
              We are the partner that growing businesses call when they have outgrown informal people management but do not yet have the systems to match their ambition. Structured, practical HR built for the realities of the continent.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-9 py-4 bg-brand-green text-white font-[family-name:var(--font-body)] font-semibold rounded-full hover:bg-terracotta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(196,119,59,0.3)]"
              >
                Schedule Consultation →
              </a>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-9 py-4 bg-transparent text-white font-[family-name:var(--font-body)] font-semibold rounded-full border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Explore Webinars &amp; Mentorships
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="relative bg-mint py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8 text-center">
            {stats.map((s, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1} className="relative">
                <div
                  className="font-[family-name:var(--font-heading)] font-bold text-deep-green leading-none mb-2"
                  style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}
                >
                  {s.number.includes('+') ? (
                    <>{s.number.replace('+', '')}<span className="text-terracotta">+</span></>
                  ) : s.number}
                </div>
                <div className="font-[family-name:var(--font-body)] text-sm font-medium text-charcoal/60 max-w-[180px] mx-auto leading-relaxed">
                  {s.label}
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-[10%] h-[80%] w-px bg-deep-green/15" />
                )}
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision / Mission / Target ─────────────────── */}
      <section className="relative py-[100px] overflow-hidden" id="about">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll className="text-center mb-[60px]">
            <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">Who We Are</p>
            <h2
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Purpose-Driven. People-Focused.<br />Built for Africa.
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 max-w-[600px] mx-auto leading-relaxed">
              We are here for the long term, staying until the growth takes root. Everything we do is anchored in a clear vision, a bold mission, and a defined target.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {vmCards.map((card, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <div className="bg-white rounded-[20px] p-11 shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 border border-charcoal/5">
                  <div className="w-14 h-14 rounded-full bg-mint flex items-center justify-center mb-6">{card.icon}</div>
                  <h3 className="font-[family-name:var(--font-heading)] text-[1.4rem] font-semibold text-charcoal mb-3.5">{card.title}</h3>
                  <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-charcoal/65 leading-relaxed">{card.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services / Specialties ─────────────────────── */}
      <section className="relative py-[100px] bg-mint overflow-hidden" id="services">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll className="text-center mb-12">
            <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">What We Do</p>
            <h2
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              15 Specialised HR<br />Service Areas
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 max-w-[600px] mx-auto leading-relaxed">
              From strategy to implementation, we cover every dimension of people management that growing African businesses need.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {specialties.map((sp, i) => (
              <AnimateOnScroll key={i} delay={Math.min(i * 0.04, 0.4)}>
                <div className="bg-white rounded-[14px] p-5 text-center shadow-card hover:-translate-y-[3px] hover:shadow-card-hover transition-all duration-300 border border-charcoal/5">
                  <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center mx-auto mb-3">{sp.icon}</div>
                  <h4 className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold text-charcoal leading-snug">{sp.name}</h4>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events & Mentorship Sessions ──────── */}
      <section className="relative py-[100px] bg-white overflow-hidden" id="events">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <AnimateOnScroll>
              <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">
                Events &amp; Programs
              </p>
              <h2
                className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                Upcoming Webinars &amp;<br />Mentorship Cohorts
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.1}>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-charcoal font-[family-name:var(--font-body)] text-xs md:text-sm font-semibold rounded-full hover:bg-deep-green hover:text-white transition-all duration-300 border border-charcoal/10"
              >
                View Full Events Schedule →
              </Link>
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {eventsList.slice(0, 3).map((event) => (
              <AnimateOnScroll key={event.id}>
                <EventCard
                  event={event}
                  featured={event.featured}
                  onRegister={(ev) => setSelectedEvent(ev)}
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="relative py-[100px] bg-cream/60 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <AnimateOnScroll className="md:sticky md:top-[120px]">
              <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">Our Values</p>
              <h2
                className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                What Guides<br />Every Decision
              </h2>
              <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 leading-relaxed">
                These aren&apos;t words on a wall. They&apos;re the principles that shape every recommendation, every workshop, and every conversation we have with our clients.
              </p>
            </AnimateOnScroll>

            <div className="flex flex-col gap-4">
              {values.map((v, i) => (
                <AnimateOnScroll key={i} delay={i * 0.08} direction="right">
                  <div className="flex items-start gap-5 bg-white rounded-[14px] p-7 shadow-card hover:translate-x-1 hover:shadow-card-hover transition-all duration-300 border border-charcoal/5">
                    <span className="font-[family-name:var(--font-heading)] text-[1.5rem] font-bold text-terracotta leading-none min-w-[36px] pt-0.5">{v.num}</span>
                    <div>
                      <h4 className="font-[family-name:var(--font-heading)] text-[1.15rem] font-semibold text-charcoal mb-1.5">{v.title}</h4>
                      <p className="font-[family-name:var(--font-body)] text-[0.9rem] text-charcoal/60 leading-relaxed">{v.text}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="relative py-[100px] bg-white overflow-hidden" id="testimonials">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll className="text-center mb-12">
            <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">Client Stories</p>
            <h2
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Trusted by Growing<br />African Businesses
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 max-w-[600px] mx-auto leading-relaxed">
              Hear from the leaders who&apos;ve transformed their people practices with our support.
            </p>
          </AnimateOnScroll>

          {/* Premium quote box replacing emoji */}
          <div className="text-center py-16 px-8 max-w-xl mx-auto bg-cream/30 rounded-[24px] border border-charcoal/10">
            <div className="w-12 h-12 rounded-full bg-mint text-deep-green flex items-center justify-center mx-auto mb-4 border border-brand-green/30">
              <svg className="w-6 h-6 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 0 4-1.5 6-3 6" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 0 4-1.5 6-3 6" />
              </svg>
            </div>
            <p
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal mb-3"
              style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)' }}
            >
              We are waiting for your success story
            </p>
            <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-charcoal/60 leading-relaxed mb-6">
              Partner with us and let your organizational transformation become the next benchmark of African enterprise excellence.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-deep-green text-white text-xs font-semibold rounded-full hover:bg-brand-green transition-all"
            >
              Start Your Transformation
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="relative py-[100px] bg-mint overflow-hidden" id="faqs">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll className="text-center mb-12">
            <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">Your Questions, Answered</p>
            <h2
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Frequently Asked Questions
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 max-w-[600px] mx-auto leading-relaxed">
              Everything you need to know about working with People Growth Africa.
            </p>
          </AnimateOnScroll>

          <div className="max-w-[800px] mx-auto flex flex-col gap-3">
            {faqs.slice(0, showAllFaqs ? faqs.length : VISIBLE_FAQS).map((faq, i) => (
              <AnimateOnScroll key={i} delay={i * 0.05}>
                <div className={`bg-white rounded-[14px] overflow-hidden transition-shadow duration-300 ${faqOpen === i ? 'shadow-card-hover' : 'shadow-card'}`}>
                  <button
                    className="flex items-center justify-between w-full px-7 py-[22px] bg-transparent border-none cursor-pointer text-left font-[family-name:var(--font-body)] text-base font-semibold text-charcoal gap-4 hover:text-deep-green transition-colors"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    aria-expanded={faqOpen === i}
                  >
                    {faq.q}
                    <span className={`w-8 h-8 min-w-8 rounded-full flex items-center justify-center transition-all duration-300 ${faqOpen === i ? 'bg-brand-green rotate-45' : 'bg-mint'}`}>
                      <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-none stroke-2.5 stroke-linecap-round ${faqOpen === i ? 'stroke-white' : 'stroke-brand-green'}`}>
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-400 ${faqOpen === i ? 'max-h-[400px]' : 'max-h-0'}`}>
                    <p className="px-7 pb-6 font-[family-name:var(--font-body)] text-[0.95rem] text-charcoal/65 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
            {faqs.length > VISIBLE_FAQS && (
              <AnimateOnScroll delay={VISIBLE_FAQS * 0.05}>
                <button
                  onClick={() => setShowAllFaqs(!showAllFaqs)}
                  className="mx-auto flex items-center gap-2 mt-4 px-6 py-3 bg-transparent border-2 border-deep-green/20 text-deep-green font-[family-name:var(--font-body)] text-[0.9rem] font-semibold rounded-full cursor-pointer hover:border-deep-green hover:bg-deep-green hover:text-white transition-all duration-300"
                >
                  {showAllFaqs ? 'Show fewer questions' : `More questions (${faqs.length - VISIBLE_FAQS})`}
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-none stroke-2 stroke-linecap-round transition-transform duration-300 ${showAllFaqs ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </AnimateOnScroll>
            )}
          </div>
        </div>
      </section>

      {/* ── Interactive Booking Calendar & Contact Section ─ */}
      <section className="relative bg-cream/70 py-[100px] overflow-hidden" id="contact">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimateOnScroll className="text-center mb-12">
            <p className="font-[family-name:var(--font-body)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">
              Direct Engagement &bull; No Obligation
            </p>
            <h2
              className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.15] mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Ready to Build Your People Engine?
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[1.05rem] text-charcoal/65 max-w-[600px] mx-auto leading-relaxed">
              Select an available appointment on our calendar or drop us a note. First consultation is always free.
            </p>
          </AnimateOnScroll>

          {/* Interactive Booking Calendar Component */}
          <AnimateOnScroll delay={0.1}>
            <BookingCalendar />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Registration Modal for Featured Events */}
      <EventRegistrationModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
