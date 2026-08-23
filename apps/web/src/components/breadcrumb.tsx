'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  measurements: 'Measurements',
  orders: 'Orders',
  production: 'Production',
  staff: 'Staff Management',
  admin: 'Admin Panel',
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps = {}) {
  const pathname = usePathname();
  
  if (items && items.length > 0) {
    return (
      <nav className="flex items-center text-sm font-medium" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-slate-400 hover:text-[#f5d061] transition-colors flex items-center">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = item.active || index === items.length - 1;
            
            return (
              <li key={item.label + index} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-[#f5d061] mx-1 opacity-60" />
                {isLast || !item.href ? (
                  <span className="text-slate-200" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="text-slate-400 hover:text-[#f5d061] transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Split path and remove empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return null; // Do not show breadcrumbs on the root
  }

  return (
    <nav className="flex items-center text-sm font-medium" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/dashboard" className="text-slate-400 hover:text-[#f5d061] transition-colors flex items-center">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
          
          return (
            <li key={segment} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-[#f5d061] mx-1 opacity-60" />
              {isLast ? (
                <span className="text-slate-200" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="text-slate-400 hover:text-[#f5d061] transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
