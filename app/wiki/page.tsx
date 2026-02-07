'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WikiCard } from '@/components/wiki/WikiCard';
import { Spinner } from '@/components/ui/Spinner';
import { WikiPageWithAuthor } from '@/types';

export default function WikiListPage() {
  const [pages, setPages] = useState<WikiPageWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wiki/pages?status=published')
      .then(res => res.json())
      .then(data => { if (data.pages) setPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-text-primary">Wiki Pages</h1>
              <Link
                href="/wiki/new"
                className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors text-sm"
              >
                New Page
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">No pages yet. Create your first wiki page!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pages.map((page) => (
                  <WikiCard key={page.id} page={page} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
