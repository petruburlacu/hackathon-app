"use client";

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
    <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
      <span className="hidden sm:inline text-xs sm:text-sm text-cyan-300 truncate max-w-20 sm:max-w-none">
        {children}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
            <PersonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-sm">{hackathonUser?.displayName || children}</DropdownMenuLabel>
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
            <Link href="/hackathon/my-dashboard">My Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/hackathon/profile">Profile</Link>
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
