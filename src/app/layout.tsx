import type { Metadata } from "next";
import { Inter_Tight } from 'next/font/google';
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DandoEv - Ride Electric, Pay Smart | E-Bike BNPL Nigeria",
  description: "Nigeria's premier electric bike marketplace with flexible Buy Now, Pay Later options. Browse, finance, and ride electric bikes with ease.",
  keywords: "electric bikes, e-bikes, BNPL, buy now pay later, Nigeria, DandoEv",
};

import MobileNav from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable}`}>
      <body style={{ paddingBottom: '80px' }}> {/* Padding for mobile nav */}
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
