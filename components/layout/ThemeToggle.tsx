'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pix3lwiki-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pix3lwiki-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pix3lwiki-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded hover:bg-bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-text-secondary" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary" />
      )}
    </button>
  );
}
