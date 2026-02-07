'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { WikiSearch } from '@/components/wiki/WikiSearch';

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Search Wiki</h1>
            <WikiSearch />
          </div>
        </main>
      </div>
    </div>
  );
}
