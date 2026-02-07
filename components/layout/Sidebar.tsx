'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { FolderOpen, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { WikiCategory, WikiPage } from '@/types';

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [recentPages, setRecentPages] = useState<WikiPage[]>([]);
  const [showCategories, setShowCategories] = useState(true);
  const [showRecent, setShowRecent] = useState(true);

  useEffect(() => {
    fetch('/api/wiki/categories')
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => {});

    fetch('/api/wiki/pages?limit=5&status=published')
      .then(res => res.json())
      .then(data => { if (data.pages) setRecentPages(data.pages); })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-64 border-r border-bg-tertiary bg-bg-primary h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin flex-shrink-0 hidden lg:block">
      <div className="p-4 space-y-6">
        {/* Categories */}
        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider w-full hover:text-text-primary transition-colors"
          >
            {showCategories ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            <FolderOpen className="h-3.5 w-3.5" />
            Categories
          </button>
          {showCategories && (
            <nav className="mt-2 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/wiki/categories/${cat.slug}`}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                    pathname === `/wiki/categories/${cat.slug}`
                      ? 'bg-bg-secondary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </Link>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-text-secondary px-3 py-1">No categories yet</p>
              )}
            </nav>
          )}
        </div>

        {/* Recent pages */}
        <div>
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider w-full hover:text-text-primary transition-colors"
          >
            {showRecent ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            <Clock className="h-3.5 w-3.5" />
            Recent
          </button>
          {showRecent && (
            <nav className="mt-2 space-y-1">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  className={clsx(
                    'block px-3 py-1.5 rounded text-sm truncate transition-colors',
                    pathname === `/wiki/${page.slug}`
                      ? 'bg-bg-secondary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  )}
                >
                  {page.title}
                </Link>
              ))}
              {recentPages.length === 0 && (
                <p className="text-xs text-text-secondary px-3 py-1">No pages yet</p>
              )}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
