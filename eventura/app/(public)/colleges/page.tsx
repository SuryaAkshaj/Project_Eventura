import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organisations on Eventura — Discover Events Across India',
  description:
    'Browse events from universities, companies, communities, and organisations across India.',
};

interface College {
  id: string;
  name: string;
  city?: string;
  state?: string;
  type?: string;
  slug?: string;
  domain: string;
}

async function getColleges() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/colleges/approved`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as College[];
  } catch {
    return [] as College[];
  }
}

export default async function CollegesPage() {
  const colleges = await getColleges();

  const typeColors: Record<string, string> = {
    IIT: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    NIT: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    IIIT: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    IIM: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    Deemed: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
    Private: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
    Government: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const typeLabels: Record<string, string> = {
    IIT: 'Indian Institutes of Technology',
    NIT: 'National Institutes of Technology',
    IIIT: 'Indian Institutes of Information Technology',
    IIM: 'Indian Institutes of Management',
    Deemed: 'Deemed Universities',
    Private: 'Private Universities',
    Government: 'Government Universities',
  };

  // Group by type
  const grouped = colleges.reduce(
    (acc: Record<string, College[]>, college: College) => {
      const type = college.type || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(college);
      return acc;
    },
    {}
  );

  const typeOrder = ['IIT', 'NIT', 'IIIT', 'IIM', 'Deemed', 'Private', 'Government', 'Other'];

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Navbar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-7xl mx-auto">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_activity
            </span>
            Eventura
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/colleges"
              className="font-body-md text-body-md text-primary font-semibold transition-colors"
            >
              Organisations
            </Link>
            <Link
              href="/events"
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Events
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 rounded-md px-4 py-2 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary text-on-primary py-16 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-on-primary/10 px-4 py-2 rounded-full font-label-sm text-label-sm text-on-primary mb-4 border border-on-primary/20">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            National Discovery Platform
          </div>
          <h1 className="font-display-lg text-display-lg text-on-primary mb-3">
            Organisations on Eventura
          </h1>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-2xl mx-auto">
            Discover events from {colleges.length}+ organisations across India — universities, companies,
            communities and more
          </p>
        </div>
      </div>

      {/* College list grouped by type */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {colleges.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏫</p>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              No organisations yet — check back soon
            </p>
          </div>
        ) : (
          typeOrder.map((type) => {
            const typeColleges = grouped[type];
            if (!typeColleges || typeColleges.length === 0) return null;
            return (
              <div key={type} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      typeColors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {typeLabels[type] || `${type} Universities`}
                  </h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">
                    ({typeColleges.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {typeColleges.map((college: College) => (
                    <Link
                      key={college.id}
                      href={
                        college.slug
                          ? `/colleges/${college.slug}`
                          : `/events?college=${college.id}`
                      }
                      className="bg-surface rounded-xl border border-outline-variant p-4 hover:border-primary hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          {college.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-md text-body-md text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                            {college.name}
                          </p>
                          {college.city && college.state && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {college.city}, {college.state}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-surface border-t border-outline-variant py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
            Don&apos;t see your organisation?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Register as an Organisation Admin to add your organisation to Eventura.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            Add Your Organisation
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
