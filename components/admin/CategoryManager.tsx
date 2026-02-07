'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useUI } from '@/lib/context/UIContext';
import { WikiCategory } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function CategoryManager() {
  const { showToast, showConfirmDialog } = useUI();
  const [categories, setCategories] = useState<(WikiCategory & { page_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WikiCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/wiki/categories')
      .then(res => res.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#8b5cf6');
    setShowModal(true);
  };

  const openEdit = (cat: WikiCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const body = { name: name.trim(), description: description.trim() || null, color };
      const url = editingCategory
        ? `/api/wiki/categories/${editingCategory.id}`
        : '/api/wiki/categories';

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editingCategory ? 'Category updated' : 'Category created', 'success');
        setShowModal(false);
        loadCategories();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      showToast('Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: WikiCategory) => {
    showConfirmDialog({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? Pages in this category will become uncategorized.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/wiki/categories/${cat.id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Category deleted', 'success');
            loadCategories();
          } else {
            showToast('Failed to delete category', 'error');
          }
        } catch {
          showToast('Failed to delete category', 'error');
        }
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Categories</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-text-secondary py-4">No categories yet</p>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-lg border border-bg-tertiary bg-bg-secondary"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                  {cat.description && (
                    <p className="text-xs text-text-secondary">{cat.description}</p>
                  )}
                </div>
                {cat.page_count !== undefined && (
                  <span className="text-xs text-text-secondary">
                    {cat.page_count} page{cat.page_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded hover:bg-bg-tertiary transition-colors"
                >
                  <Edit className="h-4 w-4 text-text-secondary" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded hover:bg-accent-danger/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-accent-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
          />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded border border-bg-tertiary cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#8b5cf6"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
