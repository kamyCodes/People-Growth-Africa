import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-charcoal pt-16 pb-8 text-white/70">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <Link to="/" className="inline-block mb-4">
              <img
                src="/images/logo-white.png"
                alt="People Growth Africa"
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="font-[family-name:var(--font-heading)] text-lg font-medium text-white mb-3">
              People first. Growth always.
            </p>
            <p className="text-sm leading-relaxed max-w-[300px]">
              The partner that growing businesses call when they have outgrown informal people management. Based in Apapa, Lagos, serving businesses across Nigeria and Africa.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5 font-[family-name:var(--font-body)]">Services</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/#services" onClick={(e) => handleAnchorClick(e, '/#services')} className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">HR Strategy</a></li>
              <li><a href="/#services" onClick={(e) => handleAnchorClick(e, '/#services')} className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Organisational Design</a></li>
              <li><a href="/#services" onClick={(e) => handleAnchorClick(e, '/#services')} className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Talent Management</a></li>
              <li><a href="/#services" onClick={(e) => handleAnchorClick(e, '/#services')} className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Compliance &amp; Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5 font-[family-name:var(--font-body)]">Programs &amp; Insights</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/events" className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Events &amp; Webinars</Link></li>
              <li><Link to="/events" className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Mentorship Cohorts</Link></li>
              <li><Link to="/blog" className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">Knowledge Base / Blog</Link></li>
              <li><a href="/#about" onClick={(e) => handleAnchorClick(e, '/#about')} className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">About PGA</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-5 font-[family-name:var(--font-body)]">Contact &amp; Hours</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="mailto:hello@peoplegrowthafrica.com" className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">
                  hello@peoplegrowthafrica.com
                </a>
              </li>
              <li>
                <a href="tel:+2349167114560" className="text-[0.9rem] text-white/60 hover:text-brand-green transition-colors">
                  +234 916 711 4560
                </a>
              </li>
              <li>
                <span className="text-[0.85rem] text-white/50 block">
                  Mon &ndash; Fri: 8:00 AM &ndash; 6:00 PM WAT
                </span>
                <span className="text-[0.85rem] text-white/50 block">
                  Sat: 11:00 AM &ndash; 4:00 PM WAT
                </span>
              </li>
              <li>
                <span className="text-[0.9rem] text-white/60">Apapa, Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">&copy; {currentYear} People Growth Africa. All rights reserved.</p>
          <div className="flex gap-3">
            <a href="https://www.linkedin.com/company/people-growth-africa/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-brand-green transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-brand-green transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-brand-green transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
