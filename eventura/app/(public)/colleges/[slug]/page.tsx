import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: { slug: string };
}

async function getCollege(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/colleges/slug/${slug}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const college = await getCollege(params.slug);
  if (!college) return { title: 'College Not Found — Eventura' };
  return {
    title: `${college.name} Events — Eventura`,
    description: `Discover events, workshops, and fests at ${college.name}, ${college.city}. Register and attend on Eventura.`,
    openGraph: {
      title: `${college.name} on Eventura`,
      description: `Events at ${college.name}`,
      images: college.logoUrl ? [college.logoUrl] : [],
    },
  };
}

const typeColors: Record<string, string> = {
  IIT: 'bg-blue-100 text-blue-700',
  NIT: 'bg-green-100 text-green-700',
  IIIT: 'bg-purple-100 text-purple-700',
  IIM: 'bg-orange-100 text-orange-700',
  Deemed: 'bg-amber-100 text-amber-700',
  Private: 'bg-indigo-100 text-indigo-700',
  Government: 'bg-gray-100 text-gray-700',
};

export default async function CollegePage({ params }: Props) {
  const college = await getCollege(params.slug);

  if (!college) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">🏫</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">College Not Found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          This college page doesn&apos;t exist yet.
        </p>
        <Link
          href="/events"
          className="text-primary font-semibold hover:underline font-body-md text-body-md"
        >
          Browse all events →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Hero */}
      <div
        className="h-48 md:h-64 bg-gradient-to-r from-primary to-primary/70 relative"
        style={
          college.coverImageUrl
            ? {
                backgroundImage: `url(${college.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-primary/40" />
        {/* Navbar */}
        <div className="relative z-10 flex items-center justify-between px-4 md:px-8 h-16">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold text-on-primary flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_activity
            </span>
            Eventura
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/colleges"
              className="font-label-sm text-label-sm text-on-primary/80 hover:text-on-primary transition-colors"
            >
              All Colleges
            </Link>
            <Link
              href="/signup"
              className="font-label-sm text-label-sm bg-on-primary text-primary px-4 py-2 rounded-md hover:bg-on-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* College header */}
        <div className="relative -mt-12 mb-6 flex items-end gap-4">
          <div className="w-24 h-24 rounded-xl bg-surface border-4 border-surface shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
            {college.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={college.logoUrl} alt={college.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display-lg text-display-lg font-bold text-primary">
                {college.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{college.name}</h1>
              {college.approvalStatus === 'APPROVED' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
              {college.type && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    typeColors[college.type] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {college.type}
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              {college.city}
              {college.state ? `, ${college.state}` : ''}
              {college.establishedYear ? ` · Est. ${college.establishedYear}` : ''}
              {college.totalStudents
                ? ` · ${Number(college.totalStudents).toLocaleString()}+ students`
                : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          {/* Left: College info */}
          <div className="md:col-span-1 space-y-4">
            {college.description && (
              <div className="bg-surface rounded-xl border border-outline-variant p-5">
                <h2 className="font-title-md text-title-md text-on-surface mb-2">About</h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {college.description}
                </p>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-outline-variant p-5 space-y-3">
              <h2 className="font-title-md text-title-md text-on-surface">Info</h2>
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body-md text-body-md text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">language</span>
                  Website
                </a>
              )}
              {college.instagram && (
                <a
                  href={`https://instagram.com/${college.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body-md text-body-md text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  @{college.instagram}
                </a>
              )}
              {college.address && (
                <p className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                  {college.address}
                </p>
              )}
              {college.domain && (
                <p className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  {college.domain}
                </p>
              )}
              {college._count && (
                <div className="pt-2 border-t border-outline-variant flex gap-4">
                  <div>
                    <p className="font-title-md text-title-md text-on-surface">{college._count.events}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Events</p>
                  </div>
                  <div>
                    <p className="font-title-md text-title-md text-on-surface">{college._count.clubs}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Clubs</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Events */}
          <div className="md:col-span-2">
            <div className="bg-surface rounded-xl border border-outline-variant p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-title-lg text-title-lg text-on-surface">
                  Upcoming Events
                </h2>
                <Link
                  href={`/events?college=${college.id}`}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              {!college.events || college.events.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">🎪</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    No upcoming public events yet
                  </p>
                  {!college.isSeeded && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-1">
                      Organisers from {college.name} can create events on Eventura
                    </p>
                  )}
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 mt-4 bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create an Event
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {college.events.map((event: {
                    id: string;
                    title: string;
                    startDate: string;
                    venue?: string;
                    isFree: boolean;
                    ticketPrice: string | number;
                  }) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div>
                        <p className="font-body-md text-body-md text-on-surface font-medium">
                          {event.title}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {new Date(event.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {event.venue ? ` · ${event.venue}` : ''}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                          event.isFree
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                      >
                        {event.isFree ? 'Free' : `₹${Number(event.ticketPrice)}`}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
