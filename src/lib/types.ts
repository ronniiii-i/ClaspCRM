// src/lib/types.ts
export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  department: Department | null;
  managedDepartment: Department | null;
  teamId?: string;
}
