import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const DOMAIN = 'https://swastikfashion.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/blocked/', '/api/'],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
