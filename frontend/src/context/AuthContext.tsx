import React, { createContext, useContext, useEffect, useState } from "react";
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
    label: "Dr. Elena Rivera",
    roleDescription: "Associate Professor (CS Dept)",
    email: "elena.rivera@demo.local",
    role: "PROFESSOR",
  },
  {
    label: "Dr. Marcus Chen",
    roleDescription: "Assistant Professor (Expired Status Demo)",
    email: "marcus.chen@demo.local",
    role: "PROFESSOR",
  },
  {
    label: "Student Patel",
    roleDescription: "Undergraduate Student",
    email: "student.patel@demo.local",
    role: "STUDENT",
  },
  {
    label: "Admin User",
    roleDescription: "Campus Administrator",
    email: "admin@demo.local",
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
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password = "DemoPass123!"): Promise<AuthUser> => {
    const res = await api.register(email, password);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.logout();
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
      {children}
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
