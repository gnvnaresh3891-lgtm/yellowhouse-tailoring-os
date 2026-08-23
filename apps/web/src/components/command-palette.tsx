'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Ruler, 
  ShoppingBag, 
  Factory, 
  UserCircle, 
  ShieldAlert,
  FileText,
  Clock,
  Sparkles,
  Cpu,
  Package,
  Award,
  Scissors
} from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';

const pages = [
  { id: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: '/customers', title: 'Customers', icon: Users },
  { id: '/measurements', title: 'Measurements', icon: Ruler },
  { id: '/orders', title: 'Orders', icon: ShoppingBag },
  { id: '/production', title: 'Production', icon: Factory },
  { id: '/staff', title: 'Staff Management', icon: UserCircle },
  { id: '/admin', title: 'Admin Panel', icon: ShieldAlert },
  { id: '/marketplace', title: 'Digital Asset Marketplace', icon: ShoppingBag },
  { id: '/equipment', title: 'Workshop Equipment Rentals', icon: Cpu },
  { id: '/supply', title: 'Vendor Material Sourcing', icon: Package },
  { id: '/bidding', title: 'Production Bidding & Tailor Hub', icon: Award },
  { id: '/stylists', title: 'Stylist Directory & Trial Hub', icon: Sparkles },
];

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((open) => !open),
  };
}

export function CommandPalette({ isOpen, close, onClose }: { isOpen: boolean; close?: () => void; onClose?: () => void }) {
  const handleClose = close || onClose || (() => {});
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOrders(getLocalStorage('yh_orders', []));
      setCustomers(getLocalStorage('yh_customers', []));
      setRecentSearches(getLocalStorage('yh_recent_searches', []));
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  const filteredOrders = orders.filter(o => 
    (o.id && o.id.toLowerCase().includes(query.toLowerCase())) || 
    (o.clientName && o.clientName.toLowerCase().includes(query.toLowerCase()))
  );
  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(query.toLowerCase())) || 
    (c.phone && c.phone.includes(query))
  );

  const isSearching = query.length > 0;

  const results = isSearching ? [
    ...filteredPages.map(p => ({ ...p, type: 'page', icon: p.icon })),
    ...filteredOrders.map(o => ({ id: `/orders/${o.id}`, title: o.clientName || 'Unknown Order', subtitle: o.id, type: 'order', icon: FileText })),
    ...filteredCustomers.map(c => ({ id: `/customers/${c.id || c.phone}`, title: c.name || 'Unknown Customer', subtitle: c.phone, type: 'customer', icon: Users }))
  ] : recentSearches;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: any) => {
    const newRecent = [item, ...recentSearches.filter((r: any) => r.id !== item.id)].slice(0, 5);
    setLocalStorage('yh_recent_searches', newRecent);
    
    handleClose();
    router.push(item.id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 sm:pt-48">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#111827] border border-[#f5d061]/20 shadow-2xl transition-all glass-card animate-fade-in mx-4">
        {/* Search Input */}
        <div className="relative border-b border-[#f5d061]/10">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[#f5d061]" />
          <input
            ref={inputRef}
            className="h-12 w-full bg-transparent pl-11 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
            placeholder="Search pages, orders, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#f5d061]/30 scrollbar-track-transparent">
          {results.length === 0 ? (
            <div className="py-14 px-6 text-center text-sm sm:px-14">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5d061]/10 mb-4">
                <Search className="h-6 w-6 text-[#f5d061]/50" />
              </div>
              <p className="text-slate-200">No results found</p>
              <p className="text-slate-400 mt-1">We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <ul>
              {results.map((item, idx) => {
                const Icon = item.icon || Clock;
                const isSelected = idx === selectedIndex;
                
                return (
                  <li
                    key={item.id}
                    className={`group flex cursor-default select-none items-center rounded-xl p-3 transition-colors ${
                      isSelected ? 'bg-[#f5d061]/10 text-[#f5d061]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
                      isSelected ? 'bg-[#f5d061]/20 text-[#f5d061]' : 'bg-[#1f2937] text-slate-400 group-hover:text-white'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="ml-4 flex-auto">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className={`text-xs ${isSelected ? 'text-[#f5d061]/70' : 'text-slate-500'}`}>
                          {item.type === 'order' ? 'Order ID: ' : ''}{item.subtitle}
                        </p>
                      )}
                    </div>
                    {item.type && (
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ${
                        isSelected ? 'bg-[#f5d061]/20 text-[#f5d061]' : 'bg-[#1f2937] text-slate-500'
                      }`}>
                        {item.type}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-[#f5d061]/10 bg-[#111827]/50 px-4 py-3 text-xs text-slate-400 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded-md bg-[#1f2937] border border-slate-700 font-sans">↑</kbd><kbd className="px-1.5 py-0.5 rounded-md bg-[#1f2937] border border-slate-700 font-sans">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded-md bg-[#1f2937] border border-slate-700 font-sans">Enter</kbd> to select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded-md bg-[#1f2937] border border-slate-700 font-sans">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
