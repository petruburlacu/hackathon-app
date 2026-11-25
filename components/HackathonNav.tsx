"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";
import { EVENT_NAME } from "@/lib/event";

interface HackathonNavProps {
  title: string;
  showTour?: boolean;
  onShowTour?: () => void;
  children?: React.ReactNode;
}

export function HackathonNav({ title, showTour, onShowTour, children }: HackathonNavProps) {
  const pathname = usePathname();
  const viewer = useQuery(api.users.viewer);
  const hackathonUser = useQuery(api.hackathon.getHackathonUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!viewer) {
    return null;
  }

  // Simple admin check - in a real app, you'd have proper role-based access
  const isAdmin = viewer.isAdmin;

  const navItems = [
    { href: "/hackathon", label: "Dashboard", current: pathname === "/hackathon" },
    { href: "/hackathon/announcements", label: "Bulletin", current: pathname === "/hackathon/announcements" },
    { href: "/hackathon/ideas", label: "Ideas", current: pathname === "/hackathon/ideas" },
    { href: "/hackathon/teams", label: "Teams", current: pathname === "/hackathon/teams" },
    { href: "/hackathon/submission", label: "Our submission", current: pathname === "/hackathon/submission" },
    { href: "/hackathon/submissions", label: "Vote", current: pathname.startsWith("/hackathon/submissions") },
    { href: "/hackathon/leaderboard", label: "Leaderboard", current: pathname === "/hackathon/leaderboard" },
    { href: "/hackathon/suggestions", label: "Feedback", current: pathname === "/hackathon/suggestions" },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-cyan-400/20 bg-black/20 backdrop-blur-sm px-4 md:px-6">
      {/* Desktop Navigation */}
      <h1 className="sr-only">{title}</h1>
      <nav aria-label="Main" className="hidden md:flex h-20 w-full justify-between gap-4 text-sm font-medium md:items-center">
        <Link href="/" className="shrink-0 whitespace-nowrap text-lg font-bold text-yellow-400 hackathon-title" aria-label={`${EVENT_NAME} home`}>
          🚀 <span className="hidden xl:inline">{EVENT_NAME.toUpperCase()}</span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={`hackathon-text whitespace-nowrap text-sm transition-colors py-2 px-2 lg:px-3 rounded-md ${
                  item.current
                    ? 'text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20'
                    : 'text-cyan-300 hover:text-yellow-400 hover:bg-yellow-400/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {children}
          {showTour && onShowTour && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTour}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs hackathon-text"
            >
              🎯 Take Tour
            </Button>
          )}
          <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.username}</UserMenu>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between px-0 py-3 h-16">
          {/* Left: Title */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="min-w-0 truncate whitespace-nowrap text-lg font-bold text-yellow-400 hackathon-title"
          >
            🚀 {EVENT_NAME.toUpperCase()}
          </Link>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {children}
            {showTour && onShowTour && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowTour}
                aria-label="Take the tour"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs px-2 py-1 h-8"
              >
                🎯
              </Button>
            )}
            <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.username}</UserMenu>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              className="text-gray-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <Cross2Icon className="h-5 w-5" />
              ) : (
                <HamburgerMenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="px-0 pb-4 border-t border-cyan-400/20 bg-black/30">
            <div className="space-y-1 pt-3 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={item.current ? "page" : undefined}
                  className={`block px-4 py-3 rounded-lg text-base transition-colors ${
                    item.current
                      ? 'text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20'
                      : 'text-cyan-300 hover:text-yellow-400 hover:bg-yellow-400/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
