import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropCRM — Real Estate CRM (Lead to Possession)",
  description: "Next-generation real estate developer CRM for managing leads, visual unit inventory, bookings, payment milestones, post-sales paperwork and possession.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-slate-950 text-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
