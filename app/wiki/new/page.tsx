'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { WikiEditor } from '@/components/wiki/WikiEditor';
import { Spinner } from '@/components/ui/Spinner';

export default function NewWikiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <NewWikiPageContent />
    </Suspense>
  );
}

function NewWikiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);

  const boardId = searchParams.get('board') || undefined;
  const cardId = searchParams.get('card') || undefined;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isLoading && isAuthenticated && cardId) {
      // Check if a wiki page already exists for this card
      fetch(`/api/wiki/links?card_id=${cardId}`)
        .then(res => res.json())
        .then(data => {
          if (data.links && data.links.length > 0) {
            // Redirect to the existing wiki page
            const wikiPageId = data.links[0].wiki_page_id;
            fetch(`/api/wiki/pages/${wikiPageId}`)
              .then(res => res.json())
              .then(pageData => {
                if (pageData.page?.slug) {
                  router.replace(`/wiki/${pageData.page.slug}`);
                } else {
                  setChecking(false);
                }
              })
              .catch(() => setChecking(false));
          } else {
            setChecking(false);
          }
        })
        .catch(() => setChecking(false));
    } else if (!isLoading) {
      setChecking(false);
    }
  }, [isLoading, isAuthenticated, cardId, router]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-6">Create New Page</h1>
          <WikiEditor mode="create" boardId={boardId} cardId={cardId} />
        </div>
      </main>
    </div>
  );
}
