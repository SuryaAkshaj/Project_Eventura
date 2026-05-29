"use client";
import { useRouter } from "next/navigation";
import { useRole, type UserRole } from "@/lib/context/RoleContext";

interface RoleSwitcherProps {
  variant?: "navbar" | "sidebar";
}

export default function RoleSwitcher({ variant = "navbar" }: RoleSwitcherProps) {
  const { activeRole, setActiveRole } = useRole();
  const router = useRouter();

  const switchTo = (role: UserRole) => {
    setActiveRole(role);
    if (role === "organiser") {
      router.push("/org/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  if (variant === "sidebar") {
    // Compact version for the dark sidebar
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <p className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider mb-1">
          Active Role
        </p>
        <div className="flex bg-primary-container/30 rounded-lg p-1 gap-1">
          <button
            onClick={() => switchTo("attendee")}
            className={`flex-1 py-1.5 px-3 rounded-md font-label-sm text-label-sm transition-all text-center ${
              activeRole === "attendee"
                ? "bg-white text-primary shadow-sm"
                : "text-primary-fixed-dim hover:text-on-primary"
            }`}
          >
            Attendee
          </button>
          <button
            onClick={() => switchTo("organiser")}
            className={`flex-1 py-1.5 px-3 rounded-md font-label-sm text-label-sm transition-all text-center ${
              activeRole === "organiser"
                ? "bg-white text-primary shadow-sm"
                : "text-primary-fixed-dim hover:text-on-primary"
            }`}
          >
            Organiser
          </button>
        </div>
      </div>
    );
  }

  // Navbar pill variant
  return (
    <div
      className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-full p-1 gap-1"
      title="Switch role"
    >
      <button
        id="role-switch-attendee"
        onClick={() => switchTo("attendee")}
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full font-label-sm text-label-sm transition-all ${
          activeRole === "attendee"
            ? "bg-primary text-on-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className="material-symbols-outlined text-[14px]"
          style={{ fontVariationSettings: activeRole === "attendee" ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        Attendee
      </button>
      <button
        id="role-switch-organiser"
        onClick={() => switchTo("organiser")}
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full font-label-sm text-label-sm transition-all ${
          activeRole === "organiser"
            ? "bg-primary text-on-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className="material-symbols-outlined text-[14px]"
          style={{ fontVariationSettings: activeRole === "organiser" ? "'FILL' 1" : "'FILL' 0" }}
        >
          business_center
        </span>
        Organiser
      </button>
    </div>
  );
}
