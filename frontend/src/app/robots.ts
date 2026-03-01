import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://restroos.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/_next/', '/checkout'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin/', '/api/', '/_next/', '/checkout'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
