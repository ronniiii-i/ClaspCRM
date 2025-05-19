// src/services/acl.ts
interface Module {
  id: string;
  path: string;
  name: string;
  permissions: string[];
}

export class ACLService {
  static async fetchWithAuth<T>(
    url: string,
    token: string
  ): Promise<T> {
    try {
      console.log('Fetching with token:', token); // Debug logging
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`ACL API error: ${response.statusText} - ${errorBody}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  }

  // private static async fetchWithAuth<T>(
  //   url: string,
  //   token: string
  // ): Promise<T> {
  //   const response = await fetch(url, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`ACL API error: ${response.statusText}`);
  //   }

  //   return response.json() as Promise<T>;
  // }

  static async getAccessibleModules(token: string): Promise<Module[]> {
    return this.fetchWithAuth<Module[]>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/modules`,
      token
    );
  }

  static async checkPermission(
    token: string,
    moduleId: string,
    action: string
  ): Promise<boolean> {
    const result = await this.fetchWithAuth<{ hasPermission: boolean }>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/check-permission/${moduleId}/${action}`,
      token
    );
    return result.hasPermission;
  }

  static async refreshModules(token: string): Promise<void> {
    await this.fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/refresh-modules`,
      token
    );
  }
}
