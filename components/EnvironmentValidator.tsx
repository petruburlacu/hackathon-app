"use client";

import { useEffect } from "react";
import { validateEnvironmentVariables, logEnvironmentInfo } from "@/lib/env-validation";

export function EnvironmentValidator() {
  useEffect(() => {
    // Run validation on component mount
    logEnvironmentInfo();
    const isValid = validateEnvironmentVariables();
    
    if (!isValid) {
      console.error("🚨 Environment validation failed!");
      console.error("Your app may not work properly without these variables.");
    }
  }, []);

  return null; // This component doesn't render anything
}

// Hook for manual validation
export function useEnvironmentValidation() {
  useEffect(() => {
    validateEnvironmentVariables();
  }, []);
}
