import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsultation } from '../hooks/useConsultation';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../lib/authClient';
import HoverPill from './HoverPill';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { openConsultation } = useConsultation();
  const { status: authStatus, user } = useAuth();

  const isHome = location.pathname === '/';
  const signedIn = authStatus === 'signedIn' && Boolean(user);
  // Desktop shows the label as a tooltip and an accessible name rather than as
  // text, so the wording stays descriptive for screen readers and search
  // snippets without taking up nav width.
  const accountLink = signedIn && user
    ? { to: dashboardPath(user.role), label: 'Your dashboard' }
    : { to: '/auth#signup', label: 'Sign up or log in' };

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

  /**
   * A menu that only its own toggle can dismiss traps anyone who opened it by
   * accident. While it is open, a tap anywhere outside it, the Escape key, or
   * moving to another page closes it. The toggle is excluded from "outside"
   * because its own click already closes the menu, and letting both fire would
   * close and immediately reopen it.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMobileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);


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
          className="flex items-center group py-1 shrink-0"
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

        {/* Desktop Nav. The gaps step up with the viewport so the logo, the
            seven links and the call to action all fit from 768px upward. */}
        <div className="hidden md:flex items-center gap-4 lg:gap-5 xl:gap-7">
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
          {/* The account entry is an icon on desktop: the words "Sign up / Log
              in" were the widest thing in the row and pushed the nav links into
              the logo on mid-size screens. The pill carries the words instead of
              the browser's own tooltip, and the mobile menu keeps them as text. */}
          <Link
            to={accountLink.to}
            aria-label={accountLink.label}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/90 transition-colors hover:border-white hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-deep-green"
          >
            <svg
              className="h-5 w-5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {signedIn && (
              <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-deep-green" />
            )}
            <HoverPill label={accountLink.label} align="right" />
          </Link>
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
          ref={toggleRef}
          className="md:hidden bg-transparent border-none cursor-pointer p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
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
            ref={menuRef}
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-deep-green border-t border-white/10 overflow-hidden shadow-2xl"
          >
            {/* The toggle above turns into an X, but it sits at the edge of the
                screen and is easy to miss. This is the close button that can
                be seen and hit without aiming. */}
            <div className="flex items-center justify-between px-6 pt-4 pb-1">
              <span className="font-[family-name:var(--font-body)] text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mint">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors motion-reduce:transition-none hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-deep-green"
              >
                <svg
                  className="h-4 w-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
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
              <Link
                to={accountLink.to}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium font-[family-name:var(--font-body)] py-1 text-white/85"
              >
                {signedIn ? 'Dashboard' : 'Sign up / Log in'}
              </Link>
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
