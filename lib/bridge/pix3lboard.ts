import { PIX3LBOARD_URL } from '@/lib/constants';
import { WikiContext } from '@/types';

const STORAGE_KEY = 'pix3lwiki-context';

export class Pix3lBoardBridge {
  static getContext(): WikiContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static setContext(context: WikiContext): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }

  static clearContext(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  static parseUrlContext(): WikiContext | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const boardId = params.get('board');
    const cardId = params.get('card');
    const workspaceId = params.get('workspace');

    if (!boardId && !cardId && !workspaceId) return null;

    const context: WikiContext = {};
    if (boardId) context.boardId = boardId;
    if (cardId) context.cardId = cardId;
    if (workspaceId) context.workspaceId = workspaceId;

    return context;
  }

  static getBoardUrl(boardId?: string): string {
    if (boardId) return `${PIX3LBOARD_URL}/board/${boardId}`;
    return PIX3LBOARD_URL;
  }

  static getCardUrl(boardId: string, cardId: string): string {
    return `${PIX3LBOARD_URL}/board/${boardId}?card=${cardId}`;
  }
}
