'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { WikiCard } from './WikiCard';
import { Spinner } from '@/components/ui/Spinner';
import { WikiPageWithAuthor, WikiCategory } from '@/types';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { Search } from 'lucide-react';

export function WikiSearch() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [results, setResults] = useState<WikiPageWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch('/api/wiki/categories')
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => {});
  }, []);

  const performSearch = useCallback(async (q: string, catId: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (catId) params.set('category_id', catId);

      const res = await fetch(`/api/wiki/search?${params}`);
      const data = await res.json();
      setResults(data.pages || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, categoryId);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, categoryId, performSearch]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-10 pr-3 py-2 bg-bg-secondary border border-bg-tertiary rounded text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-bg-tertiary rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No results found for &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((page) => (
            <WikiCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
