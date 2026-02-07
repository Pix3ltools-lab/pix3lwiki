import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-text-secondary mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-text-secondary mb-6">Page not found</p>
        <Link
          href="/"
          className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
