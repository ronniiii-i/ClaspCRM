import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

export type Permission = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE'; // Or import from a shared types package
export type Role = 'ADMIN' | 'HOD' | 'LEAD' | 'STAFF'; // Or import

export interface Module {
  id: string;
  path: string;
  name: string;
  permissions: {
    [key in Role]?: Permission[]; // Allows for optional roles
  };
  department?: string;
  icon?: string | LucideIcon | undefined;
}

export interface RoleSummary {
  id: string;
  name: string;
  slug: string;
  rank?: number;
  dataScope?: string;
  isTenantAdmin?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** Phase 2 returns a role object; older sessions stored an enum string. */
  role: Role | RoleSummary;
  roleId?: string;
  roleEnhanced?: boolean;
  avatar?: string | null;
  avatarUrl?: string | null;
  status?: string;
  isVerified: boolean;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  tenantStatus?: string;
  departmentId?: string | null;
  /** `type` is the canonical DepartmentType enum and is preferred for routing. */
  department: { id: string; name?: string; key?: string; type?: string } | null;
  managedDepartment: { id: string; name?: string; key?: string; type?: string } | null;
  accessibleModules?: Module[];
  createdAt?: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
}

export const getIconComponent = (
  icon: string | LucideIcon | undefined
): LucideIcon => {
  // If it's already a LucideIcon component
  if (typeof icon === "function" && "displayName" in icon) {
    return icon as LucideIcon;
  }

  // If it's a string icon name
  if (typeof icon === "string") {
    const iconName = icon.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
    return (IconComponent as LucideIcon) || LucideIcons.HelpCircle;
  }

  // Fallback
  return LucideIcons.HelpCircle;
};
