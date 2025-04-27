"use client";

import * as React from "react";

interface GaugeProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Gauge({
  value,
  max = 100,
  size = "md",
  className = "",
}: GaugeProps) {
  const percentage = (Math.min(Math.max(value, 0), max) / max) * 100;
  const sizeClasses = {
    sm: "h-2 w-16",
    md: "h-3 w-24",
    lg: "h-4 w-32",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percentage >= 80
              ? "bg-green-500"
              : percentage >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
