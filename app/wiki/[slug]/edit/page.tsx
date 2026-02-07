'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { WikiEditor } from '@/components/wiki/WikiEditor';
import { VersionHistory } from '@/components/wiki/VersionHistory';
import { Spinner } from '@/components/ui/Spinner';
import { WikiPageWithAuthor, WikiVersionWithAuthor } from '@/types';

export default function EditWikiPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [page, setPage] = useState<WikiPageWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!slug || authLoading) return;

    fetch(`/api/wiki/pages/by-slug/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => setPage(data.page))
      .catch(() => router.push('/wiki'))
      .finally(() => setLoading(false));
  }, [slug, authLoading, isAuthenticated, router]);

  const handleRestore = (version: WikiVersionWithAuthor) => {
    if (page) {
      setPage({
        ...page,
        title: version.title,
        content: version.content,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Edit Page</h1>
          <WikiEditor page={page} mode="edit" />
          <VersionHistory
            pageId={page.id}
            currentVersion={page.version}
            onRestore={handleRestore}
          />
        </div>
      </main>
    </div>
  );
}
