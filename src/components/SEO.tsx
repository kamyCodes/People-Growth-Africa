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

/** Stable @id of the single Organization entity declared in index.html. */
export const ORG_ID = `${SITE_URL}/#organization`;

const DEFAULT_IMAGE = '/images/og-image.jpg';
const DEFAULT_SITE_NAME = 'People Growth Africa';
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
    // Strip a trailing slash before building the canonical/share URL. Both `/blog`
    // and `/blog/` are served (there is no host-level redirect between them), so
    // without this each variant would declare itself canonical and `/blog/` would
    // become a duplicate of the `/blog` URL used by the sitemap and internal links.
    // Query strings and hashes never reach this value because only the path is read.
    const rawPath = window.location.pathname;
    const normalisedPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
    const canonicalUrl = absoluteUrl(url ?? normalisedPath);
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

    // Page-level structured data only. The Organization entity ("#organization") is
    // declared statically in index.html as the single source of truth for the
    // organisation, so page nodes reference it by @id instead of declaring a
    // second, competing Organization. This also keeps the static node safe: it is
    // never the script that gets overwritten here.
    let pageSchema = document.querySelector<HTMLScriptElement>('script#page-schema');
    if (type === 'article') {
      if (!pageSchema) {
        pageSchema = document.createElement('script');
        pageSchema.type = 'application/ld+json';
        pageSchema.id = 'page-schema';
        document.head.appendChild(pageSchema);
      }
      pageSchema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description || '',
        image: fullImageUrl,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          '@id': ORG_ID,
          name: DEFAULT_SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/logo-black.png`,
          },
        },
      });
    } else if (pageSchema) {
      // Left an article: drop the stale BlogPosting node so it cannot be read as
      // a description of the page now on screen.
      pageSchema.remove();
    }
  }, [title, description, image, url, type]);

  return null;
}
