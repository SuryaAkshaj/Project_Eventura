"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";
import { registrationsApi } from "@/lib/api/registrations.api";
import { paymentsApi } from "@/lib/api/payments.api";
import { useRazorpay } from "@/lib/hooks/useRazorpay";
import { useAuthStore } from "@/lib/store/authStore";

export default function EventDetailPage() {
  const [isPurchased, setIsPurchased] = useState(false);
  const [ticketType, setTicketType] = useState("general");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { openCheckout } = useRazorpay();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const params = useParams();
  const router = useRouter();

  const { data: eventData, isLoading, error: eventError } = useQuery({
    queryKey: ['event', params.id],
    queryFn: () => eventsApi.getEventById(params.id as string),
    staleTime: 1000 * 60 * 5,
  });

  const event = eventData?.data?.data;
  const error = eventError ? (eventError as any)?.response?.status === 404 ? 'Event not found' : 'Failed to load event' : '';

  // Check if already registered on load
  useEffect(() => {
    if (!isAuthenticated || !event) return;
    registrationsApi.getMyRegistrations()
      .then(res => {
        const existing = res.data.data.find((r: any) => r.eventId === event.id && r.status !== 'CANCELLED');
        if (existing) {
          setIsPurchased(true);
          setRegistrationId(existing.id);
          setIsWaitlisted(existing.status === 'WAITLISTED');
        }
      })
      .catch(() => {});
  }, [event, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${params.id}`);
      return;
    }
    setIsRegistering(true);
    setRegistrationError('');
    try {
      // Step 1: Create registration
      const response = await registrationsApi.register(event.id);
      const data = response.data.data;
      setRegistrationId(data.id);

      // Step 2: If free event — done
      if (event.isFree) {
        setIsPurchased(true);
        if (data.waitlisted) setIsWaitlisted(true);
        return;
      }

      // Step 3: Paid event — create Razorpay order and open checkout
      setIsRegistering(false);
      setIsProcessingPayment(true);

      const orderResponse = await paymentsApi.createOrder(data.id);
      const orderData = orderResponse.data.data;

      // If already paid (idempotency check)
      if (orderData.alreadyPaid) {
        setIsPurchased(true);
        setIsProcessingPayment(false);
        return;
      }

      // Step 4: Open Razorpay checkout
      await openCheckout({
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.keyId,
        eventTitle: orderData.eventTitle,
        registrationId: data.id,
        userName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        userEmail: user?.email || '',
        onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
          try {
            await paymentsApi.verifyPayment({
              registrationId: data.id,
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
            });
            setIsPurchased(true);
          } catch (err) {
            setRegistrationError('Payment completed but verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onFailure: (error) => {
          if (error.message !== 'Payment cancelled by user') {
            setRegistrationError('Payment failed. Please try again.');
          }
          setIsProcessingPayment(false);
        },
      });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'ALREADY_REGISTERED') {
        setIsPurchased(true);
      } else {
        setRegistrationError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-md" />
        <div className="w-full h-[300px] md:h-[400px] bg-gray-200 rounded-xl mb-xl" />
        <div className="flex flex-col md:flex-row gap-gutter">
          <div className="w-full md:w-[70%] flex flex-col gap-xl">
            <div className="grid grid-cols-2 gap-md">
              {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
          <div className="w-full md:w-[30%]">
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4 block">error_outline</span>
          <p className="font-title-md text-title-md text-on-surface mb-2">{error}</p>
          <Link href="/events" className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1 justify-center">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const registrations = event._count?.registrations ?? 0;
  const capacity = event.maxCapacity ?? 0;
  const pct = capacity > 0 ? Math.round((registrations / capacity) * 100) : 0;
  const price = event.isFree ? 'Free' : `₹${event.ticketPrice}`;
  const isPublished = event.status === 'PUBLISHED';

  const formattedStart = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';
  const formattedTime = event.startDate
    ? new Date(event.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const formattedEnd = event.endDate
    ? new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';

  if (isPurchased) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm max-w-lg w-full overflow-hidden">
          <div className="bg-primary p-xl text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-primary mb-2">Registration Confirmed!</h1>
            <p className="font-body-md text-body-md text-primary-fixed-dim">Your ticket has been issued and confirmed.</p>
          </div>
          <div className="p-lg space-y-4">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant text-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Ticket Number</p>
              <p className="font-headline-md text-headline-md text-primary font-mono">EV-{Math.floor(Math.random() * 9000) + 1000}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Event</span>
                <span className="font-body-md text-body-md text-on-surface">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Date</span>
                <span className="font-body-md text-body-md text-on-surface">{formattedStart}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Venue</span>
                <span className="font-body-md text-body-md text-on-surface">{event.venue || 'Online'}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Link
                href="/my-tickets"
                className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors text-center shadow-sm"
              >
                View My Tickets
              </Link>
              <button
                onClick={() => setIsPurchased(false)}
                className="flex-1 border border-outline-variant text-on-surface font-label-sm text-label-sm py-3 rounded-lg hover:bg-surface-variant transition-colors"
              >
                Back to Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center text-body-md text-secondary mb-md">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><span className="material-symbols-outlined text-sm">chevron_right</span></li>
          <li><Link href="/events" className="hover:underline">Discover</Link></li>
          <li><span className="material-symbols-outlined text-sm">chevron_right</span></li>
          <li className="text-on-surface font-semibold line-clamp-1">{event.title}</li>
        </ol>
      </nav>

      {/* Cancelled banner */}
      {event.status === 'CANCELLED' && (
        <div className="bg-error-container text-on-error-container rounded-xl p-4 mb-lg flex items-center gap-3">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
          <p className="font-title-md text-title-md">This event has been cancelled.</p>
        </div>
      )}

      {/* Hero */}
      <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden relative mb-xl border border-outline-variant shadow-sm bg-surface-container-low">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/40 to-secondary-container/40">
            <span className="material-symbols-outlined text-[96px] text-primary/30">event</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-lg md:p-xl w-full">
          <div className="flex items-center gap-2 mb-2">
            {event.category && (
              <span className="px-3 py-1 bg-primary/90 text-on-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-white/20">{event.category}</span>
            )}
            {event.format && (
              <span className="px-3 py-1 bg-surface/90 text-primary rounded text-label-sm uppercase tracking-wider backdrop-blur-sm border border-outline-variant">{event.format}</span>
            )}
            {event.status === 'DRAFT' && (
              <span className="px-3 py-1 bg-yellow-100/90 text-yellow-800 rounded text-label-sm uppercase tracking-wider backdrop-blur-sm">Draft</span>
            )}
          </div>
          <h1 className="font-display-lg text-display-lg text-white mb-2 shadow-sm">{event.title}</h1>
          {event.description && (
            <p className="text-white/90 font-title-md text-title-md max-w-2xl line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Left Content */}
        <div className="w-full md:w-[70%] flex flex-col gap-xl">
          {/* Meta Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
              <div className="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              </div>
              <div>
                <h3 className="font-label-sm text-secondary mb-1">Start Date</h3>
                <p className="font-title-md text-on-surface">{formattedStart}</p>
                {formattedTime && <p className="text-body-md text-on-surface-variant mt-1">{formattedTime}</p>}
              </div>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors">
              <div className="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              </div>
              <div>
                <h3 className="font-label-sm text-secondary mb-1">End Date</h3>
                <p className="font-title-md text-on-surface">{formattedEnd}</p>
              </div>
            </div>
            <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-3 hover:border-primary transition-colors sm:col-span-2">
              <div className="p-2 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-label-sm text-secondary mb-1">Venue</h3>
                <p className="font-title-md text-on-surface">{event.venue || event.onlineLink || 'Online'}</p>
                {event.college?.name && <p className="text-body-md text-on-surface-variant mt-1">{event.college.name}</p>}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md pb-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              About This Event
            </h2>
            <div className="text-body-lg text-on-surface-variant space-y-4">
              <p>{event.description || 'No description provided.'}</p>
            </div>
            <div className="mt-lg pt-lg border-t border-outline-variant flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary">account_balance</span>
              </div>
              <div>
                <h4 className="font-label-sm text-secondary uppercase tracking-wide">Organized By</h4>
                <p className="font-title-md text-on-surface">{event.college?.name || 'Unknown'}</p>
                {event.club?.name && (
                  <p className="font-body-md text-on-surface-variant">{event.club.name}</p>
                )}
              </div>
              <button className="ml-auto text-primary font-label-sm border border-primary/30 hover:bg-primary-container/20 px-4 py-2 rounded-lg transition-colors">
                Contact
              </button>
            </div>
          </section>

          {/* Sessions / Agenda */}
          {event.sessions && event.sessions.length > 0 && (
            <section className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg pb-4 border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">view_agenda</span>
                Agenda
              </h2>
              <div className="relative border-l-2 border-outline-variant ml-3 space-y-8 pb-4">
                {event.sessions.map((session: any, i: number) => {
                  const sessionStart = session.startTime
                    ? new Date(session.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  const sessionEnd = session.endTime
                    ? new Date(session.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={session.id || i} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-surface shadow-sm ${i === 0 ? "bg-primary" : "bg-surface-container-high border-2 border-outline-variant"}`}></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
                        <h3 className="font-title-md text-on-surface">{session.title}</h3>
                        {(sessionStart || sessionEnd) && (
                          <time className="font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded whitespace-nowrap">
                            {sessionStart}{sessionEnd ? ` - ${sessionEnd}` : ''}
                          </time>
                        )}
                      </div>
                      {session.speakerName && (
                        <p className="text-body-md text-on-surface-variant">Speaker: {session.speakerName}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-full md:w-[30%]">
          <div className="sticky top-[100px] flex flex-col gap-md">
            <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-[0px_4px_20px_rgba(46,49,146,0.08)]">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Registration</h2>
                {capacity > 0 && (
                  <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm ${pct >= 90 ? "bg-error-container text-on-error-container" : "bg-primary-container/20 text-primary"}`}>
                    {capacity - registrations} spots left
                  </span>
                )}
              </div>

              {capacity > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{registrations} registered</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div className={`h-2 rounded-full ${pct >= 90 ? "bg-error" : "bg-primary"}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-lg">
                <div className="flex items-center justify-between p-3 border border-primary bg-primary-container/10 rounded-lg">
                  <span className="font-body-md text-body-md text-on-surface">
                    {event.isFree ? 'Free Admission' : 'General Admission'}
                  </span>
                  <span className="font-title-md text-title-md text-primary">{price}</span>
                </div>
              </div>

              {isPurchased && !isWaitlisted ? (
                <Link
                  href="/my-tickets"
                  className="w-full bg-primary text-on-primary font-title-md text-title-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm mb-3 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  ✓ Registered — View Ticket
                </Link>
              ) : isPurchased && isWaitlisted ? (
                <button
                  disabled
                  className="w-full bg-primary text-on-primary font-title-md text-title-md py-4 rounded-xl shadow-sm mb-3 flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                  You're on the waitlist
                </button>
              ) : (
                <button
                  id="register-event-btn"
                  onClick={handleRegister}
                  disabled={!isPublished || isRegistering || isProcessingPayment}
                  className="w-full bg-primary text-on-primary font-title-md text-title-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm mb-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  {isRegistering
                    ? 'Creating registration...'
                    : isProcessingPayment
                    ? 'Processing payment...'
                    : !isPublished
                    ? 'Registration Closed'
                    : event.isFree
                    ? 'Register for Free'
                    : `Register — ₹${event.ticketPrice}`}
                </button>
              )}
              {registrationError && (
                <p className="text-sm text-red-500 text-center mt-2 mb-2">{registrationError}</p>
              )}
              <button className="w-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm py-3 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                Save for Later
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
