"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    { href: "/hackathon/suggestions", label: "Suggestions", current: pathname === "/hackathon/suggestions" },
  ];

  return (
    <div className="border-b border-cyan-400/20 bg-black/20 backdrop-blur-sm">
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-4">
        <div className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">
          {title}
        </div>
        
        <div className="flex items-center gap-2">
          {children}
          {showTour && onShowTour && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowTour}
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs"
            >
              🎯 Take Tour
            </Button>
          )}
          <ThemeToggle />
          <UserMenu isAdmin={isAdmin} hackathonUser={hackathonUser}>{viewer.name}</UserMenu>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4 px-4 pb-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-sm transition-colors ${
              item.current
                ? 'text-yellow-400 font-bold'
                : 'text-cyan-300 hover:text-yellow-400'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
          Home
        </Link>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden px-4 pb-4">
        <select 
          className="w-full bg-black/30 border border-cyan-400/30 text-white rounded px-3 py-2 text-sm"
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
    </div>
  );
}
