import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restroos.com'
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/demo`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.4 },
  ]

  let restaurantPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${apiBase}/restaurants?limit=200&fields=slug,updatedAt`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const restaurants = data.restaurants || data.data || []
      restaurantPages = restaurants.map((r: any) => ({
        url: `${baseUrl}/r/${r.slug}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }))
    }
  } catch { /* use static only */ }

  return [...staticPages, ...restaurantPages]
}
