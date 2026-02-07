'use client';

import { useState, useEffect } from 'react';
import { Pix3lBoardBridge } from './pix3lboard';
import { WikiContext } from '@/types';

export function useWikiContext(): WikiContext | null {
  const [context, setContext] = useState<WikiContext | null>(null);

  useEffect(() => {
    // First check URL params
    const urlContext = Pix3lBoardBridge.parseUrlContext();
    if (urlContext) {
      Pix3lBoardBridge.setContext(urlContext);
      setContext(urlContext);
      return;
    }

    // Then check localStorage
    const storedContext = Pix3lBoardBridge.getContext();
    if (storedContext) {
      setContext(storedContext);
    }
  }, []);

  return context;
}

export function useBackLink(): { url: string; label: string } | null {
  const context = useWikiContext();

  if (!context) return null;

  if (context.cardId && context.boardId) {
    return {
      url: Pix3lBoardBridge.getCardUrl(context.boardId, context.cardId),
      label: 'Back to Card',
    };
  }

  if (context.boardId) {
    return {
      url: Pix3lBoardBridge.getBoardUrl(context.boardId),
      label: 'Back to Board',
    };
  }

  return {
    url: Pix3lBoardBridge.getBoardUrl(),
    label: 'Back to Pix3lBoard',
  };
}
