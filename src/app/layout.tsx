import type { Metadata } from "next";
import { Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import MatrixBackground from "@/components/matrix-background";
import IntroWrapper from "@/components/intro-wrapper";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Los Hermanos - Emissor de pix",
  description: "Emissor de PIX futurista com a gateway Blackcat",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-los-hermanos.png",
    apple: "/logo-los-hermanos.png",
    shortcut: "/logo-los-hermanos.png",
  },
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
        className={`${rajdhani.variable} ${shareTechMono.variable} font-sans antialiased`}
      >
        <MatrixBackground />
        <IntroWrapper>
          <main className="relative z-10">{children}</main>
        </IntroWrapper>
      </body>
    </html>
  );
}