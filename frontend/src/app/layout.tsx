import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Web3 Confessions - Privacy-Preserving Confession Platform",
  description:
    "Share encrypted confessions anonymously on-chain using Fully Homomorphic Encryption (FHEVM)",
  keywords: [
    "web3",
    "fhe",
    "privacy",
    "confessions",
    "ethereum",
    "blockchain",
    "anonymous",
  ],
  authors: [{ name: "Web3 Confessions Team" }],
  openGraph: {
    title: "Web3 Confessions",
    description: "Privacy-Preserving Confession Platform with FHEVM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import { Providers } from "@/components/Providers";
