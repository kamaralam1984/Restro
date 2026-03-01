import type { Metadata } from "next";
import "@/styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButtonWrapper from "@/components/WhatsAppButtonWrapper";
import PWAProvider from "@/components/PWAProvider";
import { generateMetadata as generateSEOMetadata } from "@/utils/seo";
import { generateRestaurantSchema } from "@/utils/schema";

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Restro OS - Restaurant Management Platform",
    description: "Run your restaurant like a pro. Orders, billing, bookings, analytics & staff management — all in one platform. Start your free trial.",
    keywords: ["restaurant management", "restro os", "pos", "restaurant software", "orders", "billing", "table booking", "analytics"],
  }),
  manifest: "/manifest.json",
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const restaurantSchema = generateRestaurantSchema();

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Mukta:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-950">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <WhatsAppButtonWrapper />
              <PWAProvider />
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}

