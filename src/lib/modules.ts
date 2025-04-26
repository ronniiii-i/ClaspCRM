// src/lib/modules.ts
export type Module = {
  id: string;
  name: string;
  icon: string;
  path: string;
  department?: Department; // If null, it's available to all departments
};

export enum Department {
  ADMINISTRATION = "Administration",
  HUMAN_RESOURCES = "Human Resources",
  SALES = "Sales",
  OPERATIONS = "Operations",
  FINANCE = "Finance",
  IT = "IT",
  CUSTOMER_SERVICE = "Customer Service",
}

export const ALL_MODULES: Module[] = [
  {
    id: "contacts",
    name: "Contact Management",
    icon: "users",
    path: "/contacts",
    department: Department.SALES,
  },
  {
    id: "projects",
    name: "Project Management",
    icon: "folder-kanban",
    path: "/projects",
    department: Department.OPERATIONS,
  },
  {
    id: "hr",
    name: "HR Management",
    icon: "briefcase",
    path: "/hr",
    department: Department.HUMAN_RESOURCES,
  },
  {
    id: "analytics",
    name: "Business Intelligence",
    icon: "bar-chart",
    path: "/analytics",
  },
  {
    id: "accounts",
    name: "Account Management",
    icon: "wallet",
    path: "/accounts",
    department: Department.FINANCE,
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    icon: "truck",
    path: "/supply-chain",
    department: Department.OPERATIONS,
  },
  {
    id: "inventory",
    name: "Materials Inventory",
    icon: "package",
    path: "/inventory",
    department: Department.OPERATIONS,
  },
  {
    id: "admin",
    name: "System Administration",
    icon: "settings",
    path: "/admin",
    department: Department.ADMINISTRATION,
  },
  {
    id: "office",
    name: "Office Admin",
    icon: "home",
    path: "/office",
    department: Department.ADMINISTRATION,
  },
  {
    id: "safety",
    name: "Health & Safety",
    icon: "shield",
    path: "/safety",
    department: Department.HUMAN_RESOURCES,
  },
  {
    id: "users",
    name: "Users",
    icon: "user-round-cog",
    path: "/users",
    department: Department.ADMINISTRATION,
  },
];
