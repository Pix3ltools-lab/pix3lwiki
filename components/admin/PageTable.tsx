'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CategoryBadge } from '@/components/wiki/CategoryBadge';
import { useUI } from '@/lib/context/UIContext';
import { WikiPageWithAuthor } from '@/types';
import { Edit, Trash2, Eye } from 'lucide-react';

export function PageTable() {
  const { showToast, showConfirmDialog } = useUI();
  const [pages, setPages] = useState<WikiPageWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPages = () => {
    setLoading(true);
    fetch('/api/wiki/pages')
      .then(res => res.json())
      .then(data => { if (data.pages) setPages(data.pages); })
      .catch(() => showToast('Failed to load pages', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPages(); }, []);

  const handleDelete = (page: WikiPageWithAuthor) => {
    showConfirmDialog({
      title: 'Delete Page',
      message: `Are you sure you want to delete "${page.title}"? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/wiki/pages/${page.id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Page deleted', 'success');
            loadPages();
          } else {
            showToast('Failed to delete page', 'error');
          }
        } catch {
          showToast('Failed to delete page', 'error');
        }
      },
    });
  };

  const statusColors: Record<string, string> = {
    published: 'text-accent-success bg-accent-success/10',
    draft: 'text-accent-warning bg-accent-warning/10',
    archived: 'text-text-secondary bg-bg-tertiary',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-4">Pages</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : pages.length === 0 ? (
        <p className="text-text-secondary py-4">No pages yet</p>
      ) : (
        <div className="border border-bg-tertiary rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-secondary">
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Title</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden lg:table-cell">Updated</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t border-bg-tertiary hover:bg-bg-secondary/50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-text-primary">{page.title}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {page.category_name ? (
                      <CategoryBadge name={page.category_name} color={page.category_color || undefined} />
                    ) : (
                      <span className="text-xs text-text-secondary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[page.status]}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-text-secondary">
                    {page.author_name || page.author_email}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-text-secondary">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/wiki/${page.slug}`}
                        className="p-1.5 rounded hover:bg-bg-tertiary transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4 text-text-secondary" />
                      </Link>
                      <Link
                        href={`/wiki/${page.slug}/edit`}
                        className="p-1.5 rounded hover:bg-bg-tertiary transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-text-secondary" />
                      </Link>
                      <button
                        onClick={() => handleDelete(page)}
                        className="p-1.5 rounded hover:bg-accent-danger/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-accent-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
