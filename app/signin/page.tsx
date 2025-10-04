"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast, Toaster } from "sonner";
import { useState } from "react";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn } = useAuthActions();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // For password provider, we need to specify the flow parameter
      const flow = isSignUp ? "signUp" : "signIn";
      await signIn("password", { email, password, flow });
      
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      
      // Note: Hackathon profile will be created when user first visits hackathon page
    } catch (error) {
      console.error(error);
      toast.error(isSignUp ? "Failed to create account" : "Failed to sign in");
    }
  };

  return (
    <div className="flex min-h-screen w-full container my-auto mx-auto">
      <div className="max-w-[384px] mx-auto flex flex-col my-auto gap-4 pb-8">
        <h2 className="font-semibold text-2xl tracking-tight">
          {isSignUp ? "Join the Hackathon" : "Sign in"}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              name="email"
              id="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              name="password"
              id="password"
              type="password"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-1"
            />
          </div>

          
          <Button 
            type="submit" 
            className="w-full"
          >
            {isSignUp ? "Join Hackathon" : "Sign In"}
          </Button>
        </form>
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
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
  );
}
