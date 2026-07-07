'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

const CATEGORIES = ['Workshop', 'Meetup', 'Conference', 'Concert', 'Networking', 'Hackathon', 'Webinar', 'Social', 'Other'];
const FORMATS = ['In-Person', 'Online', 'Hybrid'];

export default function CreateOpenEventPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState('In-Person');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('21:00');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    setError('');
    if (!title.trim()) return setError('Please add an event title');
    if (!startDate) return setError('Please select a start date');
    if (!endDate) return setError('Please select an end date');

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        venue: venue.trim() || undefined,
        onlineLink: onlineLink.trim() || undefined,
        category: category || undefined,
        format,
        startDate: new Date(`${startDate}T${startTime}`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}`).toISOString(),
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : 0,
      };

      await apiClient.post('/events/open', payload);
      router.push('/creator/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1025 40%, #0d0d1a 100%)' }}>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]"
           style={{ background: 'rgba(10, 10, 15, 0.8)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/creator/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[26px] text-purple-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              local_activity
            </span>
            <span className="text-lg font-bold text-white tracking-tight">Eventura</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/creator/dashboard')}
              className="text-sm text-white/50 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Publishing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                  Publish Event
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column — Cover Image Placeholder */}
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] flex flex-col items-center justify-center gap-3 hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all cursor-pointer group sticky top-24">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px] text-purple-400">add_photo_alternate</span>
              </div>
              <div className="text-center">
                <p className="text-white/50 text-sm font-medium">Upload Cover Image</p>
                <p className="text-white/25 text-xs mt-1">Recommended: 1920 × 1080</p>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Event Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-3xl font-bold text-white placeholder:text-white/20 caret-purple-400"
                autoFocus
              />
            </div>

            {/* Date & Time */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[20px] text-purple-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  calendar_today
                </span>
                <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Date & Time</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!endDate) setEndDate(e.target.value);
                    }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[20px] text-purple-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
                <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Location</span>
              </div>

              <div className="flex gap-2 mb-3">
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      format === f
                        ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {(format === 'In-Person' || format === 'Hybrid') && (
                <input
                  type="text"
                  placeholder="Add venue address"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              )}
              {(format === 'Online' || format === 'Hybrid') && (
                <input
                  type="url"
                  placeholder="Add meeting link (Zoom, Google Meet, etc.)"
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              )}
            </div>

            {/* Description */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[20px] text-purple-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  description
                </span>
                <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">About</span>
              </div>
              <textarea
                placeholder="Tell people what your event is about, who should attend, and what they'll get out of it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Category & Capacity */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[20px] text-purple-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  tune
                </span>
                <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Event Options</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(category === c ? '' : c)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        category === c
                          ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">Max Capacity</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs uppercase tracking-wider font-semibold">Ticket Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Free"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-sm font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Hosted by {user?.firstName} {user?.lastName}</p>
                  <p className="text-white/40 text-xs">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
