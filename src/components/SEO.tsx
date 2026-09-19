import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const DEFAULT_IMAGE = '/images/logo-black.png';
const DEFAULT_SITE_NAME = 'People Growth Africa';

export default function SEO({ title, description, image = DEFAULT_IMAGE, url, type = 'website' }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('People Growth Africa') ? title : `${title} | ${DEFAULT_SITE_NAME}`;
    document.title = fullTitle;

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

    // Standard Meta
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // OpenGraph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);

    const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
    setMetaTag('property', 'og:image', fullImageUrl);

    if (url) {
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      setMetaTag('property', 'og:url', fullUrl);

      // Canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.href = fullUrl;
    }

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // JSON-LD Schema.org for AI & Search Crawlers (0ms impact, pure inline microdata)
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const currentOrigin = window.location.origin;
    const currentFullUrl = url ? (url.startsWith('http') ? url : `${currentOrigin}${url}`) : currentOrigin;

    if (type === 'article') {
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description || '',
        image: fullImageUrl,
        url: currentFullUrl,
        publisher: {
          '@type': 'Organization',
          name: DEFAULT_SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${currentOrigin}/images/logo-black.png`,
          },
        },
      });
    } else {
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: DEFAULT_SITE_NAME,
        url: currentOrigin,
        logo: `${currentOrigin}/images/logo-black.png`,
        description: description || 'Institutional People Systems & Enterprise HR Architecture for High-Growth African Ventures',
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

