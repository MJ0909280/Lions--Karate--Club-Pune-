import { useEffect } from 'react';

interface SEOConfigProps {
  title: string;
  description: string;
  pagePath?: string;
}

export default function SEOConfig({ title, description, pagePath = "" }: SEOConfigProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = `${title} | LIONS KARATE CLUB PUNE`;

    // 2. Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      let element = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', `${title} | LIONS KARATE CLUB PUNE`, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:image', 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600&auto=format&fit=crop', true);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', `${title} | LIONS KARATE CLUB PUNE`);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600&auto=format&fit=crop');

    // 3. Inject structured LocalBusiness JSON-LD markup
    const schemaId = 'json-ld-karate-dojo';
    let scriptElement = document.getElementById(schemaId) as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      "additionalType": "http://www.productontology.org/doc/Karate",
      "name": "LIONS KARATE CLUB PUNE",
      "alternateName": "Lions Karate Pune",
      "description": "LIONS KARATE CLUB PUNE delivers top-notch Karate Classes in Manajinager Pune, Karate Classes Near Bhumkar Chowk, Karate Classes Near Silver Birch Hospital, and Self Defence Classes for kids, youth, and adults.",
      "image": "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600&auto=format&fit=crop",
      "priceRange": "INR",
      "telephone": "9049688172",
      "email": "lionskaratepune@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "VASUNDHARA PRE-PRIMARY SCHOOL, Near Bhumkar Chowk, Beside Silver Birch Hospital, Manajinager",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "postalCode": "411041",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.4452,
        "longitude": 73.8179
      },
      "url": window.location.origin,
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Wednesday", "Friday"],
          "opens": "16:00",
          "closes": "21:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Tuesday", "Thursday"],
          "opens": "17:00",
          "closes": "21:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday"],
          "opens": "09:00",
          "closes": "15:00"
        }
      ],
      "sameAs": [
        "https://facebook.com/lionskarateclubpune",
        "https://instagram.com/lionskarateclubpune"
      ]
    };

    scriptElement.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup is handled gracefully by over-writing next time
    };
  }, [title, description, pagePath]);

  return null;
}
