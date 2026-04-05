"use client";

import { useEffect } from "react";

export default function UnhandledRejectionGuard() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;

      // Only suppress raw DOM/Event rejections like "[object Event]".
      // Keep normal Error rejections visible for debugging.
      if (
        reason instanceof Event ||
        Object.prototype.toString.call(reason) === "[object Event]"
      ) {
        console.warn("Suppressed unhandled Event rejection:", {
          type: (reason as Event).type || "unknown",
          target: (reason as Event).target ? "present" : "none",
        });
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
