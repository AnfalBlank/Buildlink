"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { RoleKey, ROLES, RoleDefinition, roleLabelToKey } from "@/lib/roles";
import { users } from "@/lib/dummy-data";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  roleDefinition: RoleDefinition;
  initials: string;
  department: string;
}

interface AuthContextType {
  user: AuthUser;
  switchRole: (roleKey: RoleKey) => void;
  switchUser: (userId: string) => void;
  allUsers: typeof users;
  isAllowed: (moduleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function resolveUser(userId: string): AuthUser {
  const u = users.find(u => u.id === userId) ?? users[0];
  const roleKey = roleLabelToKey[u.role] ?? "director";
  const roleDef = ROLES[roleKey];
  const initials = u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: roleKey,
    roleDefinition: roleDef,
    initials,
    department: u.department,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>("USR001"); // Default: Director

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mmos_current_user");
    if (stored && users.some(u => u.id === stored)) {
      setUserId(stored);
    }
  }, []);

  const user = resolveUser(userId);

  const switchRole = useCallback((roleKey: RoleKey) => {
    // Find a user with this role, or keep current user but override
    const match = users.find(u => roleLabelToKey[u.role] === roleKey);
    if (match) {
      setUserId(match.id);
      localStorage.setItem("mmos_current_user", match.id);
    }
  }, []);

  const switchUser = useCallback((newUserId: string) => {
    setUserId(newUserId);
    localStorage.setItem("mmos_current_user", newUserId);
  }, []);

  const isAllowed = useCallback((moduleKey: string) => {
    return user.roleDefinition.allowedModules.includes(moduleKey);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, switchRole, switchUser, allUsers: users, isAllowed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
