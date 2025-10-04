"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";
import { PersonIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";
import Link from "next/link";

interface UserMenuProps {
  children: ReactNode;
  isAdmin?: boolean;
  hackathonUser?: {
    role: "dev" | "non-dev" | "admin";
    displayName?: string;
  } | null;
}

export function UserMenu({ children, isAdmin = false, hackathonUser }: UserMenuProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {children}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <PersonIcon className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{hackathonUser?.displayName || children}</DropdownMenuLabel>
                  {hackathonUser && (
                    <DropdownMenuLabel className="flex items-center gap-2 py-0 font-normal">
                      <span className="text-cyan-300 text-sm">Role:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        hackathonUser.role === 'dev' 
                          ? 'bg-blue-500 text-white' 
                          : hackathonUser.role === 'admin'
                          ? 'bg-red-500 text-white'
                          : 'bg-pink-500 text-white'
                      }`}>
                        {hackathonUser.role === 'dev' ? '💻 Developer' : 
                         hackathonUser.role === 'admin' ? '🚨 Admin' :
                         '🎨 Non-Developer'}
                      </span>
                    </DropdownMenuLabel>
                  )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/hackathon/my-dashboard">Personal Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/hackathon/profile">Profile Settings</Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/hackathon/admin">Admin Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <DropdownMenuItem onClick={() => void signOut()}>Sign out</DropdownMenuItem>
  );
}
