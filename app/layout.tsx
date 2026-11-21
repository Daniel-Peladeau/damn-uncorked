import type { Metadata, Viewport } from "next";
import { Geist_Mono, Jost, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

// Cellar Journal type (#120): Newsreader for headings and tasting notes,
// Jost for UI text, Geist Mono for vintages and numbers.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DamnUncorked - Wine Logger",
  description: "A private wine logging, rating, and research site",
};

// viewport-fit=cover lets the mobile BottomNav pad itself for the iPhone home
// indicator via env(safe-area-inset-bottom).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${jost.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
