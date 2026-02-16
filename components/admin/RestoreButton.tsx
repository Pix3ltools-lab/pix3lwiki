'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/lib/context/UIContext';
import { Upload } from 'lucide-react';

export function RestoreButton() {
  const { showToast, showConfirmDialog } = useUI();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    let data: unknown;
    try {
      const text = await file.text();
      data = JSON.parse(text);
    } catch {
      showToast('Invalid JSON file', 'error');
      return;
    }

    showConfirmDialog({
      title: 'Restore from Backup',
      message: 'This will replace ALL wiki pages, categories, versions, and links. This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Restore',
      onConfirm: () => doRestore(data),
    });
  };

  const doRestore = async (data: unknown) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || 'Restore failed', 'error');
        return;
      }

      const { counts } = result;
      showToast(
        `Restored ${counts.pages} pages, ${counts.categories} categories, ${counts.versions} versions, ${counts.links} links`,
        'success'
      );
    } catch {
      showToast('Restore failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
      />
      <Button variant="danger" size="sm" onClick={handleClick} isLoading={loading}>
        <Upload className="h-4 w-4 mr-1" />
        Restore
      </Button>
    </>
  );
}
