import type { Metadata, Viewport } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titilliumWeb = Titillium_Web({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3B8CFF",
};

export const metadata: Metadata = {
  title: "UrbanGaon — Real Estate CRM (Lead to Possession)",
  description: "Next-generation real estate developer CRM for managing leads, visual unit inventory, bookings, payment milestones, post-sales paperwork and possession.",
  icons: {
    icon: [
      { url: "/urbangaon-icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/urbangaon-icon.png"],
    apple: [
      { url: "/urbangaon-icon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UrbanGaon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={titilliumWeb.variable}>
      <head>
        <link rel="icon" href="/urbangaon-icon.png" sizes="any" />
        <link rel="shortcut icon" href="/urbangaon-icon.png" />
        <link rel="apple-touch-icon" href="/urbangaon-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${titilliumWeb.className} antialiased bg-[#F8FAFC] text-slate-900 min-h-screen selection:bg-[#3B8CFF]/20 selection:text-[#1A57BD]`}>
        {children}
      </body>
    </html>
  );
}
