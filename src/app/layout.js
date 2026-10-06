import { Geist, Geist_Mono, Noto_Sans_Myanmar } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import CartImport from "@/components/CartImport";
import Providers from "@/components/Providers";
import { getLocale, getTheme } from "@/lib/preferences";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Burmese is the default language
const notoMyanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: { default: "Eichit Cosmetics", template: "%s · Eichit Cosmetics" },
  description: "Shop cosmetics online from Eichit Cosmetics.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#1A0A12" },
  ],
};

export default async function RootLayout({ children }) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers locale={locale}>
          {children}
          {/* restores a cart carried over from an in-app browser (?cart=…) on whatever page it lands */}
          <Suspense fallback={null}>
            <CartImport />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
