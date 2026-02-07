'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WikiCard } from '@/components/wiki/WikiCard';
import { Spinner } from '@/components/ui/Spinner';
import { WikiPageWithAuthor, WikiCategory } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [pages, setPages] = useState<WikiPageWithAuthor[]>([]);
  const [category, setCategory] = useState<WikiCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);

    // Fetch categories to find the one matching the slug
    fetch('/api/wiki/categories')
      .then(res => res.json())
      .then(data => {
        const cat = data.categories?.find((c: WikiCategory) => c.slug === categorySlug);
        if (cat) {
          setCategory(cat);
          return fetch(`/api/wiki/pages?category_id=${cat.id}&status=published`);
        }
        return null;
      })
      .then(res => res?.json())
      .then(data => { if (data?.pages) setPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              {category ? (
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h1 className="text-2xl font-bold text-text-primary">{category.name}</h1>
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-text-primary">Category</h1>
              )}
              {category?.description && (
                <p className="text-text-secondary mt-2">{category.description}</p>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">No pages in this category</p>
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
