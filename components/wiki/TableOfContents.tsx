'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const regex = /^(#{1,4})\s+(.+)$/gm;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s]+/g, '-');
      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="border border-bg-tertiary rounded-lg p-4 bg-bg-secondary">
      <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {headings.map((heading, index) => (
          <li key={index}>
            <button
              onClick={() => handleClick(heading.id)}
              className={clsx(
                'text-sm text-text-secondary hover:text-accent-primary transition-colors text-left w-full truncate',
                heading.level === 1 && 'font-medium',
                heading.level === 2 && 'pl-3',
                heading.level === 3 && 'pl-6',
                heading.level === 4 && 'pl-9'
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
