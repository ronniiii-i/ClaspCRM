import { Module, Permission } from "@/lib/modules";
import { apiRequest } from "./api-client";

export interface PermissionSource {
  type: "ROLE" | "GROUP" | "OVERRIDE";
  effect?: "GRANT" | "REVOKE";
  groupId?: string;
  groupName?: string;
}

export interface EffectivePermission {
  moduleId: string;
  permissionType: Permission;
  granted: boolean;
  sources: PermissionSource[];
}

export interface EffectivePermissionsResponse {
  permissions: EffectivePermission[];
  enhanced: boolean;
}

export class ACLService {
  static async getAccessibleModules(token: string): Promise<Module[]> {
    return apiRequest<Module[]>(`/auth/acl/modules`, {
      token,
      errorMessage: "ACL request failed",
    });
  }

  static async checkPermission(
    token: string,
    moduleId: string,
    action: Permission,
  ): Promise<boolean> {
    const result = await apiRequest<{ hasPermission: boolean }>(
      `/auth/acl/check-permission/${encodeURIComponent(moduleId)}/${encodeURIComponent(action)}`,
      { token, errorMessage: "ACL request failed" },
    );
    return result.hasPermission;
  }

  static async getEffectivePermissions(
    token: string,
  ): Promise<EffectivePermissionsResponse> {
    return apiRequest<EffectivePermissionsResponse>(`/auth/acl/permissions`, {
      token,
      errorMessage: "ACL request failed",
    });
  }
}
