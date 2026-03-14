import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "UMKM.ID - Platform Jual Beli UMKM Terpercaya",
    template: "%s | UMKM.ID",
  },
  description: "Platform marketplace terpercaya untuk UMKM Indonesia. Temukan ribuan produk berkualitas dari pelaku usaha mikro, kecil, dan menengah.",
  keywords: ["ukm", "umkm", "marketplace", "jual beli", "produk lokal", "indonesia", "usaha kecil"],
  authors: [{ name: "UKM.ID Team" }],
  icons: {
    icon: "/ukm-logo.png",
    shortcut: "/ukm-logo.png",
    apple: "/ukm-logo.png",
  },
  openGraph: {
    title: "Umkm.ID - Platform UMKM Indonesia",
    description: "Platform marketplace terpercaya untuk UMKM Indonesia",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
