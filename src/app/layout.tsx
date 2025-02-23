import "./globals.css";
import type { Metadata } from "next";
import cn from "classnames";
import Script from "next/script";
import GlobalToastRegion from "@/components/Toast";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "onism - Unlock Your Perfect Trip",
  description:
    "Discover your ideal journey with onism! Our AI-powered itinerary generator crafts personalized travel plans based on your preferences, interests, and budget. Start exploring effortlessly today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full font-sans antialiased")}>
        <Header />
        {children}
        <GlobalToastRegion />
      </body>
    </html>
  );
}
