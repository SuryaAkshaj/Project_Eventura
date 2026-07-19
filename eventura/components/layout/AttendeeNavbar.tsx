"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { ThemeToggleIcon } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth.api";

const navLinks = [
  { href: "/events", label: "Discover" },
  { href: "/dashboard", label: "My Events" },
  { href: "/my-tickets", label: "My Tickets" },
  { href: "/certificates", label: "Certificates" },
];

export default function AttendeeNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    document.cookie = "eventura-auth=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-7xl mx-auto">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-lg">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_activity
            </span>
            Eventura
          </Link>
          <nav className="hidden md:flex items-center gap-6 h-full ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body-md text-body-md py-5 transition-colors border-b-2 whitespace-nowrap ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-primary font-semibold border-primary"
                    : "text-on-surface-variant hover:text-primary border-transparent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Role Switcher + Actions + Avatar */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill */}
          <RoleSwitcher variant="navbar" />

          {/* Quick create */}
          <Link
            href="/org/events/create"
            className="hidden md:flex font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-md shadow-sm items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create Event
          </Link>

          {/* Icon strip */}
          <div className="flex items-center gap-1 border-l border-outline-variant pl-3">
            <ThemeToggleIcon />
            <button
              id="nav-notifications-btn"
              onClick={() => alert('Notifications coming soon!')}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant relative"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border border-surface"></span>
            </button>
            <button
              id="nav-help-btn"
              onClick={() => window.open('mailto:support@eventura.app', '_blank')}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant"
              title="Contact Support"
            >
              <span className="material-symbols-outlined text-[22px]">help_outline</span>
            </button>

            {/* Logout button */}
            <button
              id="nav-logout-btn"
              onClick={handleLogout}
              title="Logout"
              className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>

            {/* Avatar — links to profile */}
            <Link
              href="/profile"
              id="nav-profile-link"
              className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border-2 border-outline-variant ml-1 shrink-0 hover:ring-2 hover:ring-primary transition-all"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-container">
                  <span className="material-symbols-outlined text-[16px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    person
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
