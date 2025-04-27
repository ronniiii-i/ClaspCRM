"use client";

import * as React from "react";

interface PipelineStageProps {
  children: React.ReactNode;
  className?: string;
}

export function PipelineStage({
  children,
  className = "",
}: PipelineStageProps) {
  return <div className={`flex-1 min-w-[200px] ${className}`}>{children}</div>;
}

export function PipelineHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 p-2 border-b">{children}</div>;
}

export function PipelineContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
