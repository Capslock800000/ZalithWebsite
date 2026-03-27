import { useEffect, useState } from 'react';
import type { TableOfContentsItem } from '../../types/blog';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h4 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider mb-4">
        Table of Contents
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToHeading(item.id)}
              className={`text-sm text-left w-full py-1 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'text-[var(--brand)] bg-[var(--brand)]/10'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--divider)]/10'
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
