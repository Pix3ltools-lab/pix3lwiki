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

          {/* Experimental Warning */}
          <div className="mt-8 max-w-md mx-auto space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                ⚠️ Experimental Demo
              </h3>
              <p className="text-sm text-text-secondary">
                This is an <strong>experimental version</strong> of Pix3lWiki. Data persistence is not guaranteed
                and may be reset at any time. Use this only as a demo. The project source code is available on{' '}
                <a
                  href="https://github.com/Pix3ltools-lab/pix3lwiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  GitHub
                </a>.
              </p>
            </div>

            {/* Cloud Storage Info */}
            <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-left">
              <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                ☁️ Cloud Storage
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                Pix3lWiki shares the same cloud database as Pix3lBoard. Your wiki pages are stored{' '}
                <strong>securely in the cloud</strong> and associated with your account. This means:
              </p>
              <ul className="text-sm text-text-secondary space-y-1 ml-4">
                <li>• Access your wiki from any browser by logging in</li>
                <li>• Your pages are safe even if you clear your browser cache</li>
                <li>• Same account and credentials as Pix3lBoard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
