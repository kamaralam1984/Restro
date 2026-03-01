import type { Metadata } from "next";
import "@/styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { generateMetadata as generateSEOMetadata } from "@/utils/seo";
import { generateRestaurantSchema } from "@/utils/schema";

export const metadata: Metadata = generateSEOMetadata({
  title: "Restro OS - Fine Dining Restaurant",
  description: "Experience fine dining with exceptional service at Restro OS. Book a table, order online, and enjoy our exquisite menu.",
  keywords: ["restaurant", "fine dining", "restro os", "food", "dining", "reservation", "online ordering"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const restaurantSchema = generateRestaurantSchema();

  return (
    <html lang="en">
      <head>
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
              <WhatsAppButton />
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}

