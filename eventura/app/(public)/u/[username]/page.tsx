import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: { username: string };
}

async function getProfile(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/profile/${username}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.username);
  if (!profile) return { title: 'Profile Not Found — Eventura' };
  return {
    title: `${profile.firstName} ${profile.lastName} — Eventura`,
    description: `${profile.firstName} ${profile.lastName} has attended ${profile.stats.eventsAttended} events and earned ${profile.stats.certificatesEarned} certificates on Eventura.`,
    openGraph: {
      title: `${profile.firstName} ${profile.lastName} on Eventura`,
      description: `${profile.stats.eventsAttended} events attended · ${profile.stats.certificatesEarned} certificates earned`,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const memberYear = new Date(profile.memberSince).getFullYear();

  const roleDisplay: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    COLLEGE_ADMIN: 'College Admin',
    CLUB_PRESIDENT: 'Club President',
    EVENT_MANAGER: 'Event Manager',
    ATTENDEE: 'Attendee',
  };

  const eventTypeIcon: Record<string, string> = {
    FEST: '🎪',
    COMPETITION: '🏆',
    WORKSHOP: '🛠️',
    SEMINAR: '🎤',
    OTHER: '📅',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Eventura</Link>
        <Link href="/events" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300">Browse Events</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-white dark:bg-gray-900/20" />
              <div className="absolute bottom-2 left-12 w-10 h-10 rounded-full bg-white dark:bg-gray-900/20" />
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-8 mb-4 flex items-end justify-between">
              <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : initials}
              </div>
              {/* LinkedIn-style share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://project-eventura.vercel.app/u/${params.username}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 mt-4"
              >
                Share on LinkedIn
              </a>
            </div>

            {/* Name + role */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {roleDisplay[profile.role] || 'Eventura Member'}
            </p>

            {/* College */}
            {profile.college && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">🎓</span>
                {profile.college.slug ? (
                  <Link
                    href={`/colleges/${profile.college.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {profile.college.name}
                    {profile.college.city && `, ${profile.college.city}`}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.college.name}
                    {profile.college.city && `, ${profile.college.city}`}
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Member since {memberYear}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{profile.stats.eventsAttended}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Events Attended</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{profile.stats.certificatesEarned}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Certificates Earned</p>
          </div>
        </div>

        {/* Certificates */}
        {profile.certificates.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              🏅 Certificates
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {profile.certificates.length}
              </span>
            </h2>
            <div className="space-y-3">
              {profile.certificates.map((cert: any) => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {cert.eventTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {cert.collegeName && `${cert.collegeName} · `}
                      {new Date(cert.eventDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <a
                      href={`/certificates/verify/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Verify
                    </a>
                    {cert.pdfUrl && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${cert.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-200"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events attended */}
        {profile.attendedEvents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              📅 Events Attended
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {profile.attendedEvents.length}
              </span>
            </h2>
            <div className="space-y-2">
              {profile.attendedEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:bg-gray-950 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">
                    {eventTypeIcon[event.eventType] || '📅'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.college?.name && `${event.college.name} · `}
                      {new Date(event.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {profile.attendedEvents.length === 0 && profile.certificates.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No events attended yet</p>
            <Link
              href="/events"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-2 inline-block"
            >
              Discover events →
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Profile on{' '}
            <Link href="/" className="text-indigo-500 hover:underline">Eventura</Link>
            {' '}· India&apos;s event platform
          </p>
        </div>

      </div>
    </div>
  );
}
