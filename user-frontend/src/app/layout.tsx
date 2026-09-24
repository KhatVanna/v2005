import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreShell } from "@/components/layout/store-shell";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

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
    default: "V2005 — Modern E-Commerce Marketplace",
    template: "%s | V2005",
  },
  description:
    "V2005 is a modern, premium e-commerce marketplace for quality products with fast delivery and secure checkout.",
  applicationName: "V2005",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/images/logo_v2005.png",
    apple: "/images/logo_v2005.png",
  },
  openGraph: {
    title: "V2005 — Modern E-Commerce Marketplace",
    description:
      "Shop quality products at V2005. Discover new arrivals, flash sales, and trusted brands.",
    siteName: "V2005",
    type: "website",
    images: [
      {
        url: "/images/logo_v2005.png",
        alt: "V2005",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <StoreShell>{children}</StoreShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
