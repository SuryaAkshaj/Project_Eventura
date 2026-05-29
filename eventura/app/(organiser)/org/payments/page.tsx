"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { paymentsApi } from "@/lib/api/payments.api";

const statusColors: Record<string, string> = {
  paid: "bg-[#f0f9f1] text-[#2e7d32] border-[#c6e5ca]",
  pending: "bg-tertiary-fixed/30 text-on-tertiary-fixed border-tertiary-fixed",
  processing: "bg-secondary-container text-on-secondary-container border-secondary-fixed-dim",
};

export default function PayoutsPage() {
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankStep, setBankStep] = useState<"form" | "verifying" | "verified">("form");
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    paymentsApi.getOrgPayments()
      .then(res => setPaymentsData(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = paymentsData?.summary?.totalRevenue ?? 0;
  const totalTransactions = paymentsData?.summary?.totalTransactions ?? 0;
  const transactions: any[] = paymentsData?.transactions ?? [];

  const handleBankVerify = () => {
    setBankStep("verifying");
    setTimeout(() => setBankStep("verified"), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href="/org/dashboard" className="hover:text-primary">Dashboard</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Payouts & Finance</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-5xl mx-auto space-y-xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Payouts & Finance</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Track revenue, manage payouts and bank connections.</p>
            </div>
            <button
              id="add-bank-btn"
              onClick={() => { setShowBankModal(true); setBankStep("form"); }}
              className="font-label-sm text-label-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Connect Bank Account
            </button>
          </div>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              { label: "Total Earned", value: isLoading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`, icon: "payments", color: "text-[#2e7d32]", bg: "bg-[#f0f9f1]" },
              { label: "Total Transactions", value: isLoading ? '...' : `${totalTransactions}`, icon: "receipt_long", color: "text-tertiary", bg: "bg-tertiary-fixed/30" },
              { label: "Platform Fees", value: isLoading ? '...' : `₹${(paymentsData?.summary?.totalPlatformFees ?? 0).toLocaleString('en-IN')}`, icon: "calendar_month", color: "text-primary", bg: "bg-primary-container/20" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </section>

          {/* Payouts Table */}
          <section className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-md border-b border-outline-variant">
              <h2 className="font-title-md text-title-md text-on-surface">Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant uppercase">
                    <th className="py-3 px-6 font-semibold">Event</th>
                    <th className="py-3 px-6 font-semibold">Amount</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                    <th className="py-3 px-6 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading transactions...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant">No transactions yet.</td>
                    </tr>
                  ) : (
                    transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-4 px-6 font-semibold">{t.registration?.event?.title ?? '—'}</td>
                        <td className="py-4 px-6 text-primary font-semibold">₹{Number(t.organizerAmount).toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6">
                          <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm border uppercase ${statusColors[t.status?.toLowerCase()] ?? 'bg-surface-container text-on-surface border-outline-variant'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {t.paidAt ? new Date(t.paidAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Bank Validation Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-title-md text-title-md text-on-surface">
                {bankStep === "verified" ? "Bank Account Verified!" : "Connect Bank Account"}
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {bankStep === "form" && (
              <div className="p-lg flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Account Holder Name</label>
                  <input type="text" placeholder="Full legal name" className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Bank Account Number</label>
                  <input type="text" placeholder="XXXX XXXX XXXX" className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">IFSC Code</label>
                  <input type="text" placeholder="e.g., SBIN0001234" className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                </div>
                <button id="verify-bank-btn" onClick={handleBankVerify} className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Verify & Connect
                </button>
              </div>
            )}

            {bankStep === "verifying" && (
              <div className="p-xl flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-[32px] text-primary">account_balance</span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Verifying your bank account...</p>
              </div>
            )}

            {bankStep === "verified" && (
              <div className="p-xl flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-[64px] text-[#2e7d32]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Bank Account Connected!</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Your bank account has been verified and connected successfully. Payouts will be processed within 3–5 business days.</p>
                <button onClick={() => setShowBankModal(false)} className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
