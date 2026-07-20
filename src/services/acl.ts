import { Module, Permission } from "@/lib/modules";

export class ACLService {
  private static async fetchWithAuth<T>(
    url: string,
    token?: string,
  ): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `ACL request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  static async getAccessibleModules(token: string): Promise<Module[]> {
    return this.fetchWithAuth<Module[]>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/modules`,
      token,
    );
  }

  static async checkPermission(
    token: string,
    moduleId: string,
    action: Permission,
  ): Promise<boolean> {
    const result = await this.fetchWithAuth<{ hasPermission: boolean }>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/check-permission/${moduleId}/${action}`,
      token,
    );
    return result.hasPermission;
  }
}
