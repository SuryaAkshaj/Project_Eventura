import OrgSidebar from "@/components/layout/OrgSidebar";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      <OrgSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">{children}</main>
    </div>
  );
}
