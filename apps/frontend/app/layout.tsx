import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import Provider from "./_components/Provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Helmet Detection System for Automatic Door Access",
    template: "%s | Helmet Detection System",
  },
  description: "Helmet Detection System for Automatic Door Access",
  keywords: [
    "helmet detection",
    "door access",
    "safety system",
    "automatic door",
    "monitoring",
    "logs",
    "IoT",
  ],
  authors: [{ name: "Phycom Team" }],
  creator: "Phycom Team",
  publisher: "Phycom",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://phycom.example.com",
    title: "Helmet Detection System for Automatic Door Access",
    description: "Helmet Detection System for Automatic Door Access",
    siteName: "Helmet Detection System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Phycom Dashboard Preview",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Helmet Detection System for Automatic Door Access",
    description: "Helmet Detection System for Automatic Door Access",
    images: ["/og-image.png"],
    creator: "@phycom",
  },

  // PWA
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Helmet Detection System",
  },

  // Icons
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-dvh`}
      >
        <Provider>
          <Header />
          <div className="flex-1 bg-accent flex">{children}</div>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
