'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUI } from '@/lib/context/UIContext';
import { WikiVersionWithAuthor } from '@/types';
import { Clock, User, RotateCcw } from 'lucide-react';

interface VersionHistoryProps {
  pageId: string;
  currentVersion: number;
  onRestore?: (version: WikiVersionWithAuthor) => void;
}

export function VersionHistory({ pageId, currentVersion, onRestore }: VersionHistoryProps) {
  const { showToast } = useUI();
  const [versions, setVersions] = useState<WikiVersionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/wiki/pages/${pageId}/versions`)
      .then(res => res.json())
      .then(data => { if (data.versions) setVersions(data.versions); })
      .catch(() => showToast('Failed to load versions', 'error'))
      .finally(() => setLoading(false));
  }, [pageId, showToast]);

  const handleRestore = async (version: WikiVersionWithAuthor) => {
    if (!onRestore) return;
    setRestoring(version.id);
    try {
      onRestore(version);
      showToast(`Restored to version ${version.version}`, 'success');
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Version History</h3>
      {versions.length === 0 ? (
        <p className="text-sm text-text-secondary">No version history</p>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-3 rounded border border-bg-tertiary bg-bg-secondary"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-text-primary">
                    v{v.version}
                  </span>
                  {v.version === currentVersion && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary">
                      Current
                    </span>
                  )}
                </div>
                {v.change_summary && (
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {v.change_summary}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {v.author_name || v.author_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(v.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              {onRestore && v.version !== currentVersion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(v)}
                  isLoading={restoring === v.id}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Restore
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
