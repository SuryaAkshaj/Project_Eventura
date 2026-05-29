"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth.api";

interface SidebarLink {
  href: string;
  icon: string;
  label: string;
}

const navLinks: SidebarLink[] = [
  { href: "/org/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/org/events", icon: "event", label: "My Events" },
  { href: "/org/members", icon: "group", label: "Members" },
  { href: "/org/payments", icon: "payments", label: "Payouts" },
  { href: "/org/analytics", icon: "bar_chart", label: "Analytics" },
  { href: "/org/settings", icon: "settings", label: "Settings" },
];

const bottomLinks: SidebarLink[] = [
  { href: "/org/support", icon: "contact_support", label: "Support" },
];

export default function OrgSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    document.cookie = "eventura-auth=; path=/; max-age=0";
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-primary text-on-primary border-r border-outline-variant shrink-0 z-20">
      {/* Logo / Org Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-primary-container/30">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            school
          </span>
        </div>
        <div>
          <h2 className="font-bold text-on-primary text-[16px] leading-tight">Eventura Admin</h2>
          <p className="font-label-sm text-label-sm text-primary-fixed-dim">State University</p>
        </div>
      </div>

      {/* Role Switcher */}
      <RoleSwitcher variant="sidebar" />

      {/* New Event CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/org/events/create"
          className="w-full bg-white text-primary font-label-sm text-label-sm py-2.5 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          New Event
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg mx-2 my-0.5 px-4 py-2.5 transition-colors ${
              isActive(link.href)
                ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                : "text-primary-fixed-dim hover:bg-primary-container/20 hover:text-on-primary"
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive(link.href) ? "'FILL' 1" : "'FILL' 0" }}
            >
              {link.icon}
            </span>
            <span className="font-body-md text-body-md">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Links + Logout */}
      <div className="p-4 border-t border-primary-container/30 space-y-0.5">
        {bottomLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 text-primary-fixed-dim mx-2 px-4 py-2.5 hover:bg-primary-container/20 transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
            <span className="font-body-md text-body-md">{link.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-3 text-primary-fixed-dim mx-2 px-4 py-2.5 hover:bg-primary-container/20 transition-colors rounded-lg w-full">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-body-md text-body-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
