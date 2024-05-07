import "./globals.css";
import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import cn from "classnames";
import Script from "next/script";
import GlobalToastRegion from "@/components/Toast";
import Header from "./components/Header";

const openSans = Open_Sans({ subsets: ["latin"] });

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
    <html lang="en">
      {process.env.NODE_ENV !== "development" && (
        <>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-NHG3FG5J1Z" />
          <Script id="google-analytics">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-NHG3FG5J1Z');
        `}
          </Script>
        </>
      )}

      <body
        className={cn(
          openSans.className,
          "p-4 lg:p-12 md:max-w-xl lg:max-w-7xl mx-auto"
        )}
      >
        <Header />
        {children}
        <GlobalToastRegion />
      </body>
    </html>
  );
}
