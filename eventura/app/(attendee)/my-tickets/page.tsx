"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registrationsApi } from "@/lib/api/registrations.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

// Status badge config mapped from API values
const registrationStatusConfig: Record<string, { label: string; classes: string }> = {
  REGISTERED: { label: "Registered", classes: "bg-primary/10 text-primary border-primary/20" },
  CHECKED_IN: { label: "Checked In", classes: "bg-sky-50 text-sky-700 border-sky-200" },
  WAITLISTED: { label: "Waitlisted", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { label: "Cancelled", classes: "bg-surface-variant text-on-surface-variant border-outline-variant" },
};

const paymentStatusConfig: Record<string, { label: string; classes: string }> = {
  FREE: { label: "Free", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PAID: { label: "Paid", classes: "bg-primary/10 text-primary border-primary/20" },
  PENDING: { label: "Payment Pending", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  REFUNDED: { label: "Refunded", classes: "bg-surface-variant text-on-surface-variant border-outline-variant" },
  FAILED: { label: "Failed", classes: "bg-error-container/20 text-error border-error-container" },
};

interface QRModalData {
  registration: any;
  qrData: any;
  isLoading: boolean;
  error: string;
}

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [qrModalData, setQrModalData] = useState<QRModalData | null>(null);
  const [filter, setFilter] = useState<"all" | "REGISTERED" | "CHECKED_IN" | "WAITLISTED">("all");
  const router = useRouter();

  useEffect(() => {
    registrationsApi.getMyRegistrations()
      .then(res => setRegistrations(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleViewQR = async (registration: any) => {
    setSelectedTicket(registration);
    setQrModalData({ registration, qrData: null, isLoading: true, error: '' });

    try {
      const qrRes = await registrationsApi.getQRData(registration.id);
      setQrModalData({ registration, qrData: qrRes.data.data, isLoading: false, error: '' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to load QR code';
      setQrModalData({ registration, qrData: null, isLoading: false, error: msg });
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setQrModalData(null);
  };

  const filtered = filter === "all"
    ? registrations
    : registrations.filter(r => r.status === filter);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48 mb-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">My Tickets</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          All your registered event tickets in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-xl border-b border-outline-variant pb-4 flex-wrap">
        {(["all", "REGISTERED", "CHECKED_IN", "WAITLISTED"] as const).map((f) => {
          const count = f === "all" ? registrations.length : registrations.filter(r => r.status === f).length;
          const label = f === "all" ? "All" : f === "REGISTERED" ? "Registered" : f === "CHECKED_IN" ? "Checked In" : "Waitlisted";
          return (
            <button
              key={f}
              id={`ticket-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`font-label-sm text-label-sm px-5 py-2 rounded-full transition-all capitalize ${
                filter === f
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
        <div className="ml-auto">
          <Link
            href="/events"
            className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Find More Events
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-outline">confirmation_number</span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface mb-2">No tickets found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            {filter === "all" ? "Register for events to see your tickets here." : `No ${filter.toLowerCase().replace('_', ' ')} tickets.`}
          </p>
          <Link href="/events" className="font-label-sm text-label-sm bg-primary text-on-primary px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {filtered.map((registration) => {
            const statusCfg = registrationStatusConfig[registration.status] ?? registrationStatusConfig['REGISTERED'];
            const paymentCfg = paymentStatusConfig[registration.paymentStatus] ?? paymentStatusConfig['FREE'];
            const event = registration.event;
            const isCheckedIn = registration.status === 'CHECKED_IN';
            const isCancelled = registration.status === 'CANCELLED';

            return (
              <div
                key={registration.id}
                className={`bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow ${isCancelled ? "opacity-60" : ""}`}
              >
                {/* Event Image / Banner */}
                <div className="relative h-40 bg-surface-variant overflow-hidden">
                  {event?.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/40 to-secondary-container/40">
                      <span className="material-symbols-outlined text-[48px] text-primary/30">event</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusCfg.classes}`}>
                      {registration.status === 'CHECKED_IN' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      )}
                      {statusCfg.label}
                    </span>
                  </div>
                  {/* Category */}
                  {event?.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className="font-label-sm text-label-sm text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                        {event.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ticket Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-title-md text-title-md text-on-surface mb-3 leading-snug">
                    {event?.title ?? 'Event'}
                  </h3>
                  <div className="space-y-1.5 text-body-md text-on-surface-variant mb-3">
                    {event?.startDate && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          calendar_month
                        </span>
                        {formatDate(event.startDate)}
                      </div>
                    )}
                    {event?.venue && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          location_on
                        </span>
                        {event.venue}
                      </div>
                    )}
                    {event?.college?.name && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          account_balance
                        </span>
                        {event.college.name}
                      </div>
                    )}
                  </div>

                  {/* Payment badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center font-label-sm text-label-sm px-2.5 py-1 rounded-full border ${paymentCfg.classes}`}>
                      {paymentCfg.label}
                    </span>
                  </div>

                  {/* Ticket perforated divider */}
                  <div className="relative flex items-center my-4">
                    <div className="w-4 h-4 rounded-full bg-surface-container-low border border-outline-variant -ml-8 shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-outline-variant mx-1" />
                    <div className="w-4 h-4 rounded-full bg-surface-container-low border border-outline-variant -mr-8 shrink-0" />
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">
                        Registration ID
                      </p>
                      <p className="font-mono font-bold text-primary text-[13px]">
                        {registration.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <button
                      id={`view-qr-${registration.id}`}
                      onClick={() => handleViewQR(registration)}
                      disabled={isCheckedIn || isCancelled || registration.paymentStatus === 'PENDING'}
                      className="bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        qr_code
                      </span>
                      View QR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-sm bg-surface border-outline-variant">
          <DialogHeader>
            <DialogTitle className="font-headline-md text-headline-md text-on-surface">
              Your Entry Ticket
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              {selectedTicket?.event?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-4">
            {qrModalData?.isLoading && (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-surface-container-low rounded-lg border border-outline-variant animate-pulse">
                <span className="material-symbols-outlined text-[48px] text-outline">qr_code</span>
              </div>
            )}

            {qrModalData?.error && (
              <div className="w-full bg-error-container/20 border border-error-container rounded-lg p-4 text-center">
                <p className="font-body-md text-error">{qrModalData.error}</p>
              </div>
            )}

            {qrModalData?.qrData && !qrModalData.isLoading && (
              <div className="bg-white p-4 rounded-xl border border-outline-variant">
                <QRCodeSVG
                  value={`${qrModalData.qrData.qrToken}|${qrModalData.qrData.nonce}|${qrModalData.qrData.registrationId}`}
                  size={200}
                  level="M"
                />
              </div>
            )}

            {qrModalData?.qrData && (
              <>
                <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p className="font-body-md text-on-surface font-medium">
                    {registrationStatusConfig[qrModalData.qrData.status]?.label ?? qrModalData.qrData.status}
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 text-sm">
                  {qrModalData.qrData.eventDate && (
                    <div className="bg-surface-container rounded-lg p-3">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Date</p>
                      <p className="font-body-md text-on-surface font-medium">{formatDate(qrModalData.qrData.eventDate)}</p>
                    </div>
                  )}
                  {qrModalData.qrData.venue && (
                    <div className="bg-surface-container rounded-lg p-3">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Venue</p>
                      <p className="font-body-md text-on-surface font-medium truncate">{qrModalData.qrData.venue}</p>
                    </div>
                  )}
                </div>

                <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                  Present this QR code at the event entrance for check-in.
                </p>
              </>
            )}

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                onClick={closeModal}
              >
                Close
              </Button>
              {selectedTicket && (
                <Button
                  className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                  onClick={() => router.push(`/my-tickets/${selectedTicket.id}`)}
                >
                  <span className="material-symbols-outlined text-[16px] mr-1">open_in_new</span>
                  Full View
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
