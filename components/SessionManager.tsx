"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function SessionManager() {
  const enforceSingleSession = useMutation(api.hackathon.enforceSingleSession);
  const getActiveSessions = useQuery(api.hackathon.getActiveSessions);

  useEffect(() => {
    // Enforce single session on component mount (user login)
    const checkSessions = async () => {
      try {
        const result = await enforceSingleSession();
        
        // Show appropriate notification based on sessions deleted
        if (result.sessionsDeleted > 0) {
          toast.warning(
            `Security Notice: ${result.sessionsDeleted} concurrent session(s) were terminated`,
            {
              description: "Only one active session is allowed per account for security.",
              duration: 5000,
            }
          );
        } else {
          toast.info(
            "Security: Single session enforcement active",
            {
              description: "Only one active session is allowed per account for security.",
              duration: 3000,
            }
          );
        }
      } catch (error) {
        console.error("Session enforcement error:", error);
        // Don't show error toasts for authentication errors
        if (error instanceof Error && !error.message.includes("not authenticated")) {
          toast.error("Session management error occurred");
        }
      }
    };

    // Only run if we have session data and user is authenticated
    if (getActiveSessions !== undefined && getActiveSessions !== null) {
      checkSessions();
    }
  }, [enforceSingleSession, getActiveSessions]);

  // This component doesn't render anything visible
  return null;
}
