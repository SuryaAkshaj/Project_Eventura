"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin.api";

export default function CollegesVerificationPage() {
  const [pendingColleges, setPendingColleges] = useState<any[]>([]);
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [allColleges, setAllColleges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"college" | "club">("college");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"colleges" | "clubs">("colleges");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingCollegesRes, pendingClubsRes, allCollegesRes] = await Promise.all([
        adminApi.getPendingColleges(),
        adminApi.getPendingClubs(),
        adminApi.getAllColleges({ limit: 50 }),
      ]);
      setPendingColleges(pendingCollegesRes.data.data);
      setPendingClubs(pendingClubsRes.data.data);
      setAllColleges(allCollegesRes.data.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (type: "college" | "club", id: string) => {
    setIsProcessing(true);
    try {
      if (type === "college") await adminApi.approveCollege(id);
      else await adminApi.approveClub(id);
      await fetchData();
      setShowComparison(false);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (type: "college" | "club", id: string) => {
    const reason = prompt("Reason for rejection (optional):");
    setIsProcessing(true);
    try {
      if (type === "college") await adminApi.rejectCollege(id, reason || undefined);
      else await adminApi.rejectClub(id, reason || undefined);
      await fetchData();
      setShowComparison(false);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Comparison View ──────────────────────────────────────────────────────
  if (showComparison && selectedItem) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="bg-surface flex justify-between items-center px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
            <button onClick={() => setShowComparison(false)} className="hover:text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Verification Queue
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Side-by-Side Review: {selectedItem.name}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-6xl mx-auto">
            {/* Left: Submission details */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="font-title-md text-title-md text-on-surface mb-4 pb-2 border-b border-outline-variant">Submitted Application</h3>
              <div className="bg-surface-container rounded-xl h-48 flex items-center justify-center border border-outline-variant mb-4">
                <span className="material-symbols-outlined text-[48px] text-outline">description</span>
              </div>
              <div className="space-y-3 text-body-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="uppercase font-label-sm">Name</span>
                  <span className="text-primary font-semibold">{selectedItem.name}</span>
                </div>
                {selectedItem.domain && (
                  <div className="flex justify-between">
                    <span className="uppercase font-label-sm">Domain</span>
                    <span>{selectedItem.domain}</span>
                  </div>
                )}
                {selectedItem.college && (
                  <div className="flex justify-between">
                    <span className="uppercase font-label-sm">Parent College</span>
                    <span>{selectedItem.college.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="uppercase font-label-sm">Submitted By</span>
                  <span>{selectedItem.roleAssignments?.[0]?.user?.email ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase font-label-sm">Date</span>
                  <span>{new Date(selectedItem.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Right: Existing approved colleges for comparison */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="font-title-md text-title-md text-on-surface mb-4 pb-2 border-b border-outline-variant">Approved Institutions</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allColleges.filter(c => c.approvalStatus === "APPROVED").slice(0, 8).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-surface-container rounded-lg">
                    <div>
                      <p className="font-body-md text-on-surface font-semibold">{c.name}</p>
                      <p className="font-label-sm text-on-surface-variant">{c.domain}</p>
                    </div>
                    <span className="font-label-sm text-label-sm bg-[#f0f9f1] text-[#2e7d32] px-2 py-0.5 rounded-full border border-[#c6e5ca]">Approved</span>
                  </div>
                ))}
                {allColleges.filter(c => c.approvalStatus === "APPROVED").length === 0 && (
                  <p className="text-on-surface-variant font-body-md text-center py-4">No approved institutions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-6xl mx-auto mt-lg flex gap-3">
            <button
              onClick={() => handleApprove(selectedType, selectedItem.id)}
              disabled={isProcessing}
              className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {isProcessing ? "Processing…" : "Approve"}
            </button>
            <button
              onClick={() => setShowComparison(false)}
              disabled={isProcessing}
              className="flex-1 border border-outline-variant text-on-surface font-label-sm text-label-sm py-3 rounded-lg hover:bg-surface-variant transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => handleReject(selectedType, selectedItem.id)}
              disabled={isProcessing}
              className="flex-1 border border-error text-error font-label-sm text-label-sm py-3 rounded-lg hover:bg-error-container/20 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Queue View ──────────────────────────────────────────────────────
  const currentList = activeTab === "colleges" ? pendingColleges : pendingClubs;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="bg-surface flex justify-between items-center px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <span>Admin Console</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Verification Queue</span>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md focus:outline-none focus:border-primary w-64" placeholder="Search organizations..." type="text" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-desktop">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Verification Queue</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Review and approve college and student club credentials.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-lg border-b border-outline-variant">
            <button
              onClick={() => setActiveTab("colleges")}
              className={`flex items-center gap-2 px-4 py-2 font-label-sm text-label-sm border-b-2 transition-colors ${activeTab === "colleges" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
            >
              Colleges
              {pendingColleges.length > 0 && (
                <span className="bg-error-container text-on-error-container text-[11px] px-1.5 py-0.5 rounded-full font-bold">{pendingColleges.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex items-center gap-2 px-4 py-2 font-label-sm text-label-sm border-b-2 transition-colors ${activeTab === "clubs" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
            >
              Clubs
              {pendingClubs.length > 0 && (
                <span className="bg-error-container text-on-error-container text-[11px] px-1.5 py-0.5 rounded-full font-bold">{pendingClubs.length}</span>
              )}
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="font-body-md text-on-surface-variant">Loading…</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-title-md">No pending {activeTab}</p>
                <p className="font-body-md mt-1">All {activeTab} have been reviewed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                      <th className="py-3 px-6 font-semibold">Organization</th>
                      {activeTab === "clubs" && <th className="py-3 px-6 font-semibold">Parent College</th>}
                      <th className="py-3 px-6 font-semibold">Submitted By</th>
                      <th className="py-3 px-6 font-semibold">Date</th>
                      <th className="py-3 px-6 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                    {currentList.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold">{item.name}</div>
                          {item.domain && <div className="text-label-sm text-on-surface-variant">{item.domain}</div>}
                        </td>
                        {activeTab === "clubs" && (
                          <td className="py-4 px-6 text-on-surface-variant">{item.college?.name ?? "—"}</td>
                        )}
                        <td className="py-4 px-6 text-on-surface-variant">
                          {item.roleAssignments?.[0]?.user?.email ?? "—"}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedItem(item); setSelectedType(activeTab === "colleges" ? "college" : "club"); setShowComparison(true); }}
                              className="font-label-sm text-label-sm bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleApprove(activeTab === "colleges" ? "college" : "club", item.id)}
                              disabled={isProcessing}
                              className="font-label-sm text-label-sm border border-[#2e7d32] text-[#2e7d32] px-3 py-1.5 rounded-lg hover:bg-[#f0f9f1] transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(activeTab === "colleges" ? "college" : "club", item.id)}
                              disabled={isProcessing}
                              className="font-label-sm text-label-sm border border-error text-error px-3 py-1.5 rounded-lg hover:bg-error-container/20 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="bg-surface-container-low border-t border-outline-variant p-4 flex justify-between items-center">
              <span className="text-label-sm text-on-surface-variant">Showing {currentList.length} pending {activeTab}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
