'use client';

import { useBackLink } from '@/lib/bridge/hooks';
import { ArrowLeft } from 'lucide-react';

export function Pix3lBoardLink() {
  const backLink = useBackLink();

  if (!backLink) return null;

  return (
    <a
      href={backLink.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-bg-secondary border border-bg-tertiary rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {backLink.label}
    </a>
  );
}
