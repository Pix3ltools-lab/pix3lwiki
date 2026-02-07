'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Search, Plus, FolderOpen } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <BookOpen className="h-16 w-16 text-accent-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Pix<span className="text-red-500">3</span><span className="text-blue-500">l</span>Wiki
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            Knowledge base for your Pix3lBoard projects. Document, organize, and share.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              href="/wiki"
              className="flex items-center gap-3 p-4 rounded-lg border border-bg-tertiary bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <BookOpen className="h-5 w-5 text-accent-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Browse Pages</p>
                <p className="text-xs text-text-secondary">View all wiki pages</p>
              </div>
            </Link>

            <Link
              href="/wiki/search"
              className="flex items-center gap-3 p-4 rounded-lg border border-bg-tertiary bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <Search className="h-5 w-5 text-accent-secondary" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Search</p>
                <p className="text-xs text-text-secondary">Find information</p>
              </div>
            </Link>

            {isAuthenticated && (
              <Link
                href="/wiki/new"
                className="flex items-center gap-3 p-4 rounded-lg border border-bg-tertiary bg-bg-secondary hover:bg-bg-tertiary transition-colors"
              >
                <Plus className="h-5 w-5 text-accent-success" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">New Page</p>
                  <p className="text-xs text-text-secondary">Create a wiki page</p>
                </div>
              </Link>
            )}

            <Link
              href="/wiki/categories/all"
              className="flex items-center gap-3 p-4 rounded-lg border border-bg-tertiary bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <FolderOpen className="h-5 w-5 text-accent-warning" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Categories</p>
                <p className="text-xs text-text-secondary">Browse by category</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
