'use client';
import { useState, useEffect } from 'react';

type ConsentState = 'accepted' | 'rejected' | 'pending';

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check existing consent
    const stored = localStorage.getItem('eventura_cookie_consent');
    if (!stored) {
      // Show banner after short delay
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Check if consent was given more than 90 days ago
      const { value, timestamp } = JSON.parse(stored);
      const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysSince > 90) {
        setTimeout(() => setIsVisible(true), 1000);
      } else {
        setConsent(value);
      }
    }
  }, []);

  const handleConsent = (value: 'accepted' | 'rejected') => {
    setConsent(value);
    setIsVisible(false);
    localStorage.setItem('eventura_cookie_consent', JSON.stringify({
      value,
      timestamp: Date.now(),
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
            🍪 We use cookies
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Eventura uses essential cookies for authentication and security.
            We don&apos;t serve ads or track you across other sites.{' '}
            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleConsent('rejected')}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
