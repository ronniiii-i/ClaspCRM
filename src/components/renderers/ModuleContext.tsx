"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ModuleContextValue } from "./types";

const ModuleContext = createContext<ModuleContextValue | null>(null);

export function ModuleProvider({
  value,
  children,
}: {
  value: ModuleContextValue;
  children: ReactNode;
}) {
  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
}

export function useModuleContext(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModuleContext must be used inside a ModuleProvider.");
  }
  return context;
}
