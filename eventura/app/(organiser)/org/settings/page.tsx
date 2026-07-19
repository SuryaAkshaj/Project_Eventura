"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { orgApi } from "@/lib/api/org.api";
import { useAuthStore } from "@/lib/store/authStore";

type Tab = "profile" | "branding" | "bank";
type BankStep = "form" | "verifying" | "verified";

export default function OrgSettingsPage() {
  const { activeRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Org Profile state — pre-filled from real API
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [orgType, setOrgType] = useState("Student Club");
  const [orgBio, setOrgBio] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [hasClub, setHasClub] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Branding state
  const [primaryColor, setPrimaryColor] = useState("#15157d");
  const [fontChoice, setFontChoice] = useState("Inter");
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Bank state
  const [bankStep, setBankStep] = useState<BankStep>("form");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  // Load real org data on mount
  useEffect(() => {
    orgApi.getMyOrg()
      .then((res) => {
        const { college, club } = res.data.data;
        setOrgName(college.name ?? "");
        setOrgDomain(college.domain ?? "");
        setWebsite(college.website ?? "");
        setAddress(college.address ?? "");
        if (club) {
          setHasClub(true);
          setClubName(club.name ?? "");
          setClubDescription(club.description ?? "");
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingProfile(false));
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setProfileError("");
    try {
      await orgApi.updateMyOrg({
        website: website || undefined,
        address: address || undefined,
        clubName: clubName || undefined,
        clubDescription: clubDescription || undefined,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.error?.message ?? "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBankVerify = () => {
    setBankStep("verifying");
    setTimeout(() => setBankStep("verified"), 2000);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Org Profile", icon: "business" },
    { id: "branding", label: "Branding", icon: "palette" },
    { id: "bank", label: "Bank Account", icon: "account_balance" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex items-center px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="font-label-sm text-label-sm text-on-surface-variant">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
          <span className="text-primary font-bold">Settings</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-desktop">
        <div className="max-w-3xl mx-auto space-y-xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Organisation Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your organisation profile, branding, and financial details.</p>
          </div>

          {/* Custom Tab Bar */}
          <div className="flex bg-surface border border-outline-variant rounded-xl p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg font-label-sm text-label-sm transition-all justify-center ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Org Profile Tab ────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="font-title-md text-title-md text-on-surface">Organisation Profile</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">This information is shown on your public events page.</p>
              </div>

              {/* Success / Error banners */}
              {profileSaved && (
                <div className="mx-lg mt-lg p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Settings saved successfully
                </div>
              )}
              {profileError && (
                <div className="mx-lg mt-lg p-3 bg-error-container border border-error/30 rounded-lg text-on-error-container text-sm">
                  {profileError}
                </div>
              )}

              {isLoadingProfile ? (
                <div className="p-lg space-y-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-surface-container rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="p-lg space-y-6">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl bg-primary-container/20 border-2 border-dashed border-outline-variant flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[32px] text-outline">add_photo_alternate</span>
                    </div>
                    <div>
                      <p className="font-body-md text-on-surface font-semibold mb-1">Organisation Logo</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-3">PNG or SVG, max 2MB. Displayed on event pages and certificates.</p>
                      <Button variant="outline" className="border-outline-variant text-on-surface-variant hover:bg-surface-variant h-9 px-4 font-label-sm text-label-sm" onClick={() => alert("Logo upload functionality coming soon!")}>
                        <span className="material-symbols-outlined text-[16px] mr-1.5">upload</span>
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                  <Separator className="bg-outline-variant" />

                  {/* College info — name + domain are read-only */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">College Name</Label>
                      <Input id="org-name" value={orgName} readOnly className="border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed" />
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Contact Super Admin to change college name</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Domain</Label>
                      <Input value={orgDomain} readOnly className="border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="org-website" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Website URL</Label>
                      <Input
                        id="org-website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourorg.com"
                        className="border-outline-variant focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-address" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Address</Label>
                      <Input
                        id="org-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Organisation address"
                        className="border-outline-variant focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Club section — only for Club Presidents */}
                  {hasClub && activeRole === "CLUB_PRESIDENT" && (
                    <>
                      <Separator className="bg-outline-variant" />
                      <div>
                        <p className="font-title-sm text-title-sm text-on-surface mb-4">Club Information</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="club-name" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Club Name</Label>
                            <Input
                              id="club-name"
                              value={clubName}
                              onChange={(e) => setClubName(e.target.value)}
                              placeholder="Team name"
                              className="border-outline-variant focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="club-description" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Club Description</Label>
                          <textarea
                            id="club-description"
                            value={clubDescription}
                            onChange={(e) => setClubDescription(e.target.value)}
                            placeholder="Tell attendees about your team..."
                            rows={3}
                            className="w-full border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="p-lg border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                <Button variant="outline" className="border-outline-variant text-on-surface-variant" onClick={() => window.location.reload()}>Reset</Button>
                <Button
                  id="save-profile-btn"
                  onClick={handleSaveProfile}
                  disabled={isSaving || isLoadingProfile}
                  className="bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-60"
                >
                  {profileSaved
                    ? <><span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>Saved!</>
                    : isSaving ? "Saving..."
                    : "Save Changes"
                  }
                </Button>
              </div>
            </div>
          )}

          {/* ── Branding Tab ────────────────────────────────────────────────── */}
          {activeTab === "branding" && (
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="font-title-md text-title-md text-on-surface">Brand Customisation</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Customize how your events appear to attendees.</p>
              </div>
              <div className="p-lg space-y-8">
                {/* Color Picker */}
                <div className="space-y-3">
                  <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Primary Brand Color</Label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <input id="brand-color-picker" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer p-1" />
                    <div className="flex flex-col gap-1">
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-32 font-mono border-outline-variant focus-visible:ring-primary uppercase" />
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Used on buttons, badges, certificates</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["#15157d", "#1a5cad", "#2e7d32", "#735c00", "#ba1a1a"].map((c) => (
                        <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? "border-on-surface scale-110 shadow" : "border-transparent hover:scale-110"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                <Separator className="bg-outline-variant" />
                {/* Font Selection */}
                <div className="space-y-3">
                  <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Display Font</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ name: "Inter", preview: "Aa" }, { name: "Public Sans", preview: "Aa" }, { name: "System UI", preview: "Aa" }].map((font) => (
                      <label key={font.name} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${fontChoice === font.name ? "border-primary bg-primary/5" : "border-outline-variant hover:bg-surface-container-low"}`}>
                        <input type="radio" name="font" value={font.name} checked={fontChoice === font.name} onChange={() => setFontChoice(font.name)} className="sr-only" />
                        <span className="text-4xl font-bold text-on-surface">{font.preview}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{font.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Separator className="bg-outline-variant" />
                {/* Live Preview */}
                <div className="space-y-3">
                  <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Live Preview</Label>
                  <div className="rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                    <div className="h-14" style={{ backgroundColor: primaryColor }} />
                    <div className="p-4 bg-surface">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-on-surface text-[16px]">{orgName}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{orgType}</p>
                        </div>
                        <button className="font-label-sm text-label-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: primaryColor }}>
                          Register
                        </button>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">{orgBio.slice(0, 90)}…</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-lg border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
                <Button id="save-branding-btn" onClick={() => { setBrandingSaved(true); setTimeout(() => setBrandingSaved(false), 3000); }} className="bg-primary text-on-primary hover:bg-primary/90">
                  {brandingSaved ? <><span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>Saved!</> : "Apply Branding"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Bank Account Tab ─────────────────────────────────────────────── */}
          {activeTab === "bank" && (
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="font-title-md text-title-md text-on-surface">Bank Account</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Link your bank account to receive payouts from paid events.</p>
              </div>
              <div className="p-lg">
                {bankStep === "form" && (
                  <div className="space-y-5 max-w-md">
                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="font-body-md text-body-md text-on-surface">Your bank details are encrypted and stored securely. Payouts are processed within 3–5 business days after each event.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-holder" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Account Holder Name</Label>
                      <Input id="account-holder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Full legal name on account" className="border-outline-variant focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Bank Account Number</Label>
                      <Input id="account-number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="XXXX XXXX XXXX" className="border-outline-variant focus-visible:ring-primary font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">IFSC Code</Label>
                      <Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="e.g., SBIN0001234" maxLength={11} className="border-outline-variant focus-visible:ring-primary font-mono uppercase" />
                    </div>
                    <Button id="verify-bank-settings-btn" onClick={handleBankVerify} className="w-full bg-primary text-on-primary hover:bg-primary/90 h-11" disabled={!accountHolder || !accountNumber || !ifsc}>
                      <span className="material-symbols-outlined text-[18px] mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verify & Connect Bank Account
                    </Button>
                  </div>
                )}
                {bankStep === "verifying" && (
                  <div className="flex flex-col items-center gap-5 py-12">
                    <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-[32px] text-primary">account_balance</span>
                    </div>
                    <div className="text-center">
                      <p className="font-title-md text-title-md text-on-surface mb-1">Verifying Account</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Confirming account details with the banking network...</p>
                    </div>
                  </div>
                )}
                {bankStep === "verified" && (
                  <div className="flex flex-col items-center gap-5 py-8 max-w-sm mx-auto text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Bank Account Verified!</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-4">Your bank account has been verified. Payouts will be deposited automatically after each paid event.</p>
                    </div>
                    <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-left space-y-2">
                      <div className="flex justify-between font-body-md text-body-md">
                        <span className="text-on-surface-variant">Account Holder</span>
                        <span className="text-on-surface font-medium">{accountHolder}</span>
                      </div>
                      <div className="flex justify-between font-body-md text-body-md">
                        <span className="text-on-surface-variant">Account Number</span>
                        <span className="text-on-surface font-mono">••••{accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between font-body-md text-body-md">
                        <span className="text-on-surface-variant">IFSC</span>
                        <span className="text-on-surface font-mono">{ifsc}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setBankStep("form")} className="border-outline-variant text-on-surface-variant">Update Account</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
