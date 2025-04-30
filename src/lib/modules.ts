import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

export interface Module {
  id: string;
  path: string;
  name: string;
  permissions: string[];
  department?: string;
  icon?: string | LucideIcon | undefined;
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
