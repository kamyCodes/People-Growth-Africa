import type { ReactNode } from 'react';
import SEO from './SEO';

/**
 * Shared shell for the policy pages linked from the signup form, so /terms and
 * /privacy stay consistent with each other and with the rest of the site.
 */
export default function LegalPage({
  title,
  description,
  url,
  updated,
  intro,
  children,
}: {
  title: string;
  description: string;
  url: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <SEO title={title} description={description} url={url} />

      <section className="bg-cream min-h-screen relative">
        <div className="absolute inset-x-0 top-0 h-[100px] bg-deep-green" aria-hidden="true" />
        <div className="relative max-w-[820px] mx-auto px-5 md:px-6 pt-[130px] pb-[90px]">
          <p className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em] text-brand-green mb-3">
            {title}
          </p>
          <h1
            className="font-[family-name:var(--font-heading)] font-semibold text-charcoal leading-[1.2] mb-3"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}
          >
            {title}
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm text-charcoal/60 mb-6">
            Last updated {updated}
          </p>
          <p className="font-[family-name:var(--font-body)] text-base text-charcoal/75 leading-relaxed max-w-[68ch] mb-10">
            {intro}
          </p>

          <div
            className="space-y-8 font-[family-name:var(--font-body)] text-base text-charcoal/80 leading-relaxed [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-charcoal [&_h2]:mb-3 [&_h2]:mt-0 [&_p]:mb-3 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-deep-green [&_a]:underline"
          >
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
