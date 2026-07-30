import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marker',
});

export const metadata: Metadata = {
  title: "Yasin Manjothi — Multidisciplinary Creative",
  description: "Yasin Manjothi — brand identity, marketing, and event design work, plus full-stack web development for real clients. Design and code, one portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${permanentMarker.variable}`}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
