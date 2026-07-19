"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggleIcon } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth.api";

const navLinks = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/events", icon: "event", label: "Events" },
  { href: "/admin/colleges", icon: "admin_panel_settings", label: "Verification" },
  { href: "/admin/users", icon: "people", label: "Users" },
  { href: "/admin/audit", icon: "history", label: "Audit Log" },
  { href: "/admin/health", icon: "bar_chart", label: "Health" },
  { href: "/admin/settings", icon: "settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuth();
      document.cookie = "eventura-auth=; path=/; max-age=0";
      router.push("/login");
    }
  };

  return (
    <nav className="bg-primary text-on-primary h-full w-64 shadow-sm flex flex-col border-r border-outline-variant flex-shrink-0 z-20">
      <div className="p-lg border-b border-primary-container">
        <Link href="/admin/profile" className="flex items-center gap-md hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <div>
            <h1 className="font-bold text-on-primary text-[18px]">Eventura Admin</h1>
            <p className="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-md">
        <ul className="space-y-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-md mx-2 my-1 px-4 py-3 rounded-lg transition-colors font-body-md text-body-md ${
                    isActive
                      ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                      : "text-primary-fixed-dim hover:bg-primary-container/20"
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-md border-t border-primary-container">
        <div className="flex items-center justify-between px-4 py-2 mb-1">
          <span className="text-xs text-primary-fixed-dim">Theme</span>
          <ThemeToggleIcon className="text-primary-fixed-dim" />
        </div>
        <ul className="space-y-sm">
          <li>
            <Link
              href="/admin/support"
              className="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined">contact_support</span>
              Support
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-md text-primary-fixed-dim mx-2 my-1 px-4 py-2 rounded-lg hover:bg-primary-container/20 transition-colors font-label-sm text-label-sm w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
