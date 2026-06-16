import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual Tour - UNU Yogyakarta",
  description: "Jelajahi kampus secara virtual dengan teknologi 360°",
  icons: {
    icon: "/gold-unu.ico",
    shortcut: "/gold-unu.png",
    apple: "/gold-unu.png",
  },
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-black text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
