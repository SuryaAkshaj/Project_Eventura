"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";
import { bookmarksApi } from "@/lib/api/bookmarks.api";
import DeadlineBadge from "@/components/ui/DeadlineBadge";
import { useAuthStore } from "@/lib/store/authStore";
import { ShimmerEventCard } from "@/components/ui/Shimmer";

const categories = [
  { value: '', label: 'All' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Management', label: 'Management' },
];
const formats = ["All Formats", "In-Person", "Virtual", "Hybrid", "Online"];

const EVENT_TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'FEST', label: '🎥 Fests' },
  { value: 'COMPETITION', label: '🏆 Competitions' },
  { value: 'WORKSHOP', label: '🛠️ Workshops' },
  { value: 'SEMINAR', label: '🎤 Seminars' },
];

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  FEST: { icon: '🎥', label: 'Fest', color: 'bg-purple-100 text-purple-700' },
  COMPETITION: { icon: '🏆', label: 'Competition', color: 'bg-amber-100 text-amber-700' },
  WORKSHOP: { icon: '🛠️', label: 'Workshop', color: 'bg-green-100 text-green-700' },
  SEMINAR: { icon: '🎤', label: 'Seminar', color: 'bg-blue-100 text-blue-700' },
  OTHER: { icon: '📅', label: 'Event', color: 'bg-gray-100 text-gray-600' },
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Jammu & Kashmir', 'Andaman & Nicobar'
];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFormat, setActiveFormat] = useState('All Formats');
  const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [closingSoon, setClosingSoon] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuthStore();

  const queryClient = useQueryClient();

  // Load user's bookmarks when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarksApi.getMyBookmarks()
      .then(res => {
        const ids = new Set<string>(res.data.data.map((b: any) => b.eventId as string));
        setBookmarkedIds(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', { page, search, category: activeCategory, format: activeFormat, isFree, selectedState, closingSoon, eventTypeFilter }],
    queryFn: () => eventsApi.getEvents({
      page,
      limit: 12,
      search: search || undefined,
      category: activeCategory || undefined,
      format: activeFormat !== 'All Formats' ? activeFormat : undefined,
      isFree,
      state: selectedState || undefined,
      closingSoon: closingSoon || undefined,
      eventType: eventTypeFilter || undefined,
      sortBy: 'startDate',
      sortOrder: 'asc',
    }),
    placeholderData: (prev) => prev,
  });

  const events: any[] = data?.data?.data || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: 12, totalPages: 0 };
  const isLoadingEvents = isLoading;

  const handleEventHover = (eventId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['event', eventId],
      queryFn: () => eventsApi.getEventById(eventId),
      staleTime: 1000 * 60 * 5,
    });
  };

  const handleBookmark = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/events`;
      return;
    }

    const isBookmarked = bookmarkedIds.has(eventId);

    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

    try {
      if (isBookmarked) {
        await bookmarksApi.removeBookmark(eventId);
      } else {
        await bookmarksApi.bookmark(eventId);
      }
    } catch {
      // Revert on error
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (isBookmarked) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('');
    setActiveFormat('All Formats');
    setIsFree(undefined);
    setSelectedState('');
    setClosingSoon(false);
    setEventTypeFilter('');
    setPage(1);
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      {/* Page Header */}
      <div className="mb-xl">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Discover Events</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Browse and register for upcoming campus events.</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 mb-lg shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            id="events-search"
            type="text"
            placeholder="Search events, workshops, seminars..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          id="events-format-filter"
          value={activeFormat}
          onChange={(e) => { setActiveFormat(e.target.value); setPage(1); }}
          className="border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
        >
          {formats.map((f) => <option key={f}>{f}</option>)}
        </select>
        <select
          id="events-price-filter"
          value={isFree === undefined ? 'all' : isFree ? 'free' : 'paid'}
          onChange={(e) => {
            const val = e.target.value;
            setIsFree(val === 'all' ? undefined : val === 'free');
            setPage(1);
          }}
          className="border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Prices</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>
        {/* State filter */}
        <select
          id="events-state-filter"
          value={selectedState}
          onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
          className="border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
        >
          <option value="">All States</option>
          {INDIAN_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Category Chips + Event Type filter + Closing Soon toggle */}
      <div className="flex flex-wrap gap-2 mb-xl">
        {categories.map((cat) => (
          <button
            key={cat.value}
            id={`category-${(cat.label || 'all').toLowerCase()}`}
            onClick={() => { setActiveCategory(cat.value); setPage(1); }}
            className={`font-label-sm text-label-sm px-4 py-2 rounded-full border transition-colors ${
              activeCategory === cat.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-on-surface border-outline-variant hover:bg-surface-variant"
            }`}
          >
            {cat.label}
          </button>
        ))}
        {/* Event Type filter chips */}
        {EVENT_TYPE_FILTERS.filter(t => t.value !== '').map(type => (
          <button
            key={type.value}
            id={`event-type-filter-${type.value.toLowerCase()}`}
            onClick={() => { setEventTypeFilter(eventTypeFilter === type.value ? '' : type.value); setPage(1); }}
            className={`font-label-sm text-label-sm px-4 py-2 rounded-full border transition-colors ${
              eventTypeFilter === type.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-on-surface border-outline-variant hover:bg-surface-variant'
            }`}
          >
            {type.label}
          </button>
        ))}
        {/* Closing Soon toggle */}
        <button
          id="filter-closing-soon"
          onClick={() => { setClosingSoon(!closingSoon); setPage(1); }}
          className={`font-label-sm text-label-sm px-4 py-2 rounded-full border transition-colors ${
            closingSoon
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-on-surface border-outline-variant hover:bg-surface-variant'
          }`}
        >
          ⏰ Closing Soon
        </button>
      </div>

      {/* Loading Skeletons — ShimmerEventCard */}
      {isLoadingEvents && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerEventCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoadingEvents && error && (
        <div className="text-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-4 block text-error">error_outline</span>
          <p className="font-title-md text-title-md text-error mb-4">Failed to load events. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="font-label-sm text-label-sm bg-primary text-on-primary px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Events Grid — Context-aware empty states */}
      {!isLoadingEvents && !error && events.length === 0 && (
        <div className="col-span-full">
          {search || activeCategory || activeFormat !== 'All Formats' || isFree !== undefined || selectedState || closingSoon || eventTypeFilter ? (
            // Filter applied — no results
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No events match your filters</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your search or clearing some filters</p>
              <button
                onClick={clearFilters}
                className="text-indigo-600 font-medium text-sm hover:underline"
              >
                Clear all filters →
              </button>
            </div>
          ) : !isAuthenticated ? (
            // Guest user — no public events visible
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">🔒</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">College events require sign in</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Events from IITs, NITs, and private colleges are visible only to verified students.
                Sign in to discover campus-exclusive events.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/login"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Sign in to discover events
                </a>
                <a
                  href="/colleges"
                  className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Browse colleges
                </a>
              </div>
            </div>
          ) : (
            // Logged in — genuinely no events yet
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">🎪</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No events yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Events from your college and others will appear here. Check back soon!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/colleges"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Explore colleges
                </a>
                <a
                  href="/dashboard"
                  className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  View saved events
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoadingEvents && !error && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {events.map((event) => {
              const registrations = event._count?.registrations ?? 0;
              const capacity = event.maxCapacity ?? 0;
              const pct = capacity > 0 ? Math.round((registrations / capacity) * 100) : 0;
              const formattedDate = event.startDate
                ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'TBD';
              const location = event.venue || event.onlineLink || 'Online';
              const price = event.isFree ? 'Free' : `₹${Number(event.ticketPrice).toLocaleString('en-IN')}`;
              const isBookmarked = bookmarkedIds.has(event.id);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group"
                  onMouseEnter={() => handleEventHover(event.id)}
                >
                  <div className="h-48 bg-surface-variant relative overflow-hidden">
                    {event.bannerUrl ? (
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/40 to-secondary-container/40">
                        <span className="material-symbols-outlined text-[64px] text-primary/40">event</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-label-sm text-label-sm text-primary border border-outline-variant/20 shadow-sm">
                        {event.category}
                      </span>
                      <span className="bg-primary/90 backdrop-blur-sm px-2 py-1 rounded font-label-sm text-label-sm text-on-primary shadow-sm">
                        {event.format}
                      </span>
                      {/* Event type badge */}
                      {event.eventType && event.eventType !== 'OTHER' && typeConfig[event.eventType] && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig[event.eventType].color}`}>
                          {typeConfig[event.eventType].icon} {typeConfig[event.eventType].label}
                        </span>
                      )}
                      {/* Deadline Badge on card */}
                      <DeadlineBadge
                        startDate={event.startDate}
                        registrationDeadline={event.registrationDeadline}
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => handleBookmark(e, event.id)}
                        className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm ${isBookmarked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-title-md text-title-md text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight">{event.title}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-1 text-sm">{event.college?.name}</p>
                    {event.college?.city && (
                      <p className="font-body-md text-body-md text-on-surface-variant mb-1 text-xs">{event.college.city}{event.college.state ? `, ${event.college.state}` : ''}</p>
                    )}
                    <div className="space-y-1 text-body-md text-on-surface-variant mb-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                        <span>{location}</span>
                      </div>
                    </div>
                    {/* Capacity Bar */}
                    {capacity > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{registrations}/{capacity} registered</span>
                          <span className="font-label-sm text-label-sm text-primary font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${pct > 90 ? "bg-error" : "bg-primary"}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )}
                    <div className="mt-auto pt-3 border-t border-outline-variant/50 flex justify-between items-center">
                      <span className="font-title-md text-title-md text-primary">
                        {price}
                      </span>
                      {event.prizePool && Number(event.prizePool) > 0 && (
                        <span className="font-label-sm text-label-sm text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          🏆 ₹{Number(event.prizePool).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1">
                        View Details
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-xl">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-label-sm text-label-sm px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="font-label-sm text-label-sm px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
