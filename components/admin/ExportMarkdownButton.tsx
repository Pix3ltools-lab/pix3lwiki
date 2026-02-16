'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/lib/context/UIContext';
import { FileArchive } from 'lucide-react';

export function ExportMarkdownButton() {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/export/markdown');
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Export failed', 'error');
        return;
      }

      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : 'pix3lwiki-markdown.zip';

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast('Markdown export downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} isLoading={loading}>
      <FileArchive className="h-4 w-4 mr-1" />
      Export MD
    </Button>
  );
}
