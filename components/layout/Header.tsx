'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { BookOpen, Search, Plus, Settings, ExternalLink, LogIn, LogOut } from 'lucide-react';
import { PIX3LBOARD_URL } from '@/lib/constants';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-bg-tertiary bg-bg-primary/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors">
            <BookOpen className="h-6 w-6 text-accent-primary" />
            <span className="font-bold text-lg">Pix<span className="text-red-500">3</span><span className="text-blue-500">l</span>Wiki</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/wiki" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Pages
            </Link>
            <Link href="/wiki/search" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
              <Search className="h-3.5 w-3.5" />
              Search
            </Link>
            {isAuthenticated && (
              <Link href="/wiki/new" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />
                New Page
              </Link>
            )}
            {user?.is_admin && (
              <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                <Settings className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <a
            href={PIX3LBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1"
          >
            Pix3lBoard
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary hidden sm:inline">
                {user?.name || user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="p-2 rounded hover:bg-bg-secondary transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
