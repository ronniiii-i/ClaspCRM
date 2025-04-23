// src/lib/icon-mappings.ts
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Briefcase,
  BarChart,
  Wallet,
  Truck,
  Package,
  Settings,
  Home,
  Shield,
  Calendar,
  FileText,
  UserRoundCog,
} from "lucide-react";

export const iconComponents: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  users: Users,
  "folder-kanban": FolderKanban,
  briefcase: Briefcase,
  "bar-chart": BarChart,
  wallet: Wallet,
  truck: Truck,
  package: Package,
  settings: Settings,
  home: Home,
  shield: Shield,
  calendar: Calendar,
  "file-text": FileText,
  "layout-dashboard": LayoutDashboard,
  "user-round-cog": UserRoundCog,
};

export const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || LayoutDashboard;
};
