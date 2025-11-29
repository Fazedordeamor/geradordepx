import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import PwaInstallPrompt from "@/components/pwa-install-prompt";
import MatrixBackground from "@/components/matrix-background";
import IntroWrapper from "@/components/intro-wrapper";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Los hermanos - Emissor de pix",
  description: "Emissor de PIX futurista com a gateway Blackcat",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111827" />
      </head>
      <body
        className={`${orbitron.variable} ${shareTechMono.variable} font-mono antialiased`}
      >
        <MatrixBackground />
        <IntroWrapper>
          <main className="relative z-10">{children}</main>
        </IntroWrapper>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}