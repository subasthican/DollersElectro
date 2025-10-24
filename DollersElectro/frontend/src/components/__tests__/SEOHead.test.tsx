import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../SEOHead';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://dollerselectro.com/test'
  },
  writable: true
});

const renderWithHelmet = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      {component}
    </HelmetProvider>
  );
};

describe('SEOHead', () => {
  it('renders default meta tags', () => {
    renderWithHelmet(<SEOHead />);

    expect(document.title).toBe('DollersElectro - Premium Electrical Solutions');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toHaveAttribute('content', 'Discover premium electrical products and solutions at DollersElectro. Quality electrical components, tools, and equipment for professionals and enthusiasts.');
  });

  it('renders custom title and description', () => {
    renderWithHelmet(
      <SEOHead 
        title="Test Product"
        description="Test product description"
      />
    );

    expect(document.title).toBe('Test Product | DollersElectro');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toHaveAttribute('content', 'Test product description');
  });

  it('renders Open Graph meta tags', () => {
    renderWithHelmet(
      <SEOHead 
        title="Test Product"
        description="Test description"
        image="/test-image.jpg"
        type="product"
      />
    );

    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test Product | DollersElectro');
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute('content', 'Test description');
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', '/test-image.jpg');
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'product');
  });

  it('renders Twitter Card meta tags', () => {
    renderWithHelmet(<SEOHead />);

    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', 'DollersElectro - Premium Electrical Solutions');
  });

  it('renders structured data when provided', () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Test Product"
    };

    renderWithHelmet(
      <SEOHead structuredData={structuredData} />
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    expect(script?.textContent).toBe(JSON.stringify(structuredData));
  });
});



