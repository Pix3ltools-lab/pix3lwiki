'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WikiPageView } from '@/components/wiki/WikiPage';
import { Spinner } from '@/components/ui/Spinner';
import { WikiPageWithAuthor } from '@/types';

export default function WikiSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<WikiPageWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/wiki/pages/by-slug/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => setPage(data.page))
      .catch(() => setError('Page not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">{error}</p>
              </div>
            ) : page ? (
              <WikiPageView page={page} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
