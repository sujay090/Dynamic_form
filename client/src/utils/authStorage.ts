import type { User } from "./types";

export const AuthStorage = {
  // Admin storage
  admin: {
    setToken: (token: string) => localStorage.setItem("adminToken", token),
    getToken: () => localStorage.getItem("adminToken"),
    removeToken: () => localStorage.removeItem("adminToken"),
    setUserData: (userData: User) => localStorage.setItem("adminUserData", JSON.stringify(userData)),
    getUserData: (): User | null => {
      const data = localStorage.getItem("adminUserData");
      return data ? JSON.parse(data) : null;
    },
    removeUserData: () => localStorage.removeItem("adminUserData"),
    clear: () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUserData");
    }
  },
  
  // SuperAdmin storage
  superAdmin: {
    setToken: (token: string) => localStorage.setItem("superAdminToken", token),
    getToken: () => localStorage.getItem("superAdminToken"),
    removeToken: () => localStorage.removeItem("superAdminToken"),
    setUserData: (userData: User) => localStorage.setItem("superAdminUserData", JSON.stringify(userData)),
    getUserData: (): User | null => {
      const data = localStorage.getItem("superAdminUserData");
      return data ? JSON.parse(data) : null;
    },
    removeUserData: () => localStorage.removeItem("superAdminUserData"),
    clear: () => {
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("superAdminUserData");
    }
  },
  
  // Legacy storage (for backward compatibility)
  legacy: {
    getToken: () => localStorage.getItem("token"),
    getUserData: (): User | null => {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    },
    clear: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    }
  }
};
