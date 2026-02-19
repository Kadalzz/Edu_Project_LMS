'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();

  const allItems = showHome
    ? [{ label: 'Dashboard', href: '/dashboard' }, ...items]
    : items;

  return (
    <nav className="flex items-center gap-2 text-sm mb-6 py-3 px-4 bg-white rounded-lg border border-gray-200">
      {showHome && (
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      )}

      {allItems.slice(showHome ? 1 : 0).map((item, index) => {
        const isLast = index === allItems.length - (showHome ? 2 : 1);
        const isActive = pathname === item.href;

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`transition-colors ${
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Helper function to generate breadcrumbs from route structure
export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname();
  
  if (customItems) {
    return customItems;
  }

  // Auto-generate from pathname
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip dashboard segment as it's already in home
    if (segment === 'dashboard' && index === 0) {
      return;
    }

    // Capitalize and clean segment names
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Don't add href for the last item (current page)
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}
