"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { registrationsApi } from "@/lib/api/registrations.api";

type ScanState = "idle" | "scanning" | "success" | "duplicate" | "invalid" | "payment_pending";

export default function QRScannerPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const params = useParams();

  // Web Audio API sound feedback
  const playSound = (type: 'success' | 'error' | 'duplicate') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'success') {
        // High pleasant chime
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
      } else if (type === 'duplicate') {
        // Double low buzz
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        // Second buzz
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(180, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.4);
      } else {
        // Error — low single buzz (sawtooth)
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      // Web Audio not supported — silent fail
      console.log('[Scanner] Audio not available');
    }
  };

  const handleScan = async (qrValue: string) => {
    if (isValidating || !qrValue.trim()) return;
    setIsValidating(true);
    setScanState("scanning");

    try {
      // QR value format: `${qrToken}|${nonce}|${registrationId}`
      const parts = qrValue.split('|');
      const qrToken = parts[0];
      const eventId = params.id as string;

      const response = await registrationsApi.validateQR(qrToken, eventId);
      const { result, message, attendee, checkedInAt } = response.data.data;

      setScanResult({ result, message, attendee, checkedInAt });

      // Map result to scan state + audio feedback
      if (result === 'SUCCESS') {
        setScanState('success');
        playSound('success');
      } else if (result === 'DUPLICATE') {
        setScanState('duplicate');
        playSound('duplicate');
      } else if (result === 'PAYMENT_PENDING') {
        setScanState('payment_pending');
        playSound('error');
      } else {
        setScanState('invalid');
        playSound('error');
      }

      // Auto-reset to idle after 3 seconds
      setTimeout(() => {
        setScanState('idle');
        setScanResult(null);
        setIsValidating(false);
        setManualInput('');
      }, 3000);

    } catch (err) {
      setScanState('invalid');
      playSound('error');
      setScanResult({ result: 'INVALID', message: 'Scan failed. Try again.' });
      setTimeout(() => {
        setScanState('idle');
        setScanResult(null);
        setIsValidating(false);
      }, 3000);
    }
  };

  const reset = () => {
    setScanState("idle");
    setScanResult(null);
    setIsValidating(false);
    setManualInput('');
  };

  const feedbackConfig: Record<string, { bg: string; border: string; icon: string; iconColor: string; title: string; sub: string }> = {
    scanning: { bg: "bg-primary/5", border: "border-primary/20", icon: "qr_code_scanner", iconColor: "text-primary", title: "Validating...", sub: "Please wait while we verify the QR code." },
    success: { bg: "bg-[#f0f9f1]", border: "border-[#c6e5ca]", icon: "check_circle", iconColor: "text-[#2e7d32]", title: "Check-In Successful!", sub: "Attendee verified and admitted." },
    duplicate: { bg: "bg-tertiary-fixed/30", border: "border-tertiary-fixed", icon: "warning", iconColor: "text-tertiary", title: "Duplicate Scan", sub: "This ticket has already been scanned." },
    invalid: { bg: "bg-error-container/20", border: "border-error-container", icon: "cancel", iconColor: "text-error", title: "Invalid Ticket", sub: "This ticket is not valid for this event." },
    payment_pending: { bg: "bg-amber-50", border: "border-amber-200", icon: "payment", iconColor: "text-amber-600", title: "Payment Pending", sub: "This attendee has not completed payment." },
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
          <Link href={`/org/events/${params.id}/manage`} className="hover:text-primary">Live Hub</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">QR Scanner</span>
        </div>
        <div className="flex items-center gap-md">
          <Link href={`/org/events/${params.id}/scan-history`} className="font-label-sm text-label-sm border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">history</span>
            History
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="max-w-2xl mx-auto space-y-lg">
          {/* Scanner Viewport */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">QR Scanner</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Scan attendee QR codes for check-in validation.</p>
            </div>

            {/* Camera Viewport Placeholder */}
            {scanState === "idle" && (
              <div className="relative bg-on-surface h-72 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    {/* Corner brackets */}
                    {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4", "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map((cls, i) => (
                      <div key={i} className={`absolute w-8 h-8 border-primary ${cls}`}></div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[64px] text-white/30">qr_code_scanner</span>
                    </div>
                  </div>
                </div>
                <p className="absolute bottom-4 text-white/60 font-label-sm text-label-sm">Camera access required</p>
              </div>
            )}

            {/* Feedback Overlay */}
            {scanState !== "idle" && (() => {
              const cfg = feedbackConfig[scanState];
              if (!cfg) return null;
              return (
                <div className={`${cfg.bg} border-t ${cfg.border} p-xl flex flex-col items-center text-center`}>
                  <span className={`material-symbols-outlined text-[72px] ${cfg.iconColor} mb-4`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{cfg.title}</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
                    {scanResult?.attendee
                      ? `${scanResult.attendee.firstName} ${scanResult.attendee.lastName}`
                      : cfg.sub}
                  </p>
                  {scanResult?.attendee?.email && (
                    <p className="font-body-md text-on-surface-variant mb-4">{scanResult.attendee.email}</p>
                  )}
                  {scanResult?.message && !scanResult?.attendee && (
                    <div className="bg-surface border border-outline-variant rounded-lg px-4 py-2 font-mono text-on-surface mb-6">
                      {scanResult.message}
                    </div>
                  )}
                  {scanState !== 'scanning' && (
                    <button onClick={reset} className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Scan Next
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Manual QR Input for testing */}
            {scanState === "idle" && (
              <div className="p-lg border-t border-outline-variant">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Manual QR Input / Simulate Scan</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste QR value: token|nonce|registrationId"
                    className="flex-1 border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan(manualInput)}
                  />
                  <button
                    onClick={() => handleScan(manualInput)}
                    disabled={!manualInput.trim() || isValidating}
                    className="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Validate
                  </button>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button id="scan-success-btn" onClick={() => handleScan('demo-token|demo-nonce|demo-id')} className="flex-1 bg-[#f0f9f1] border border-[#c6e5ca] text-[#2e7d32] font-label-sm text-label-sm py-2 px-4 rounded-lg hover:bg-[#e0f2e3] transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Simulate Valid
                  </button>
                  <button id="scan-duplicate-btn" onClick={() => { setScanState('duplicate'); setScanResult({ message: 'Already checked in' }); setTimeout(reset, 3000); }} className="flex-1 bg-tertiary-fixed/30 border border-tertiary-fixed text-tertiary font-label-sm text-label-sm py-2 px-4 rounded-lg hover:bg-tertiary-fixed/50 transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    Duplicate
                  </button>
                  <button id="scan-invalid-btn" onClick={() => { setScanState('invalid'); setScanResult({ message: 'Invalid QR code' }); setTimeout(reset, 3000); }} className="flex-1 bg-error-container/20 border border-error-container text-error font-label-sm text-label-sm py-2 px-4 rounded-lg hover:bg-error-container/40 transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    Invalid
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-md">
            {[
              { label: "Admitted", value: "—", color: "text-[#2e7d32]" },
              { label: "Duplicates", value: "—", color: "text-tertiary" },
              { label: "Invalid", value: "—", color: "text-error" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-outline-variant rounded-xl p-4 text-center shadow-sm">
                <p className={`font-headline-lg text-headline-lg ${stat.color}`}>{stat.value}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
