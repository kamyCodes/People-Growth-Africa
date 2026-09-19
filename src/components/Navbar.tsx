import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsultation } from '../hooks/useConsultation';
import LogoIntroAnimation from './LogoIntroAnimation';

const baseNavLinks = [
  { to: '/#services', label: 'Services' },
  { to: '/#about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Blog' },
  { to: '/#testimonials', label: 'Testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openConsultation } = useConsultation();

  const isHome = location.pathname === '/';

  // Include "Home" link when user is on any other page
  const currentNavLinks = [
    ...(!isHome ? [{ to: '/', label: 'Home' }] : []),
    ...baseNavLinks,
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    if (to === '/') {
      if (location.pathname !== '/') {
        navigate('/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (to.startsWith('/#')) {
      const id = to.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-deep-green/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-gradient-to-b from-charcoal/60 via-charcoal/20 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Moderate, Balanced Logo */}
        <Link
          to="/"
          className="flex items-center group py-1"
          aria-label="People Growth Africa Home"
          onClick={() => {
            setMobileOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <LogoIntroAnimation
            logoSrc="/images/icon-white.png"
            wordmarkText="People Growth Africa"
            className="h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {currentNavLinks.map((link) =>
            link.to.startsWith('/#') ? (
              <button
                key={link.to}
                onClick={() => handleNavClick(link.to)}
                className="font-[family-name:var(--font-body)] text-[0.95rem] font-medium text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ) : link.to === '/' ? (
              <Link
                key={link.to}
                to="/"
                onClick={() => handleNavClick('/')}
                className="font-[family-name:var(--font-body)] text-[0.95rem] font-medium text-white/90 hover:text-white transition-colors relative py-1"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`font-[family-name:var(--font-body)] text-[0.95rem] font-medium transition-colors relative py-1 ${
                  location.pathname === link.to
                    ? 'text-white font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
                )}
              </Link>
            ),
          )}
          <button
            type="button"
            onClick={() => openConsultation()}
            className="inline-flex items-center px-6 py-2.5 bg-brand-green text-white font-[family-name:var(--font-body)] text-sm font-semibold rounded-full hover:bg-terracotta transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer shadow-sm"
          >
            Talk to Us
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span
            className="block w-6 h-0.5 bg-white my-1.5 transition-all"
            style={{
              transform: mobileOpen
                ? 'rotate(45deg) translate(4px, 4px)'
                : 'none',
            }}
          />
          <span
            className="block w-6 h-0.5 bg-white my-1.5 transition-all"
            style={{ opacity: mobileOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 bg-white my-1.5 transition-all"
            style={{
              transform: mobileOpen
                ? 'rotate(-45deg) translate(4px, -4px)'
                : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-deep-green border-t border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {currentNavLinks.map((link) =>
                link.to.startsWith('/#') ? (
                  <button
                    key={link.to}
                    onClick={() => handleNavClick(link.to)}
                    className="text-white text-left text-lg font-medium font-[family-name:var(--font-body)] bg-transparent border-none cursor-pointer py-1"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      setMobileOpen(false);
                      if (link.to === '/') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`text-lg font-medium font-[family-name:var(--font-body)] py-1 ${
                      location.pathname === link.to ? 'text-mint font-semibold' : 'text-white/85'
                    }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openConsultation();
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-green text-white font-semibold rounded-full text-base mt-2 cursor-pointer shadow-md"
              >
                Schedule Consultation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
