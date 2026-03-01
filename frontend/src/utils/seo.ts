import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata({
  title = 'Restro OS - Fine Dining Restaurant',
  description = 'Experience fine dining with exceptional service at Restro OS. Book a table, order online, and enjoy our exquisite menu.',
  keywords = ['restaurant', 'fine dining', 'restro os', 'food', 'dining', 'reservation'],
  image = '/og-image.jpg',
  url = 'https://restroos.com',
  type = 'website',
  noindex = false,
  nofollow = false,
}: SEOProps = {}): Metadata {
  const fullTitle = title.includes('Restro OS') ? title : `${title} | Restro OS`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Restro OS' }],
    creator: 'Restro OS',
    publisher: 'Restro OS',
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: siteUrl,
      title: fullTitle,
      description,
      siteName: 'Restro OS',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: siteUrl,
    },
    metadataBase: new URL(siteUrl),
  };
}

export const defaultMetadata: Metadata = generateMetadata();

