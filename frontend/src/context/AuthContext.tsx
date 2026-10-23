import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "@wimp/shared";
import { api } from "@/lib/api";

export interface DemoAccount {
  label: string;
  roleDescription: string;
  email: string;
  role: "ADMINISTRATOR" | "PROFESSOR" | "STUDENT";
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Prasanna Mam",
    roleDescription: "CSE · Room 127",
    email: "prasanna@vnr.demo",
    role: "PROFESSOR",
  },
  {
    label: "Thirupathi Nanuvala Sir",
    roleDescription: "CSE · Room 201",
    email: "thirupathi.nanuvala@vnr.demo",
    role: "PROFESSOR",
  },
  {
    label: "Akhil Sir",
    roleDescription: "CSE · Room 031",
    email: "akhil@vnr.demo",
    role: "PROFESSOR",
  },
  {
    label: "Student Patel",
    roleDescription: "Undergraduate Student",
    email: "student@vnr.demo",
    role: "STUDENT",
  },
  {
    label: "Admin User",
    roleDescription: "Campus Administrator",
    email: "admin@vnr.demo",
    role: "ADMINISTRATOR",
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<AuthUser>;
  register: (email: string, password?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  quickSwitch: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password = "DemoPass123!"): Promise<AuthUser> => {
    const res = await api.login(email, password);
    await queryClient.cancelQueries();
    queryClient.clear();
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password = "DemoPass123!"): Promise<AuthUser> => {
    const res = await api.register(email, password);
    await queryClient.cancelQueries();
    queryClient.clear();
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.logout();
    queryClient.clear();
    setUser(null);
  };

  const quickSwitch = async (email: string) => {
    await login(email, "DemoPass123!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        quickSwitch,
        refreshUser,
      }}
    >
      <React.Fragment key={user?.id || "guest"}>{children}</React.Fragment>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
