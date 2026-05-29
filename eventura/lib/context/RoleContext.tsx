"use client";
import { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "attendee" | "organiser";

interface RoleContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  toggleRole: () => void;
  hasMultipleRoles: boolean;
}

const RoleContext = createContext<RoleContextType>({
  activeRole: "attendee",
  setActiveRole: () => {},
  toggleRole: () => {},
  hasMultipleRoles: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>("attendee");

  const toggleRole = useCallback(() => {
    setActiveRole((prev) => (prev === "attendee" ? "organiser" : "attendee"));
  }, []);

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        toggleRole,
        hasMultipleRoles: true, // In real app, derive from user profile
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
