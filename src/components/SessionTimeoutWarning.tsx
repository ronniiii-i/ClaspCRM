"use client";

import { Button } from "@/components/ui/button";
import { useTimeoutWarning } from "@/hooks/useTimeoutWarning";

export default function SessionTimeoutWarning() {
  const {
    showWarning,
    remainingTime,
    refreshSession,
    dismissWarning,
    handleModalInteraction,
  } = useTimeoutWarning();

  if (!showWarning) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleModalInteraction}
    >
      <div
        className="bg-background p-6 rounded-lg max-w-md w-full border border-border"
        onClick={handleModalInteraction}
      >
        <h2 className="text-lg font-semibold">Session About to Expire</h2>
        <p className="my-4">
          {minutes > 0
            ? `Your session will expire in ${minutes} minute${
                minutes !== 1 ? "s" : ""
              } and ${seconds} second${
                seconds !== 1 ? "s" : ""
              } due to inactivity.`
            : `Your session will expire in ${seconds} second${
                seconds !== 1 ? "s" : ""
              }.`}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={(e) => {
              handleModalInteraction(e);
              dismissWarning();
            }}
          >
            Log Out Now
          </Button>
          <Button
            onClick={(e) => {
              handleModalInteraction(e);
              refreshSession();
            }}
          >
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
}
