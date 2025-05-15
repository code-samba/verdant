import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import Header from "@/components/utils/header";
import Footer from "@/components/utils/footer";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Samba Verdant",
  description: "Verdant is a smart visualization tool for plant growth data—automating charts and tables to track, compare, and analyze development over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={inter.className}>
      <body className="bg-gradient-to-br from-background to-muted">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
