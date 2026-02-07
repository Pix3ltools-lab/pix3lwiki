'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TableOfContents } from './TableOfContents';
import { CategoryBadge } from './CategoryBadge';
import { TagList } from './TagList';
import { WikiPageWithAuthor } from '@/types';
import { Edit, Clock, User } from 'lucide-react';

interface WikiPageViewProps {
  page: WikiPageWithAuthor;
}

export function WikiPageView({ page }: WikiPageViewProps) {
  const { user, isAuthenticated } = useAuth();
  const canEdit = isAuthenticated && (user?.id === page.author_id || user?.is_admin);

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <article className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl font-bold text-text-primary">{page.title}</h1>
            {canEdit && (
              <Link
                href={`/wiki/${page.slug}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-bg-secondary border border-bg-tertiary rounded hover:bg-bg-tertiary transition-colors flex-shrink-0"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            {page.category_name && (
              <CategoryBadge name={page.category_name} color={page.category_color || undefined} />
            )}
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {page.author_name || page.author_email}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(page.updated_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-text-secondary">v{page.version}</span>
          </div>

          {page.tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={page.tags} />
            </div>
          )}

          {page.status !== 'published' && (
            <div className="mt-3 px-3 py-1.5 rounded bg-accent-warning/10 text-accent-warning text-sm font-medium inline-block">
              {page.status === 'draft' ? 'Draft' : 'Archived'}
            </div>
          )}
        </div>

        {/* Content */}
        <MarkdownRenderer content={page.content} />
      </article>

      {/* TOC sidebar */}
      {page.content && (
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <TableOfContents content={page.content} />
          </div>
        </div>
      )}
    </div>
  );
}
