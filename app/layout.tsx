import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚖️ Trial by Code - Hackathon Platform",
  description: "Join the ultimate hackathon experience! Submit ideas, form teams, and compete for glory in Trial by Code.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
            <Toaster 
              theme="dark"
              position="bottom-right"
              className="toaster"
              toastOptions={{
                style: {
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
          </ThemeProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}