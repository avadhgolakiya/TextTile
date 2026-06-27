import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://texttile.onrender.com';
  const DOMAIN = 'https://swastikfashion.com';

  const config: Record<string, { changeFrequency: 'weekly' | 'daily' | 'monthly'; priority: number }> = {
    '': { changeFrequency: 'weekly', priority: 1.0 },
    '/home': { changeFrequency: 'weekly', priority: 1.0 },
    '/collection': { changeFrequency: 'daily', priority: 0.9 },
    '/products': { changeFrequency: 'daily', priority: 0.9 },
    '/about': { changeFrequency: 'monthly', priority: 0.5 },
    '/contact': { changeFrequency: 'monthly', priority: 0.5 },
    '/terms': { changeFrequency: 'monthly', priority: 0.5 },
    '/shipping': { changeFrequency: 'monthly', priority: 0.5 },
    '/refund': { changeFrequency: 'monthly', priority: 0.5 },
    '/faq': { changeFrequency: 'monthly', priority: 0.5 },
    '/privacy': { changeFrequency: 'monthly', priority: 0.5 },
    '/data-deletion': { changeFrequency: 'monthly', priority: 0.5 },
  };

  const routes = Object.entries(config).map(([route, spec]) => ({
    url: `${DOMAIN}${route}`,
    lastModified: new Date(),
    changeFrequency: spec.changeFrequency,
    priority: spec.priority,
  }));

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const { products } = await res.json();
      if (Array.isArray(products)) {
        const productRoutes = products.map((product: any) => ({
          url: `${DOMAIN}/products/${product.id}`,
          lastModified: new Date(product.updatedAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
        return [...routes, ...productRoutes];
      }
    }
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }

  return routes;
}
