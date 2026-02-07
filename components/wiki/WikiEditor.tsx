'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useUI } from '@/lib/context/UIContext';
import { WikiCategory, WikiPageWithAuthor } from '@/types';
import { Bold, Italic, Code, List, Link2, Heading, Eye, Edit } from 'lucide-react';

interface WikiEditorProps {
  page?: WikiPageWithAuthor;
  mode: 'create' | 'edit';
}

export function WikiEditor({ page, mode }: WikiEditorProps) {
  const router = useRouter();
  const { showToast } = useUI();
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [categoryId, setCategoryId] = useState(page?.category_id || '');
  const [tags, setTags] = useState(page?.tags?.join(', ') || '');
  const [status, setStatus] = useState<'draft' | 'published'>(
    (page?.status as 'draft' | 'published') || 'published'
  );
  const [changeSummary, setChangeSummary] = useState('');
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/wiki/categories')
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => {});
  }, []);

  const insertMarkdown = useCallback((prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea[data-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  }, [content]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const body = {
        title: title.trim(),
        content,
        category_id: categoryId || null,
        tags: parsedTags,
        status,
        ...(mode === 'edit' && changeSummary ? { change_summary: changeSummary } : {}),
      };

      const url = mode === 'create'
        ? '/api/wiki/pages'
        : `/api/wiki/pages/${page!.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to save', 'error');
        return;
      }

      showToast(mode === 'create' ? 'Page created!' : 'Page updated!', 'success');

      if (mode === 'create' && data.page?.slug) {
        router.push(`/wiki/${data.page.slug}`);
      } else if (page?.slug) {
        router.push(`/wiki/${page.slug}`);
      }
    } catch {
      showToast('Failed to save page', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
      />

      {/* Meta row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary border border-bg-tertiary rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2"
        />
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="w-full px-3 py-2 bg-bg-secondary border border-bg-tertiary rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {mode === 'edit' && (
        <Input
          label="Change summary (optional)"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="Brief description of changes"
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 border border-bg-tertiary rounded-t-lg p-2 bg-bg-secondary">
        <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="Bold">
          <Bold className="h-4 w-4 text-text-secondary" />
        </button>
        <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="Italic">
          <Italic className="h-4 w-4 text-text-secondary" />
        </button>
        <button onClick={() => insertMarkdown('`', '`')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="Code">
          <Code className="h-4 w-4 text-text-secondary" />
        </button>
        <button onClick={() => insertMarkdown('## ')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="Heading">
          <Heading className="h-4 w-4 text-text-secondary" />
        </button>
        <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="List">
          <List className="h-4 w-4 text-text-secondary" />
        </button>
        <button onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 rounded hover:bg-bg-tertiary transition-colors" title="Link">
          <Link2 className="h-4 w-4 text-text-secondary" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 px-2 py-1 rounded text-sm text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          {showPreview ? <Edit className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="min-h-[400px] p-4 border border-bg-tertiary rounded-b-lg bg-bg-primary">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-text-secondary italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          data-editor="true"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] px-4 py-3 bg-bg-primary border border-bg-tertiary rounded-b-lg text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary resize-y"
          placeholder="Write your content in Markdown..."
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={saving}>
          {mode === 'create' ? 'Create Page' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
