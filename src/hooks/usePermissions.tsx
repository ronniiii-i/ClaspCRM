// src/hooks/usePermissions.ts
import { useState, useEffect } from "react";
import { ACLService } from "@/services/acl";
import { useAuth } from "./useAuth";
import { Module, Permission } from "@/lib/modules"; // Import shared types for modules and permissions

export function usePermissions() {
  const { user, token, isLoading: authLoading } = useAuth(); // Get user and token from useAuth
  const [modules, setModules] = useState<Module[]>([]); // Use ProtectedModule type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If user is loaded and has accessibleModules, set them
    if (user && user.accessibleModules) {
      setModules(user.accessibleModules);
      setLoading(false);
      setError(null);
      console.log('usePermissions: Modules loaded from user object.');
    } else if (!user && !token) {
      // If no user and no token, it means not authenticated
      setModules([]);
      setLoading(false);
      setError(new Error("User not authenticated."));
      console.log('usePermissions: No user/token found, setting empty modules.');
    } else {
        // Fallback: If user is somehow loaded but modules are not, or token is there but user isn't fully set
        // This case should be rare if login/verify is robust, but a direct fetch can be added if needed.
        // For now, rely on `user.accessibleModules` which comes from login/verify.
        console.log('usePermissions: Waiting for user.accessibleModules to be populated or user to be null.');
        setLoading(false); // Assume done if no modules in user yet
        setError(new Error("Could not retrieve user permissions."));
    }
  }, [user, token, authLoading]); // Depend on user, token, and authLoading

  const hasPermission = async (moduleId: string, action: Permission) => { // Use Permission enum
    if (!token) {
      console.warn(`hasPermission: No token available for module ${moduleId}, action ${action}.`);
      return false;
    }
    if (!user) {
        console.warn(`hasPermission: No user object available for module ${moduleId}, action ${action}.`);
        return false;
    }
    // Check local modules first for efficiency
    const foundModule = modules.find((m) => m.id === moduleId);
    if (foundModule) {
      // Check if the user's role has the specific permission in the local data
      const userRolePermissions = foundModule.permissions[user.role as keyof typeof foundModule.permissions];
      if (userRolePermissions && userRolePermissions.includes(action)) {
        console.log(`hasPermission: Local check: User ${user.email} (${user.role}) HAS permission for ${moduleId}:${action}`);
        return true;
      }
      console.log(`hasPermission: Local check: User ${user.email} (${user.role}) does NOT have permission for ${moduleId}:${action}`);
      // If local check fails, it means the module itself is accessible but the specific action isn't.
      // No need to hit the backend unless you want to re-validate, which is less efficient.
      return false;
    }


    // Fallback: If module not found locally or a more rigorous check is needed, hit the backend
    try {
      console.log(`hasPermission: Module ${moduleId} not found locally or action not present. Checking backend.`);
      return await ACLService.checkPermission(token, moduleId, action);
    } catch (err) {
      console.error(`Error checking permission for ${moduleId}:${action} via backend:`, err);
      return false;
    }
  };

  return { modules, loading, error, hasPermission };
}