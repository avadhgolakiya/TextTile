import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';
  const DOMAIN = 'https://swastikfashion.com';

  const routes = [
    '',
    '/home',
    '/collection',
    '/privacy',
    '/data-deletion',
  ].map((route) => ({
    url: `${DOMAIN}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/home' ? 1.0 : 0.8,
  }));

  try {
    const res = await fetch(`${API_BASE}/api/products`);
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
