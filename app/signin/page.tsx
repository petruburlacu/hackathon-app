"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleNav } from "@/components/SimpleNav";
import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from "@convex-dev/auth/methods/username-password/react";
import { DEFAULT_MIN_PASSWORD_LENGTH } from "@convex-dev/auth/methods/username-password";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { safeNextPath } from "@/lib/safeNext";
import { useState } from "react";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  const { signIn, pending: signInPending } = useSignInWithUsernamePassword(api.auth);
  const { signUp, pending: signUpPending } = useSignUpWithUsernamePassword(api.auth);
  const isLoading = signInPending || signUpPending;

  const validateForm = (username: string, password: string) => {
    const newErrors: {username?: string; password?: string} = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (isSignUp && password.length < DEFAULT_MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${DEFAULT_MIN_PASSWORD_LENGTH} characters`;
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

    const result = isSignUp
      ? await signUp({ username, password })
      : await signIn({ username, password });

    if (result.status === "complete") {
      toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      // Hard navigation: the client router may hold a cached signed-out
      // redirect for /hackathon (-> /signin), which router.push would replay.
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(safeNextPath(next));
      return;
    }

    const { userError } = result;
    switch (userError.error) {
      case "USERNAME_TAKEN":
        toast.error("An account with this username already exists");
        return;
      case "INVALID_CREDENTIALS":
      case "USER_NOT_FOUND":
        toast.error("Invalid username or password");
        return;
      case "RATE_LIMITED":
        toast.error(
          `Too many attempts. Try again in ${Math.ceil(userError.retryAfterMs / 1000)}s`,
        );
        return;
      case "PASSWORD_TOO_SHORT":
        toast.error(`Password must be at least ${userError.minimumLength} characters`);
        return;
      case "PASSWORD_TOO_LONG":
        toast.error(`Password must be at most ${userError.maximumLength} characters`);
        return;
      case "PASSWORD_TOO_COMMON":
        toast.error("This password is too common. Please choose a different one");
        return;
      case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
        toast.error("Password can't start or end with whitespace");
        return;
      case "USERNAME_TOO_SHORT":
      case "USERNAME_TOO_LONG":
      case "USERNAME_HAS_SURROUNDING_WHITESPACE":
      case "USERNAME_HAS_INVALID_CHARACTERS":
        toast.error("That username is invalid");
        return;
      case "OTHER_ERROR":
        console.error(userError.cause);
        toast.error(isSignUp ? "Failed to create account" : "Failed to sign in");
        return;
      default:
        userError satisfies never;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <SimpleNav />
      
      <div className="flex min-h-[calc(100vh-80px)] w-full container my-auto mx-auto px-4">
        <div className="max-w-[384px] mx-auto flex flex-col my-auto gap-4 pb-8 w-full">
          <h2 className="font-semibold text-xl sm:text-2xl tracking-tight text-white text-center sm:text-left">
            {isSignUp ? "Create your account" : "Sign in"}
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
                placeholder={isSignUp ? `Create a password (min ${DEFAULT_MIN_PASSWORD_LENGTH} characters)` : "Enter your password"}
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
                isSignUp ? "Create account" : "Sign In"
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
                : "New here? Create an account to vote or take part"
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
