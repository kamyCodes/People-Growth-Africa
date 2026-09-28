import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

/** Canonical origin. The apex domain redirects here, so every URL we emit uses www. */
export const SITE_URL = 'https://www.peoplegrowthafrica.com';

const DEFAULT_IMAGE = '/images/og-image.jpg';
const DEFAULT_SITE_NAME = 'People Growth Africa';
const DEFAULT_DESCRIPTION =
  'Institutional People Systems & Enterprise HR Architecture for High-Growth African Ventures';
const MAX_TITLE_LENGTH = 60;

/** Keep titles within ~60 characters so search results show them whole. */
function buildTitle(title: string) {
  if (title.includes(DEFAULT_SITE_NAME)) return title;
  const branded = `${title} | ${DEFAULT_SITE_NAME}`;
  return branded.length <= MAX_TITLE_LENGTH ? branded : title;
}

export default function SEO({ title, description, image = DEFAULT_IMAGE, url, type = 'website' }: SEOProps) {
  useEffect(() => {
    document.title = buildTitle(title);

    // Helper to set or create meta tags by attribute
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const absoluteUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    };

    // Canonical and share URLs always resolve against the www origin and the
    // current route, so each page declares exactly one canonical URL no matter
    // which host, alias or trailing segment the visitor or crawler used.
    const canonicalUrl = absoluteUrl(url ?? window.location.pathname);
    const fullImageUrl = absoluteUrl(image);

    // Standard Meta
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // OpenGraph
    setMetaTag('property', 'og:title', document.title);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', fullImageUrl);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', document.title);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // JSON-LD Schema.org for AI & Search Crawlers (0ms impact, pure inline microdata)
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    if (type === 'article') {
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description || '',
        image: fullImageUrl,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: DEFAULT_SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/logo-black.png`,
          },
        },
      });
    } else {
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: DEFAULT_SITE_NAME,
        url: canonicalUrl,
        logo: `${SITE_URL}/images/logo-black.png`,
        description: description || DEFAULT_DESCRIPTION,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lagos',
          addressCountry: 'NG',
        },
        areaServed: 'Africa',
      });
    }
  }, [title, description, image, url, type]);

  return null;
}
