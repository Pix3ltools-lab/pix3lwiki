'use client';

import { useState, useEffect } from 'react';
import { Pix3lBoardLink } from '@/types';
import { ExternalLink } from 'lucide-react';
import { PIX3LBOARD_URL } from '@/lib/constants';

interface LinkedBoardInfoProps {
  pageId: string;
}

export function LinkedBoardInfo({ pageId }: LinkedBoardInfoProps) {
  const [links, setLinks] = useState<Pix3lBoardLink[]>([]);

  useEffect(() => {
    fetch(`/api/wiki/links?wiki_page_id=${pageId}`)
      .then(res => res.json())
      .then(data => { if (data.links) setLinks(data.links); })
      .catch(() => {});
  }, [pageId]);

  if (links.length === 0) return null;

  return (
    <div className="border border-bg-tertiary rounded-lg p-4 bg-bg-secondary">
      <h3 className="text-sm font-semibold text-text-primary mb-2">Linked Boards</h3>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={
              link.card_id && link.board_id
                ? `${PIX3LBOARD_URL}/board/${link.board_id}?card=${link.card_id}`
                : link.board_id
                  ? `${PIX3LBOARD_URL}/board/${link.board_id}`
                  : PIX3LBOARD_URL
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="capitalize">{link.link_type}</span>
            {link.board_id && <span className="text-xs text-text-secondary">Board: {link.board_id.slice(0, 8)}...</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
