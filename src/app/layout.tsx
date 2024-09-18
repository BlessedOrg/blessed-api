import { RootProvider } from "@/providers/RootProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blessed API",
  description: "API for Blessed event ticketing platform - check at https://blessed.fan",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <RootProvider>{children}</RootProvider>
    </body>
    </html>
  );
}
