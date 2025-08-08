import React from 'react';

export const SEO = ({ title, description, keywords }) => {
  React.useEffect(() => {
    if (title) document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    }
  }, [title, description, keywords]);

  return null;
};

export const StructuredData = ({ data }) => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
};

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '11Mercado',
  description: 'Beta platform for exclusive access',
};

export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '11Mercado Platform',
  url: window.location.origin,
};

export const betaApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '11Mercado Beta',
  applicationCategory: 'WebApplication',
};

export const pagePresets = {
  home: {
    title: '11Mercado - Beta Platform',
    description: 'Exclusive beta platform access',
    keywords: 'beta, platform, exclusive',
  },
  dashboard: {
    title: 'Dashboard - 11Mercado Platform',
    description: 'Your personalized dashboard',
    keywords: 'dashboard, admin, management',
  },
  projects: {
    title: 'Projects - 11Mercado Platform',
    description: 'Browse available projects',
    keywords: 'projects, browse, community',
  },
  tools: {
    title: 'Research Tools - 11Mercado Platform',
    description: 'Access research tools and resources',
    keywords: 'research, tools, resources',
  },
  community: {
    title: 'Community - 11Mercado Platform',
    description: 'Connect with the community',
    keywords: 'community, connect, social',
  },
  admin: {
    title: 'Admin Panel - 11Mercado Platform',
    description: 'Administrative control panel',
    keywords: 'admin, management, control',
  },
};
