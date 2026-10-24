import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChaosDrive — A home for your beautiful mess",
    template: "%s · ChaosDrive",
  },
  description:
    "A warm, papery home for nested folders, big uploads, second thoughts, and everything you keep meaning to organize. Five gigabytes of controlled chaos.",
  applicationName: "ChaosDrive",
  keywords: [
    "ChaosDrive",
    "file storage",
    "cloud drive",
    "nested folders",
    "paper office",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable}`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-ink focus:bg-sticky focus:px-4 focus:py-2.5 focus:font-sans focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
