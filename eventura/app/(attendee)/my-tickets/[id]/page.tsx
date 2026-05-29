'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { registrationsApi } from '@/lib/api/registrations.api';
import { QRCodeSVG } from 'qrcode.react';

const registrationStatusConfig: Record<string, { label: string; badgeClass: string }> = {
  REGISTERED: { label: 'Registered', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
  CHECKED_IN: { label: 'Checked In', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  WAITLISTED: { label: 'Waitlisted', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELLED: { label: 'Cancelled', badgeClass: 'bg-error-container/20 text-error border-error-container' },
};

export default function TicketDetailPage() {
  const [qrData, setQrData] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const [regRes, qrRes] = await Promise.all([
          registrationsApi.getRegistrationById(params.id as string),
          registrationsApi.getQRData(params.id as string),
        ]);
        setRegistration(regRes.data.data);
        setQrData(qrRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load ticket');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();

    // Refresh QR nonce every 55 seconds (nonce expires every 60s)
    const interval = setInterval(async () => {
      try {
        const qrRes = await registrationsApi.getQRData(params.id as string);
        setQrData(qrRes.data.data);
      } catch (err) {
        console.error('QR refresh failed', err);
      }
    }, 55000);

    return () => clearInterval(interval);
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this registration? This cannot be undone.')) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await registrationsApi.cancelRegistration(params.id as string);
      router.push('/my-tickets');
    } catch (err: any) {
      setCancelError(err.response?.data?.error?.message || 'Cancellation failed. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // QR value = combine token + nonce for security
  const qrValue = qrData ? `${qrData.qrToken}|${qrData.nonce}|${qrData.registrationId}` : '';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-grow w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-md" />
        <div className="h-64 bg-gray-200 rounded-xl mb-md" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-grow w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4 block">error_outline</span>
          <p className="font-title-md text-title-md text-on-surface mb-4">{error}</p>
          <Link href="/my-tickets" className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1 justify-center">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  const event = registration?.event;
  const statusCfg = registrationStatusConfig[registration?.status] ?? registrationStatusConfig['REGISTERED'];

  return (
    <div className="flex-grow w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Breadcrumb */}
      <nav className="flex items-center text-body-md text-secondary mb-md">
        <Link href="/my-tickets" className="hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          My Tickets
        </Link>
      </nav>

      {/* Main Ticket Card */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {/* Header — Deep Indigo background (matching design system) */}
        <div className="p-xl text-center" style={{ background: 'linear-gradient(135deg, #2E3192 0%, #1a1d7a 100%)' }}>
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center font-label-sm text-label-sm px-3 py-1 rounded-full border backdrop-blur-sm ${statusCfg.badgeClass}`}>
              {statusCfg.label}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-white mb-2 leading-snug">
            {event?.title ?? 'Event Ticket'}
          </h1>
          {event?.college?.name && (
            <p className="font-body-md text-body-md text-white/70">{event.college.name}</p>
          )}
        </div>

        {/* QR Code Section */}
        <div className="p-xl flex flex-col items-center border-b border-outline-variant">
          {qrData && qrValue ? (
            <>
              <div className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm mb-3">
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  level="M"
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                Refreshes every 60 seconds — present at entry
              </p>
            </>
          ) : (
            <div className="w-[256px] h-[256px] flex flex-col items-center justify-center bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-[64px] text-outline mb-2">qr_code</span>
              <p className="font-body-md text-on-surface-variant text-center px-4">
                {registration?.paymentStatus === 'PENDING'
                  ? 'Complete payment to unlock QR code'
                  : 'QR code unavailable'}
              </p>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event?.startDate && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  Date
                </p>
                <p className="font-body-md text-on-surface font-medium">{formatDate(event.startDate)}</p>
                <p className="font-body-sm text-on-surface-variant mt-0.5">{formatTime(event.startDate)}</p>
              </div>
            )}
            {event?.venue && (
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  Venue
                </p>
                <p className="font-body-md text-on-surface font-medium">{event.venue}</p>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">Payment</p>
              <p className="font-body-md text-on-surface font-medium">{registration?.paymentStatus ?? 'N/A'}</p>
            </div>
            {registration?.payment?.amount > 0 && (
              <p className="font-headline-md text-headline-md text-primary">₹{registration.payment.amount}</p>
            )}
          </div>

          {/* Registration ID */}
          <div className="bg-surface-container-low rounded-xl p-4 text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Registration ID</p>
            <p className="font-mono font-bold text-primary text-[16px] tracking-widest">{registration?.id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-lg pt-0 space-y-3">
          {cancelError && (
            <p className="text-sm text-red-500 text-center">{cancelError}</p>
          )}
          <Link
            href="/my-tickets"
            className="w-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm py-3 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to My Tickets
          </Link>
          {registration?.status === 'REGISTERED' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full border border-error-container text-error font-label-sm text-label-sm py-3 rounded-xl hover:bg-error-container/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              {isCancelling ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
