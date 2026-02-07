import Link from 'next/link';

interface CategoryBadgeProps {
  name: string;
  slug?: string;
  color?: string;
}

export function CategoryBadge({ name, slug, color = '#8b5cf6' }: CategoryBadgeProps) {
  const badge = (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );

  if (slug) {
    return <Link href={`/wiki/categories/${slug}`}>{badge}</Link>;
  }

  return badge;
}
