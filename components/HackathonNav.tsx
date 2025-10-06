"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <header className="sticky top-0 z-10 flex h-20 border-b border-cyan-400/20 bg-black/20 backdrop-blur px-4 md:px-6">
      <nav className="container hidden w-full justify-between gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
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
      <div className="md:hidden flex items-center justify-between w-full px-4">
        <Link href="/hackathon">
          <h1 className="text-lg font-bold text-yellow-400 hackathon-title">
            {title}
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          {children}
          {showTour && onShowTour && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTour}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs hackathon-text"
            >
              🎯 Tour
            </Button>
          )}
          <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.name}</UserMenu>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className="md:hidden px-4 pb-4 w-full">
        <select 
          className="w-full bg-black/30 border border-cyan-400/30 text-white rounded px-3 py-2 text-sm hackathon-text"
          onChange={(e) => {
            if (e.target.value) {
              window.location.href = e.target.value;
            }
          }}
        >
          <option value="">Navigate...</option>
          {navItems.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
          <option value="/">Home</option>
        </select>
      </div>
    </header>
  );
}
