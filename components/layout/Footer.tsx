import { PIX3LBOARD_URL } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-bg-tertiary bg-bg-primary py-4 px-6">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>Pix<span className="text-red-500">3</span><span className="text-blue-500">l</span>Wiki — Knowledge Base</span>
        <a
          href={PIX3LBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-primary transition-colors"
        >
          Pix3lBoard
        </a>
      </div>
    </footer>
  );
}
