"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";

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
  const isAdmin = viewer.email === "admin@hackathon.com";

  const navItems = [
    { href: "/hackathon", label: "Dashboard", current: pathname === "/hackathon" },
    { href: "/hackathon/ideas", label: "Ideas", current: pathname === "/hackathon/ideas" },
    { href: "/hackathon/teams", label: "Teams", current: pathname === "/hackathon/teams" },
    { href: "/hackathon/leaderboard", label: "Leaderboard", current: pathname === "/hackathon/leaderboard" },
    { href: "/hackathon/suggestions", label: "Feedback", current: pathname === "/hackathon/suggestions" },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-cyan-400/20 bg-black/20 backdrop-blur px-4 md:px-6">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex h-20 w-full justify-between gap-6 text-lg font-medium md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/hackathon">
          <h1 className="text-xl font-bold text-yellow-400 hackathon-title">
            {title}
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hackathon-text text-sm transition-colors py-2 px-3 rounded-md ${
                  item.current
                    ? 'text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20'
                    : 'text-cyan-300 hover:text-yellow-400 hover:bg-yellow-400/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors hackathon-text text-sm py-2 px-3 rounded-md hover:bg-yellow-400/5">
              Home
            </Link>
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
          <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.name}</UserMenu>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between px-0 py-3 h-16">
          {/* Left: Title */}
          <Link href="/hackathon" onClick={() => setIsMobileMenuOpen(false)}>
            <h1 className="text-lg font-bold text-yellow-400 hackathon-title">
              {title}
            </h1>
          </Link>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {children}
            {showTour && onShowTour && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowTour}
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs px-2 py-1 h-8"
              >
                🎯
              </Button>
            )}
            <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.name}</UserMenu>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          <div className="px-0 pb-4 border-t border-cyan-400/20 bg-black/30">
            <div className="space-y-2 pt-3 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    item.current
                      ? 'text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20'
                      : 'text-cyan-300 hover:text-yellow-400 hover:bg-yellow-400/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-cyan-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
