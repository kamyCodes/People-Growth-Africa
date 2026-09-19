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
  }, [title, description, image, url, type]);

  return null;
}

