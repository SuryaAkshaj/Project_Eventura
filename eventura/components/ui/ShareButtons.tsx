'use client';
import { useState } from 'react';

interface Props {
  eventId: string;
  eventTitle: string;
}

export default function ShareButtons({ eventId, eventTitle }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `https://project-eventura.vercel.app/e/${eventId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-center gap-3">
      <a
        href={`https://twitter.com/intent/tweet?text=Join%20${encodeURIComponent(eventTitle)}%20on%20Eventura&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        𝕏 Share
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Join ${eventTitle} on Eventura: ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        WhatsApp
      </a>
      <button
        onClick={handleCopy}
        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
