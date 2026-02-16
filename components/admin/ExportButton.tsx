'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/lib/context/UIContext';
import { Download } from 'lucide-react';

export function ExportButton() {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Export failed', 'error');
        return;
      }

      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : 'pix3lwiki-export.json';

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast('Export downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} isLoading={loading}>
      <Download className="h-4 w-4 mr-1" />
      Export
    </Button>
  );
}
