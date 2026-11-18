import { Geist, Geist_Mono, Google_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial", "sans-serif"],
});

export const metadata = {
  title: "Dragon Media — Digital Experiences That Move Businesses Forward",
  description:
    "Dragon Media is a digital technology studio building websites, e-commerce platforms, mobile applications and intelligent digital solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${googleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
