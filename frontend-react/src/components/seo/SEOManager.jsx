import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEOConfig, generateSchemaJSONLD } from '../../config/seo-config';

/**
 * SEOManager - Componente para actualizar meta tags dinámicamente
 * Basado en la ruta actual, actualiza title, description, OG tags y Schema.org
 */
const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const config = getSEOConfig(location.pathname);
    
    // Actualizar title
    document.title = config.title;
    
    // Actualizar meta description
    updateMetaTag('name', 'description', config.description);
    updateMetaTag('property', 'og:description', config.ogDescription);
    updateMetaTag('name', 'twitter:description', config.ogDescription);
    
    // Actualizar meta keywords
    updateMetaTag('name', 'keywords', config.keywords);
    
    // Actualizar Open Graph title
    updateMetaTag('property', 'og:title', config.ogTitle);
    updateMetaTag('name', 'twitter:title', config.ogTitle);
    
    // Actualizar URL canónica
    const canonicalUrl = `https://editorpdf.pro${location.pathname}`;
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateLinkTag('canonical', canonicalUrl);
    
    // Actualizar Schema.org JSON-LD
    updateSchemaJSONLD(location.pathname, config);
    
    // Notificar a Google Analytics (si está instalado)
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
        page_title: config.title
      });
    }
    
    // Notificar cambio a Search Console (cuando esté en producción)
    if (window.location.hostname === 'editorpdf.pro') {
      // Fetch para notificar a Google del cambio de URL
      fetch(`https://editorpdf.pro${location.pathname}`, {
        method: 'HEAD',
        mode: 'no-cors'
      }).catch(() => {});
    }
    
    console.log('✅ SEO actualizado para:', location.pathname);
    console.log('📄 Title:', config.title);
    
  }, [location.pathname]);

  /**
   * Actualiza o crea un meta tag
   */
  const updateMetaTag = (attrName, attrValue, content) => {
    const selector = `meta[${attrName}="${attrValue}"]`;
    let element = document.querySelector(selector);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  /**
   * Actualiza o crea un link tag (canonical, etc.)
   */
  const updateLinkTag = (rel, href) => {
    const selector = `link[rel="${rel}"]`;
    let element = document.querySelector(selector);
    
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    
    element.setAttribute('href', href);
  };

  /**
   * Actualiza Schema.org JSON-LD dinámicamente
   */
  const updateSchemaJSONLD = (pathname, config) => {
    // Eliminar schema anterior si existe
    const oldSchema = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
    if (oldSchema) {
      oldSchema.remove();
    }
    
    // Crear nuevo schema
    const schema = generateSchemaJSONLD(pathname, config);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(schema, null, 2);
    
    document.head.appendChild(script);
  };

  return null; // Este componente no renderiza nada visual
};

export default SEOManager;