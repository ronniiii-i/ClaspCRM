// src/services/acl.ts
// interface Module {
//   id: string;
//   path: string;
//   name: string;
//   permissions: string[];
// }


// export class ACLService {
//   static async fetchWithAuth<T>(
//     url: string,
//     token: string
//   ): Promise<T> {
//     try {
//       console.log('Fetching with token:', token); // Debug logging
//       const headers: HeadersInit = {
//         "Content-Type": "application/json",
//       }; 
//       if (token) { // Keep this if you still store a client-accessible token or send it
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//       // const response = await fetch(url, {
//       //   headers: {
//       //     Authorization: `Bearer ${token}`,
//       //     "Content-Type": "application/json",
//       //   },
//       // });
//       const response = await fetch(url, {
//         headers: headers,
//         credentials: "include", // THIS IS CRUCIAL for sending cookies
//       });

//       if (!response.ok) {
//         const errorBody = await response.text();
//         console.error('API Error Response:', {
//           status: response.status,
//           statusText: response.statusText,
//           body: errorBody
//         });
//         throw new Error(`ACL API error: ${response.statusText} - ${errorBody}`);
//       }

//       return response.json() as Promise<T>;
//     } catch (error) {
//       console.error('Fetch Error:', error);
//       throw error;
//     }
//   }

//   // private static async fetchWithAuth<T>(
//   //   url: string,
//   //   token: string
//   // ): Promise<T> {
//   //   const response = await fetch(url, {
//   //     headers: {
//   //       Authorization: `Bearer ${token}`,
//   //       "Content-Type": "application/json",
//   //     },
//   //   });

//   //   if (!response.ok) {
//   //     throw new Error(`ACL API error: ${response.statusText}`);
//   //   }

//   //   return response.json() as Promise<T>;
//   // }

//   static async getAccessibleModules(token: string): Promise<Module[]> {
//     return this.fetchWithAuth<Module[]>(
//       `${process.env.NEXT_PUBLIC_API}/auth/acl/modules`,
//       token
//     );
//   }

//   static async checkPermission(
//     token: string,
//     moduleId: string,
//     action: string
//   ): Promise<boolean> {
//     const result = await this.fetchWithAuth<{ hasPermission: boolean }>(
//       `${process.env.NEXT_PUBLIC_API}/auth/acl/check-permission/${moduleId}/${action}`,
//       token
//     );
//     return result.hasPermission;
//   }

//   static async refreshModules(token: string): Promise<void> {
//     await this.fetchWithAuth(
//       `${process.env.NEXT_PUBLIC_API}/auth/acl/refresh-modules`,
//       token
//     );
//   }
// }

import { Module, Permission } from "@/lib/modules"; // Import shared types

export class ACLService {
  // fetchWithAuth is now primarily responsible for ensuring credentials are included
  // The 'token' parameter here is still used to manually add the Authorization header
  // for non-browser-auto-sent requests or as a fallback.
  static async fetchWithAuth<T>(
    url: string,
    token?: string // Make token optional if using httpOnly cookies primarily
  ): Promise<T> {
    try {
      console.log('ACLService: Fetching URL:', url);
      console.log('ACLService: Fetching with token:', token ? token.substring(0, 10) + '...' : 'None (relying on cookie)');

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Manually add Authorization header if token is provided (from localStorage)
      // This is necessary for backend JwtAuthGuard to pick it up if it's not looking in cookies
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers: headers,
        credentials: "include", // Crucial for sending httpOnly cookies from the browser
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('ACLService API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`ACL API error: ${response.statusText} - ${errorBody}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('ACLService Fetch Error:', error);
      throw error;
    }
  }

  // This function might become less used if modules are fetched on login
  static async getAccessibleModules(token: string): Promise<Module[]> {
    return this.fetchWithAuth<Module[]>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/modules`,
      token
    );
  }

  static async checkPermission(
    token: string,
    moduleId: string,
    action: Permission // Use the Permission enum for action
  ): Promise<boolean> {
    const result = await this.fetchWithAuth<{ hasPermission: boolean }>(
      `${process.env.NEXT_PUBLIC_API}/auth/acl/check-permission/${moduleId}/${action}`,
      token
    );
    return result.hasPermission;
  }

  // The refresh-modules endpoint on backend is not exposed in your backend code.
  // If you meant to clear the user's cache, then clearUserCache in FrontendAdapterService is used.
  // The client wouldn't directly call refresh-modules for itself, but rather rely on data from login/verify.
  // If you want to force backend to clear cache, you'd need to expose an endpoint for it.
  // static async refreshModules(token: string): Promise<void> {
  //   await this.fetchWithAuth(
  //     `${process.env.NEXT_PUBLIC_API}/auth/acl/refresh-modules`,
  //     token
  //   );
  // }
}
