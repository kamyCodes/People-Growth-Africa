import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/#services', label: 'Services' },
  { to: '/#about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/#testimonials', label: 'Testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleNavClick = (to: string) => {
    setMobileOpen(false);
    if (to.startsWith('/#')) {
      if (location.pathname !== '/') {
        window.location.href = to;
      } else {
        const id = to.slice(2);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-deep-green shadow-lg py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center h-20" aria-label="People Growth Africa Home">
          <img src="/images/logo-white.png" alt="People Growth Africa" className="h-full w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.to.startsWith('/#') ? (
              <button
                key={link.to}
                onClick={() => handleNavClick(link.to)}
                className="font-[family-name:var(--font-body)] text-[0.95rem] font-medium text-white/85 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`font-[family-name:var(--font-body)] text-[0.95rem] font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-white'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="block h-0.5 bg-terracotta rounded-full mt-1" />
                )}
              </Link>
            ),
          )}
          <Link
            to="/#contact"
            onClick={() => handleNavClick('/#contact')}
            className="inline-flex items-center px-6 py-2.5 bg-brand-green text-white font-[family-name:var(--font-body)] text-sm font-semibold rounded-full hover:bg-terracotta transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
          >
            Talk to Us
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="block w-6 h-0.5 bg-white my-1.5 transition-all" style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span className="block w-6 h-0.5 bg-white my-1.5 transition-all" style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span className="block w-6 h-0.5 bg-white my-1.5 transition-all" style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-deep-green overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.to.startsWith('/#') ? (
                  <button
                    key={link.to}
                    onClick={() => handleNavClick(link.to)}
                    className="text-white text-left text-lg font-medium font-[family-name:var(--font-body)] bg-transparent border-none cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-lg font-medium font-[family-name:var(--font-body)] ${
                      location.pathname === link.to ? 'text-white' : 'text-white/85'
                    }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Link
                to="/#contact"
                onClick={() => handleNavClick('/#contact')}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-green text-white font-semibold rounded-full text-base mt-2"
              >
                Talk to Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
