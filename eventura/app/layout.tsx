import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/lib/context/RoleContext";
import QueryProvider from "@/lib/providers/QueryProvider";
import PageTransition from "@/components/ui/PageTransition";
import AuthInitializer from "@/components/auth/AuthInitializer";
import CookieConsent from "@/components/ui/CookieConsent";

export const metadata: Metadata = {
  title: {
    template: "%s | Eventura",
    default: "Eventura — Institutional Event Management",
  },
  description: "Eventura is the premier institutional-grade event management platform for universities and colleges.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Public+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased">
        <QueryProvider>
          <PageTransition />
          <AuthInitializer />
          <RoleProvider>{children}</RoleProvider>
          <CookieConsent />
        </QueryProvider>
      </body>
    </html>
  );
}
