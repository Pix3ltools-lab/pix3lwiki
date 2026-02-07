'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { PageTable } from '@/components/admin/PageTable';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
          <CategoryManager />
          <PageTable />
        </div>
      </main>
    </div>
  );
}
