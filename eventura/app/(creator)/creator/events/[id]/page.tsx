'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

export default function CreatorEventDetailPage() {
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      apiClient.get(`/events/public/${params.id}`),
      apiClient.get(`/registrations/event/${params.id}`).catch(() => ({ data: { data: [] } })),
    ])
      .then(([eventRes, regsRes]) => {
        setEvent(eventRes.data.data);
        setRegistrations(regsRes.data.data || []);
      })
      .catch(() => router.push('/creator/dashboard'))
      .finally(() => setIsLoading(false));
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyLink = () => {
    const url = `https://project-eventura.vercel.app/e/${params.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const startDate = new Date(event.startDate);
  const isFree = event.isFree || Number(event.ticketPrice) === 0;
  const registrationCount = event._count?.registrations || registrations.length;
  const capacity = event.maxCapacity;
  const fillPercent = capacity ? Math.min(100, (registrationCount / capacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/creator/dashboard" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            ← Events
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-white truncate max-w-xs">{event.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="text-sm bg-gray-800 text-gray-300 hover:text-white px-4 py-1.5 rounded-lg border border-gray-700 transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
          <Link
            href={`/e/${params.id}`}
            target="_blank"
            className="text-sm bg-white text-gray-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Public Page
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Event title + status */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <span className="text-xs px-3 py-1 bg-green-900 text-green-300 rounded-full font-medium flex-shrink-0">
              ● {event.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {startDate.toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
            {event.venue && ` · ${event.venue}`}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Registered', value: registrationCount, icon: '👥' },
            { label: 'Capacity', value: capacity || '∞', icon: '🎯' },
            { label: 'Ticket', value: isFree ? 'Free' : `₹${Number(event.ticketPrice)}`, icon: '🎟️' },
            { label: 'Status', value: event.status, icon: '📊' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        {capacity && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Registration fill rate</span>
              <span className="text-white font-medium">{registrationCount} / {capacity}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  fillPercent >= 90 ? 'bg-red-500' :
                  fillPercent >= 70 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Share your event */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
          <h2 className="font-semibold text-white mb-1">Share your event</h2>
          <p className="text-sm text-gray-400 mb-4">
            Share this link so people can register
          </p>
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
            <span className="text-gray-400 text-sm truncate flex-1">
              project-eventura.vercel.app/e/{params.id}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex-shrink-0"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join ${event.title}: https://project-eventura.vercel.app/e/${params.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 flex-shrink-0"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join ${event.title} on Eventura`)}&url=${encodeURIComponent(`https://project-eventura.vercel.app/e/${params.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600"
            >
              𝕏 Twitter
            </a>
          </div>
        </div>

        {/* Registrations table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Registrations ({registrationCount})</h2>
          </div>
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-gray-400 text-sm">No registrations yet</p>
              <p className="text-gray-600 text-xs mt-1">Share your event to get registrations</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {registrations.map((reg: any) => (
                    <tr key={reg.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-300">
                            {reg.user?.firstName?.[0]}{reg.user?.lastName?.[0]}
                          </div>
                          <span className="text-sm text-white">
                            {reg.user?.firstName} {reg.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{reg.user?.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reg.status === 'CHECKED_IN' ? 'bg-green-900 text-green-300' :
                          reg.status === 'REGISTERED' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(reg.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
