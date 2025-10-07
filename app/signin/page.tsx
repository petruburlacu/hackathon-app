"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleNav } from "@/components/SimpleNav";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast, Toaster } from "sonner";
import { useState } from "react";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn } = useAuthActions();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // For password provider, we need to specify the flow parameter
      const flow = isSignUp ? "signUp" : "signIn";
      await signIn("password", { email: username, password, flow });
      
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      
      // Note: Hackathon profile will be created when user first visits hackathon page
    } catch (error) {
      console.error(error);
      toast.error(isSignUp ? "Failed to create account" : "Failed to sign in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <SimpleNav />
      
      <div className="flex min-h-[calc(100vh-80px)] w-full container my-auto mx-auto px-4">
        <div className="max-w-[384px] mx-auto flex flex-col my-auto gap-4 pb-8 w-full">
          <h2 className="font-semibold text-xl sm:text-2xl tracking-tight text-white text-center sm:text-left">
            {isSignUp ? "Join the Hackathon" : "Sign in"}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </label>
              <Input
                name="username"
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username (can be email or any identifier)"
                className="mt-1 bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <Input
                name="password"
                id="password"
                type="password"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="mt-1 bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full"
              />
            </div>

            
            <Button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3"
            >
              {isSignUp ? "Join Hackathon" : "Sign In"}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-cyan-300 hover:text-yellow-400"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Join the hackathon"
              }
            </Button>
          </div>
          
          <Toaster />
        </div>
      </div>
    </div>
  );
}
