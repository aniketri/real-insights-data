import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import KeepAlive from "@/components/KeepAlive";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Real Insights",
  description: "Commercial Real Estate Debt Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} font-sans`}>
        <Provider>{children}</Provider>
        <KeepAlive />
      </body>
    </html>
  );
} 