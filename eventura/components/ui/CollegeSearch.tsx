'use client';
import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api/client';

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  domain: string;
  slug?: string;
}

interface Props {
  value: string;
  onChange: (collegeId: string, collegeName: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CollegeSearch({
  value,
  onChange,
  placeholder = 'Search your college...',
  className,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<College[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync display name if value is provided externally
  useEffect(() => {
    if (!value) {
      setQuery('');
      setSelectedName('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSelectedName('');
    onChange('', '');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/colleges/search?q=${encodeURIComponent(q)}`);
        setResults(res.data.data || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = (college: College) => {
    setQuery(college.name);
    setSelectedName(college.name);
    setIsOpen(false);
    onChange(college.id, college.name);
  };

  const typeColors: Record<string, string> = {
    IIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    NIT: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    IIIT: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    IIM: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    Deemed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    Private: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    Government: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  const baseInput =
    'w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline';

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={`${baseInput} pr-10 ${className || ''}`}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {selectedName && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((college) => (
            <button
              key={college.id}
              type="button"
              onClick={() => handleSelect(college)}
              className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center justify-between gap-3 border-b border-outline-variant last:border-0 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-body-md text-body-md text-on-surface truncate">{college.name}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {college.city}, {college.state}
                </p>
              </div>
              {college.type && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    typeColors[college.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {college.type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg p-4 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No colleges found for &quot;{query}&quot;
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-1">
            Your college will be added after registration
          </p>
        </div>
      )}
    </div>
  );
}
