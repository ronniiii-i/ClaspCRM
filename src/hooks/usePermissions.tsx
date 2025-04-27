// src/hooks/usePermissions.ts
import { useState, useEffect } from "react";
import { ACLService } from "../services/acl";
import { useAuth } from "./useAuth"; // Your existing auth hook
import { Module } from "@/lib/modules";

export function usePermissions() {
  const { token } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        if (!token) throw new Error("Token is null");
        const data = await ACLService.getAccessibleModules(token);
        setModules(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    if (token) loadModules();
  }, [token]);

  const hasPermission = async (moduleId: string, action: string) => {
    try {
      if (!token) throw new Error("Token is null");
      return await ACLService.checkPermission(token, moduleId, action);
    } catch {
      return false;
    }
  };

  return { modules, loading, error, hasPermission };
}
