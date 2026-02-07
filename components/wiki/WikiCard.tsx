import Link from 'next/link';
import { CategoryBadge } from './CategoryBadge';
import { TagList } from './TagList';
import { WikiPageWithAuthor } from '@/types';
import { Clock, User } from 'lucide-react';

interface WikiCardProps {
  page: WikiPageWithAuthor;
}

export function WikiCard({ page }: WikiCardProps) {
  // Get first 150 chars of content as excerpt
  const excerpt = page.content
    .replace(/^#+\s.+$/gm, '')
    .replace(/[*_`~\[\]]/g, '')
    .trim()
    .substring(0, 150);

  return (
    <Link
      href={`/wiki/${page.slug}`}
      className="block p-4 rounded-lg border border-bg-tertiary bg-bg-secondary hover:bg-bg-tertiary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-text-primary">{page.title}</h3>
        {page.category_name && (
          <CategoryBadge name={page.category_name} color={page.category_color || undefined} />
        )}
      </div>

      {excerpt && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {excerpt}...
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <User className="h-3 w-3" />
          {page.author_name || page.author_email}
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <Clock className="h-3 w-3" />
          {new Date(page.updated_at).toLocaleDateString()}
        </span>
        {page.tags.length > 0 && <TagList tags={page.tags} />}
      </div>
    </Link>
  );
}
