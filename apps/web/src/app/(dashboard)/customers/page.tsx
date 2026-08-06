'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Star,
  User,
  Phone,
  Ruler,
  Calendar,
  Filter,
  Eye,
  Edit,
  MoreVertical,
  X,
  ChevronDown,
  Sparkles,
  Check,
  Users,
  Shirt,
  UserCheck,
  Clock
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: 'Men' | 'Women';
  preferredFit: string;
  isVip: boolean;
  measurementsCount: number;
  lastVisit: string;
  initials: string;
  email?: string;
  notes?: string;
}

const initialCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Rajeshwar Malhotra',
    phone: '+91 98765 43210',
    gender: 'Men',
    preferredFit: 'Slim Bespoke',
    isVip: true,
    measurementsCount: 3,
    lastVisit: '2 days ago',
    initials: 'RM',
    email: 'rajeshwar.m@example.com',
    notes: 'Prefers English cut jackets with high armholes.'
  },
  {
    id: 'CUST-002',
    name: 'Ananya Sharma',
    phone: '+91 98765 43211',
    gender: 'Women',
    preferredFit: 'Regular',
    isVip: true,
    measurementsCount: 5,
    lastVisit: '1 day ago',
    initials: 'AS',
    email: 'ananya.s@example.com',
    notes: 'Silk blouse waistline preference +1.5 inch ease.'
  },
  {
    id: 'CUST-003',
    name: 'Vikram Singh',
    phone: '+91 98765 43212',
    gender: 'Men',
    preferredFit: 'Regular',
    isVip: false,
    measurementsCount: 1,
    lastVisit: '1 week ago',
    initials: 'VS',
    email: 'vikram.singh@example.com',
    notes: 'Classic two-piece suit fit.'
  },
  {
    id: 'CUST-004',
    name: 'Priya Patel',
    phone: '+91 98765 43213',
    gender: 'Women',
    preferredFit: 'Slim',
    isVip: false,
    measurementsCount: 2,
    lastVisit: '3 days ago',
    initials: 'PP',
    email: 'priya.patel@example.com',
    notes: 'Contour darts required on all fitted lehengas.'
  },
  {
    id: 'CUST-005',
    name: 'Mohammed Farooq',
    phone: '+91 98765 43214',
    gender: 'Men',
    preferredFit: 'Relaxed',
    isVip: false,
    measurementsCount: 1,
    lastVisit: '2 weeks ago',
    initials: 'MF',
    email: 'm.farooq@example.com',
    notes: 'Kurta pajama set specialist fit.'
  },
  {
    id: 'CUST-006',
    name: 'Deepika Nair',
    phone: '+91 98765 43215',
    gender: 'Women',
    preferredFit: 'Regular',
    isVip: true,
    measurementsCount: 4,
    lastVisit: 'Today',
    initials: 'DN',
    email: 'deepika.nair@example.com',
    notes: 'VIP bridal consultation client.'
  },
  {
    id: 'CUST-007',
    name: 'Arjun Kapoor',
    phone: '+91 98765 43216',
    gender: 'Men',
    preferredFit: 'Slim Bespoke',
    isVip: false,
    measurementsCount: 2,
    lastVisit: '5 days ago',
    initials: 'AK',
    email: 'arjun.k@example.com',
    notes: 'Double-breasted blazer specifications.'
  },
  {
    id: 'CUST-008',
    name: 'Meera Reddy',
    phone: '+91 98765 43217',
    gender: 'Women',
    preferredFit: 'Slim',
    isVip: false,
    measurementsCount: 1,
    lastVisit: '1 week ago',
    initials: 'MR',
    email: 'meera.reddy@example.com',
    notes: 'Anarkali flared trial pending.'
  }
];

export default function CustomerDirectoryPage() {
  const [customersList, setCustomersList] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Men' | 'Women'>('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    gender: 'Men' as 'Men' | 'Women',
    preferredFit: 'Slim Bespoke',
    isVip: false,
    notes: ''
  });

  // Filtered Customers Calculation
  const filteredCustomers = useMemo(() => {
    return customersList.filter((c) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGender = genderFilter === 'All' || c.gender === genderFilter;
      const matchVip = !vipOnly || c.isVip;

      return matchSearch && matchGender && matchVip;
    });
  }, [customersList, searchQuery, genderFilter, vipOnly]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: customersList.length,
      vip: customersList.filter((c) => c.isVip).length,
      men: customersList.filter((c) => c.gender === 'Men').length,
      women: customersList.filter((c) => c.gender === 'Women').length
    };
  }, [customersList]);

  // Add New Customer Handler
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    const initials = newCustomer.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const createdCustomer: Customer = {
      id: `CUST-00${customersList.length + 1}`,
      name: newCustomer.name,
      phone: newCustomer.phone,
      gender: newCustomer.gender,
      preferredFit: newCustomer.preferredFit,
      isVip: newCustomer.isVip,
      measurementsCount: 1,
      lastVisit: 'Today',
      initials: initials || 'CU',
      notes: newCustomer.notes || 'New customer profile created.'
    };

    setCustomersList([createdCustomer, ...customersList]);
    setIsAddModalOpen(false);
    setNewCustomer({
      name: '',
      phone: '',
      gender: 'Men',
      preferredFit: 'Slim Bespoke',
      isVip: false,
      notes: ''
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGenderFilter('All');
    setVipOnly(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Directory</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage atelier client profiles, fit preferences, and VIP measurement history
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-gold flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Clients</span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-500">Active</span>
          </div>
        </div>

        <div className="glass-card-gold rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">VIP Members</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-yellow-300">{stats.vip}</span>
            <span className="text-[11px] text-yellow-500/80">Priority Atelier</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Men Clients</span>
            <Shirt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.men}</span>
            <span className="text-[11px] text-slate-500">Profiles</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Women Clients</span>
            <UserCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white">{stats.women}</span>
            <span className="text-[11px] text-slate-500">Profiles</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or phone number..."
              className="input-dark pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Filter Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'All' | 'Men' | 'Women')}
                className="input-dark pr-8 appearance-none cursor-pointer text-xs font-medium"
              >
                <option value="All" className="bg-slate-900 text-white">All Genders</option>
                <option value="Men" className="bg-slate-900 text-white">Men</option>
                <option value="Women" className="bg-slate-900 text-white">Women</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* VIP Toggle */}
            <button
              type="button"
              onClick={() => setVipOnly(!vipOnly)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                vipOnly
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-sm shadow-yellow-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${vipOnly ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
              <span>VIP Status</span>
              {vipOnly && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
            </button>

            {/* Reset Button (only if filters active) */}
            {(searchQuery || genderFilter !== 'All' || vipOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-ghost text-xs py-2 px-3 flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredCustomers.length}</strong> of{' '}
            <strong className="text-white">{customersList.length}</strong> customers
          </span>
          {(searchQuery || genderFilter !== 'All' || vipOnly) && (
            <span className="text-[11px] text-yellow-400/90 font-medium">
              Filtered by: {[searchQuery && `"${searchQuery}"`, genderFilter !== 'All' && `Gender: ${genderFilter}`, vipOnly && 'VIP Only'].filter(Boolean).join(' • ')}
            </span>
          )}
        </div>
      </div>

      {/* 3 & 4. Customer Table Container with glass-card */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4">Gender</th>
                <th className="py-4 px-4">Preferred Fit</th>
                <th className="py-4 px-4">VIP Status</th>
                <th className="py-4 px-4">Measurements</th>
                <th className="py-4 px-4">Last Visit</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  {/* Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border ${
                          customer.gender === 'Men'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {customer.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors flex items-center space-x-1.5">
                          <span>{customer.name}</span>
                          {customer.isVip && (
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 inline shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{customer.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  </td>

                  {/* Gender */}
                  <td className="py-4 px-4">
                    {customer.gender === 'Men' ? (
                      <span className="badge badge-blue">Men</span>
                    ) : (
                      <span className="badge badge-rose">Women</span>
                    )}
                  </td>

                  {/* Preferred Fit */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300">
                      {customer.preferredFit}
                    </span>
                  </td>

                  {/* VIP Status */}
                  <td className="py-4 px-4">
                    {customer.isVip ? (
                      <span className="badge badge-gold flex items-center space-x-1 w-fit">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>VIP</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs px-2 py-0.5">No</span>
                    )}
                  </td>

                  {/* Measurements */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-medium">
                      <Ruler className="w-3.5 h-3.5 text-yellow-500/80 shrink-0" />
                      <span>{customer.measurementsCount} {customer.measurementsCount === 1 ? 'version' : 'versions'}</span>
                    </div>
                  </td>

                  {/* Last Visit */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{customer.lastVisit}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        title="View Details"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        title="Edit Customer"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-yellow-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <User className="w-6 h-6" />
                      </div>
                      <p className="text-slate-300 text-sm font-semibold">No matching customers</p>
                      <p className="text-slate-500 text-xs">
                        Try adjusting your search keywords or filter criteria to find the profile.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Displaying <strong>{filteredCustomers.length}</strong> customer records</span>
          <span className="font-mono text-slate-500">Directory Page 1 of 1</span>
        </div>
      </div>

      {/* Modal: Add Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card-gold rounded-2xl border border-yellow-500/30 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Customer</h2>
                  <p className="text-xs text-slate-400">Create client profile for tailoring measurements</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajeshwar Malhotra"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="input-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="input-dark font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Gender *</label>
                  <select
                    value={newCustomer.gender}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gender: e.target.value as 'Men' | 'Women' })}
                    className="input-dark cursor-pointer"
                  >
                    <option value="Men" className="bg-slate-900">Men</option>
                    <option value="Women" className="bg-slate-900">Women</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Preferred Fit *</label>
                  <select
                    value={newCustomer.preferredFit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, preferredFit: e.target.value })}
                    className="input-dark cursor-pointer"
                  >
                    <option value="Slim Bespoke" className="bg-slate-900">Slim Bespoke</option>
                    <option value="Slim" className="bg-slate-900">Slim</option>
                    <option value="Regular" className="bg-slate-900">Regular</option>
                    <option value="Relaxed" className="bg-slate-900">Relaxed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="vip-checkbox"
                  checked={newCustomer.isVip}
                  onChange={(e) => setNewCustomer({ ...newCustomer, isVip: e.target.checked })}
                  className="w-4 h-4 rounded accent-yellow-500 cursor-pointer"
                />
                <label htmlFor="vip-checkbox" className="text-xs font-semibold text-yellow-400 cursor-pointer flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>Mark as VIP Client (Priority Atelier Service)</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Fit Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="Special tailoring notes, posture adjustments..."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="input-dark resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Details Modal: Selected Customer Details */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border ${
                    selectedCustomer.gender === 'Men'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedCustomer.initials}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                    {selectedCustomer.isVip && (
                      <span className="badge badge-gold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>VIP</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Phone</span>
                <p className="text-white font-mono font-medium">{selectedCustomer.phone}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Gender</span>
                <p className="text-white font-medium">{selectedCustomer.gender}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Preferred Fit</span>
                <p className="text-yellow-400 font-semibold">{selectedCustomer.preferredFit}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Last Visit</span>
                <p className="text-white font-medium">{selectedCustomer.lastVisit}</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center space-x-1.5">
                  <Ruler className="w-4 h-4 text-yellow-400" />
                  <span>Measurement History</span>
                </span>
                <span className="text-yellow-400 font-mono font-bold">{selectedCustomer.measurementsCount} Versions Saved</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {selectedCustomer.notes || 'No custom tailor notes logged.'}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-ghost text-xs"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-gold text-xs flex items-center space-x-1.5"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Open Measurements Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
