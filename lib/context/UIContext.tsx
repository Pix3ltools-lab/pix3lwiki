'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType, ConfirmDialogData } from '@/types';
import { generateId } from '@/lib/utils/id';
import { TOAST_DURATION, TOAST_DURATION_ERROR } from '@/lib/constants';

interface UIContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogData | null;
  showConfirmDialog: (data: ConfirmDialogData) => void;
  closeConfirmDialog: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = generateId();
    const duration = type === 'error' ? TOAST_DURATION_ERROR : TOAST_DURATION;

    const toast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showConfirmDialog = useCallback((data: ConfirmDialogData) => {
    setConfirmDialog(data);
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const value: UIContextType = {
    toasts,
    showToast,
    removeToast,
    confirmDialog,
    showConfirmDialog,
    closeConfirmDialog,
    isLoading,
    setIsLoading,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
