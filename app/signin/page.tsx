"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleNav } from "@/components/SimpleNav";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast, Toaster } from "sonner";
import { useState } from "react";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  const { signIn } = useAuthActions();

  const validateForm = (username: string, password: string) => {
    const newErrors: {username?: string; password?: string} = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (isSignUp && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Clear previous errors
    setErrors({});

    // Client-side validation
    if (!validateForm(username, password)) {
      return;
    }

    setIsLoading(true);

    try {
      // For password provider, we need to specify the flow parameter
      const flow = isSignUp ? "signUp" : "signIn";
      await signIn("password", { email: username, password, flow });
      
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      
      // Note: Hackathon profile will be created when user first visits hackathon page
    } catch (error: any) {
      console.error(error);
      
      // Better error handling with specific messages
      let errorMessage = isSignUp ? "Failed to create account" : "Failed to sign in";
      
      if (error?.message) {
        if (error.message.includes("already exists")) {
          errorMessage = "An account with this username already exists";
        } else if (error.message.includes("invalid credentials")) {
          errorMessage = "Invalid username or password";
        } else if (error.message.includes("password")) {
          errorMessage = "Password requirements not met";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
                data-1p-ignore={false}
                placeholder="Enter your username (can be email or any identifier)"
                className={`mt-1 bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full ${
                  errors.username ? 'border-red-400' : ''
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
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
                data-1p-ignore={false}
                data-lpignore={false}
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                className={`mt-1 bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400 w-full ${
                  errors.password ? 'border-red-400' : ''
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                isSignUp ? "Join Hackathon" : "Sign In"
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              className="text-sm text-cyan-300 hover:text-yellow-400 disabled:opacity-50"
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
