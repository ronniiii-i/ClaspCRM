"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface TimeoutWarningOptions {
  warningTime?: number; // seconds before logout to show warning (default: 120 = 2 minutes)
  logoutAfter?: number; // total session length (default: 300 = 5 minutes)
}

export function useTimeoutWarning(options?: TimeoutWarningOptions) {
  const { warningTime = 120, logoutAfter = 300 } = options || {};
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTime);

  // Use refs instead of state for timers to avoid re-renders
  const timeoutIdRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isModalOpenRef = useRef(false);

  // Start the timers when hook is initialized
  const startTimers = useCallback(() => {
    // Clear existing timers if any
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    // Set timer to show warning
    timeoutIdRef.current = setTimeout(() => {
      setShowWarning(true);
      isModalOpenRef.current = true;
      setRemainingTime(warningTime);

      // Start countdown
      warningIntervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (warningIntervalRef.current)
              clearInterval(warningIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timer to force logout after warning period
      timeoutIdRef.current = setTimeout(() => {
        logout();
        router.push("/login?reason=timeout");
      }, warningTime * 1000);
    }, (logoutAfter - warningTime) * 1000);
  }, [warningTime, logoutAfter, router]);

  // Reset timers on user activity
  const resetTimers = useCallback(() => {
    // Only reset timers if modal is not open
    if (!isModalOpenRef.current) {
      setShowWarning(false);
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = undefined;
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      startTimers();
    }
  }, [startTimers]);

  // Function to handle modal interaction - prevent event bubbling
  const handleModalInteraction = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.stopPropagation();
      }
    },
    []
  );

  // Explicitly refresh session (called by button click)
  const refreshSession = useCallback(() => {
    isModalOpenRef.current = false;
    setShowWarning(false);
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = undefined;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    startTimers();
  }, [startTimers]);

  // Explicitly dismiss warning and logout
  const dismissWarning = useCallback(() => {
    isModalOpenRef.current = false;
    setShowWarning(false);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    logout();
    router.push("/login?reason=timeout");
  }, [router]);

  // Setup activity listeners and timer
  useEffect(() => {
    const handleActivity = () => {
      resetTimers();
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    startTimers();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

      // Remove event listeners
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [resetTimers, startTimers]);

  return {
    showWarning,
    remainingTime,
    refreshSession,
    dismissWarning,
    handleModalInteraction,
  };
}
