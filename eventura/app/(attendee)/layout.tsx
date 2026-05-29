import AttendeeNavbar from "@/components/layout/AttendeeNavbar";

export default function AttendeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AttendeeNavbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-surface-container-low border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-lg max-w-7xl mx-auto gap-4">
          <div className="font-bold text-primary text-[20px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
            Eventura
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">Terms of Service</a>
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">Privacy Policy</a>
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">Institutional Support</a>
            <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all">API Documentation</a>
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura.</div>
        </div>
      </footer>
    </div>
  );
}
