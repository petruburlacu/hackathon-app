import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export default function SplashPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 sm:h-20 border-b border-cyan-400/20 bg-black/20 backdrop-blur px-3 sm:px-4 md:px-6">
          {/* Desktop Navigation */}
          <nav className="container hidden w-full justify-between gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link href="/">
              <h1 className="text-xl font-bold text-yellow-400 font-mono">🚀 HACKATHON 2025</h1>
            </Link>
            <div className="flex items-center gap-4">
              <SplashPageNav />
            </div>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link href="/">
              <h1 className="text-lg font-bold text-yellow-400 font-mono">🚀 HACKATHON 2025</h1>
            </Link>
            <div className="flex items-center gap-2">
              <SplashPageNav />
            </div>
          </div>
        </header>
        <main className="flex grow flex-col">{children}</main>
        <footer className="border-t">
          <div className="container py-4 text-sm leading-loose">
            Built with ❤️ for{" "}
            <FooterLink href="https://www.convex.dev/">Hackathon 2025</FooterLink>.
            Powered by Convex,{" "}
            <FooterLink href="https://nextjs.org/">Next.js</FooterLink> and{" "}
            <FooterLink href="https://ui.shadcn.com/">shadcn/ui</FooterLink>.
          </div>
        </footer>
      </div>
    </ConvexClientProvider>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="underline underline-offset-4 hover:no-underline"
      target="_blank"
    >
      {children}
    </Link>
  );
}

function SplashPageNav() {
  return (
    <>
      <Link href="/hackathon">
        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
          Enter Hackathon
        </Button>
      </Link>
    </>
  );
}
