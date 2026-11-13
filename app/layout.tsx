import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BrandingProvider } from "@/components/branding-provider";
import { EnvBanner } from "@/components/env-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IToolbox Platform · BantAI",
  description: "IToolbox builds AI, IoT and web solutions for the public and private sectors. Its flagship, BantAI, is an AI knowledge base and conversational agent: accessible information, faster responses, and the evidence behind every answer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("itoolbox_theme");var d=s==="dark"?true:s==="light"?false:window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <BrandingProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </BrandingProvider>
        <EnvBanner />
      </body>
    </html>
  );
}
