"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin.api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings()
      .then(res => setSettings(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <span>Admin Console</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Platform Settings</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-2xl mx-auto space-y-xl">
          <section>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Platform Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Configure global platform behaviour and fee structure.</p>
          </section>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-body-md text-on-surface-variant">Loading settings…</p>
            </div>
          ) : settings ? (
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              {/* Platform Fee Toggle */}
              <div className="p-lg border-b border-outline-variant">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                      <h3 className="font-title-md text-title-md text-on-surface">Platform Fee</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Collect a platform fee on all paid event registrations. When enabled, a percentage of each payment is retained by the platform.
                    </p>
                  </div>
                  <button
                    id="platform-fee-toggle"
                    onClick={() => setSettings({ ...settings, platformFeeEnabled: !settings.platformFeeEnabled })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.platformFeeEnabled ? "bg-primary" : "bg-surface-variant border border-outline-variant"
                    }`}
                    role="switch"
                    aria-checked={settings.platformFeeEnabled}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow-sm transition-transform ${
                        settings.platformFeeEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Fee Percentage — only shown when fee enabled */}
                {settings.platformFeeEnabled && (
                  <div className="mt-4 pt-4 border-t border-outline-variant">
                    <label htmlFor="fee-percent" className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-2">
                      Fee Percentage
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="fee-percent"
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={settings.platformFeePercent}
                        onChange={e => setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) })}
                        className="w-32 border border-outline-variant rounded-lg px-3 py-2 text-body-md bg-surface-container-lowest focus:outline-none focus:border-primary"
                      />
                      <span className="font-body-md text-on-surface-variant">% (0–10%)</span>
                    </div>
                    <p className="font-label-sm text-on-surface-variant mt-2">
                      At {settings.platformFeePercent}%, a ₹1,000 ticket will yield ₹{(1000 * (1 - settings.platformFeePercent / 100)).toFixed(0)} to the organiser.
                    </p>
                  </div>
                )}
              </div>

              {/* Maintenance Mode */}
              <div className="p-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
                      <h3 className="font-title-md text-title-md text-on-surface">Maintenance Mode</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      When enabled, the platform displays a maintenance page to all non-admin users. Use with caution during deployments or critical fixes.
                    </p>
                    {settings.maintenanceMode && (
                      <div className="mt-2 flex items-center gap-1.5 text-error font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        Maintenance mode is currently ACTIVE — users cannot access the platform
                      </div>
                    )}
                  </div>
                  <button
                    id="maintenance-mode-toggle"
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.maintenanceMode ? "bg-error" : "bg-surface-variant border border-outline-variant"
                    }`}
                    role="switch"
                    aria-checked={settings.maintenanceMode}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow-sm transition-transform ${
                        settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-3">error</span>
              <p className="font-body-md">Failed to load settings</p>
            </div>
          )}

          {/* Save Button */}
          {settings && (
            <div className="flex items-center gap-4">
              <button
                id="save-settings-btn"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
              {saved && (
                <div className="flex items-center gap-1.5 text-[#2e7d32] font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Settings saved successfully
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
