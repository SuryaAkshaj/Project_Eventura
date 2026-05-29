"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from "@/lib/api/events.api";

const categories = ["All", "Academic", "Career", "Social", "Workshop", "Technology", "Technical", "Cultural"];
const formats = ["All Formats", "In-Person", "Virtual", "Hybrid", "Online"];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFormat, setActiveFormat] = useState('All Formats');
  const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', { page, search, category: activeCategory, format: activeFormat, isFree }],
    queryFn: () => eventsApi.getEvents({
      page,
      limit: 12,
      search: search || undefined,
      category: activeCategory !== 'All' ? activeCategory : undefined,
      format: activeFormat !== 'All Formats' ? activeFormat : undefined,
      isFree,
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

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('All');
    setActiveFormat('All Formats');
    setIsFree(undefined);
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
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-xl">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`category-${cat.toLowerCase()}`}
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            className={`font-label-sm text-label-sm px-4 py-2 rounded-full border transition-colors ${
              activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-on-surface border-outline-variant hover:bg-surface-variant"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoadingEvents && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-auto" />
              </div>
            </div>
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

      {/* Events Grid */}
      {!isLoadingEvents && !error && events.length === 0 && (
        <div className="text-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-4 block">search_off</span>
          <p className="font-title-md text-title-md">No events found</p>
          <p className="font-body-md text-body-md mt-1 mb-4">Try adjusting your filters</p>
          <button
            onClick={clearFilters}
            className="font-label-sm text-label-sm bg-primary text-on-primary px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Clear Filters
          </button>
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
              const price = event.isFree ? 'Free' : `₹${event.ticketPrice}`;

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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-label-sm text-label-sm text-primary border border-outline-variant/20 shadow-sm">
                        {event.category}
                      </span>
                      <span className="bg-primary/90 backdrop-blur-sm px-2 py-1 rounded font-label-sm text-label-sm text-on-primary shadow-sm">
                        {event.format}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-title-md text-title-md text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight">{event.title}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-1 text-sm">{event.college?.name}</p>
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
