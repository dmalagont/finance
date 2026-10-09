import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AppHeader } from "@/components/layout/app-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import "./globals.css";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Cockpit", template: "%s · Cockpit" },
  description: "Private investment cockpit: macro and market risk, probabilities and portfolio. Monitoring, not advice.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${plexMono.variable} ${plexSans.variable}`}>
      <body className="min-h-dvh bg-ground text-ink">
        <AppHeader />
        <div className="pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        <MobileTabBar />
      </body>
    </html>
  );
}
