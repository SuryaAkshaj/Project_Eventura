import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface font-body-md text-on-surface">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">{children}</main>
    </div>
  );
}
