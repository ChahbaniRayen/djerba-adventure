import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import AutoLogout from "@/components/AutoLogout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Luxury Djerba Adventure - Activités, Tours et Transferts à Djerba",
    template: "%s | Luxury Djerba Adventure",
  },
  description:
    "Réservez vos activités d'aventure, tours guidés et transferts aéroport à Djerba. Découvrez les merveilles de l'île de Djerba avec Luxury Djerba Adventure.",
  keywords: [
    "Djerba",
    "activités Djerba",
    "tours Djerba",
    "transfert aéroport Djerba",
    "aventure Djerba",
    "tourisme Djerba",
    "excursions Djerba",
    "voyage Tunisie",
  ],
  authors: [{ name: "Luxury Djerba Adventure" }],
  creator: "Luxury Djerba Adventure",
  publisher: "Luxury Djerba Adventure",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://djerba-adventure.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://djerba-adventure.vercel.app",
    siteName: "Luxury Djerba Adventure",
    title: "Luxury Djerba Adventure - Activités, Tours et Transferts à Djerba",
    description:
      "Réservez vos activités d'aventure, tours guidés et transferts aéroport à Djerba. Découvrez les merveilles de l'île de Djerba.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury Djerba Adventure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Djerba Adventure - Activités, Tours et Transferts à Djerba",
    description:
      "Réservez vos activités d'aventure, tours guidés et transferts aéroport à Djerba.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Ajoutez votre code de vérification Google Search Console ici
    // google: "votre-code-verification-google",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AutoLogout />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
