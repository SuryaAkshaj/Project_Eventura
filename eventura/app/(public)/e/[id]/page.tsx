import { Metadata } from 'next';
import Link from 'next/link';
import ShareButtons from '@/components/ui/ShareButtons';

interface Props {
  params: { id: string };
}

async function getEvent(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/public/${id}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  if (!event) return { title: 'Event Not Found — Eventura' };
  return {
    title: `${event.title} — Eventura`,
    description: event.description || `Join ${event.title} on Eventura`,
    openGraph: {
      title: event.title,
      description: event.description || `Join ${event.title} on Eventura`,
      images: event.bannerUrl ? [event.bannerUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || `Join ${event.title} on Eventura`,
      images: event.bannerUrl ? [event.bannerUrl] : [],
    },
  };
}

export default async function PublicEventPage({ params }: Props) {
  const event = await getEvent(params.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">🎪</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
        <p className="text-gray-500 mb-6">This event may have ended or been removed.</p>
        <Link href="/events" className="text-indigo-600 hover:underline">
          Browse all events →
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const formattedDate = isMultiDay
    ? `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : startDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formattedTime = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const organiserName = event.club
    ? `${event.club.name} · ${event.college?.name}`
    : event.college?.name || 'Eventura';

  const isFree = event.isFree || Number(event.ticketPrice) === 0;
  const price = isFree ? 'Free' : `₹${Number(event.ticketPrice).toLocaleString('en-IN')}`;

  const typeConfig: Record<string, { icon: string; color: string }> = {
    FEST: { icon: '🎪', color: 'bg-purple-100 text-purple-700' },
    COMPETITION: { icon: '🏆', color: 'bg-amber-100 text-amber-700' },
    WORKSHOP: { icon: '🛠️', color: 'bg-green-100 text-green-700' },
    SEMINAR: { icon: '🎤', color: 'bg-blue-100 text-blue-700' },
    OTHER: { icon: '📅', color: 'bg-gray-100 text-gray-700' },
  };
  const typeInfo = typeConfig[event.eventType] || typeConfig.OTHER;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-indigo-700 text-lg">
          Eventura
        </Link>
        <Link
          href="/events"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Browse Events
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Event banner */}
        {event.bannerUrl ? (
          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6">
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 mb-6 flex items-center justify-center">
            <span className="text-6xl">{typeInfo.icon}</span>
          </div>
        )}

        {/* Event header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {event.title}
            </h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${typeInfo.color}`}>
              {typeInfo.icon} {event.eventType}
            </span>
          </div>

          {/* Organiser */}
          <div className="flex items-center gap-3 mb-4">
            {event.college?.logoUrl ? (
              <img
                src={event.college.logoUrl}
                alt={organiserName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                {organiserName[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{organiserName}</p>
              {event.college?.city && (
                <p className="text-xs text-gray-500">{event.college.city}</p>
              )}
            </div>
          </div>

          {/* Key details */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">📅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                <p className="text-xs text-gray-500">{formattedTime} IST</p>
              </div>
            </div>

            {(event.venue || event.onlineLink) && (
              <div className="flex items-start gap-3">
                <span className="text-gray-400 mt-0.5">📍</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.venue || 'Online Event'}
                  </p>
                  {event.onlineLink && (
                    <p className="text-xs text-gray-500">Virtual event</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-gray-400">🎟️</span>
              <p className="text-sm font-medium text-gray-900">{price}</p>
            </div>

            {event.maxCapacity && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">👥</span>
                <p className="text-sm text-gray-600">
                  {event._count?.registrations || 0} / {event.maxCapacity} registered
                </p>
              </div>
            )}

            {event.prizePool && Number(event.prizePool) > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">🏆</span>
                <p className="text-sm font-semibold text-amber-600">
                  Prize Pool: ₹{Number(event.prizePool).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>

          {/* Register CTA */}
          <div className="mt-6">
            <Link
              href={`/events/${event.id}`}
              className="block w-full bg-indigo-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {isFree ? 'Register for Free' : `Register · ${price}`}
            </Link>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by Eventura
            </p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">About this event</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* Sub-events (for FEST) */}
        {event.eventType === 'FEST' && event.subEvents?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">
              Events & Competitions ({event.subEvents.length})
            </h2>
            <div className="space-y-2">
              {event.subEvents.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/e/${sub.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {sub.eventType === 'COMPETITION' ? '🏆' :
                       sub.eventType === 'WORKSHOP' ? '🛠️' : '📅'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sub.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short'
                        })}
                        {sub.teamSizeMin && ` · Team: ${sub.teamSizeMin}–${sub.teamSizeMax}`}
                      </p>
                    </div>
                  </div>
                  {sub.prizePool && Number(sub.prizePool) > 0 && (
                    <span className="text-xs font-semibold text-amber-600">
                      ₹{Number(sub.prizePool).toLocaleString('en-IN')}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Accommodation (for FEST) */}
        {event.accommodation && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              🏨 Accommodation Available
            </h3>
            <p className="text-sm text-blue-700">
              {event.accommodationInfo || 'Accommodation details shared after registration.'}
            </p>
          </div>
        )}

        {/* Competition rules */}
        {event.eventType === 'COMPETITION' && event.competitionRules && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Rules & Regulations</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {event.competitionRules}
            </p>
          </div>
        )}

        {/* Share event */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">Share this event</p>
          <ShareButtons eventId={event.id} eventTitle={event.title} />
        </div>

      </div>
    </div>
  );
}
