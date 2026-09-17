'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronRight,
  Sparkles,
  Check,
  Users,
  Shirt,
  UserCheck,
  Clock,
  Trash2,
  ShoppingBag,
  Printer,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Tag as TagIcon,
  Crown,
  HeartHandshake,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { logActivity } from '@/lib/state-sync-utils';
import { CustomerListPrint } from '@/components/print-layouts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Input } from '@/components/ui/input';
import {
  Customer,
  VIPTier,
  CustomerFilterOptions,
  INITIAL_CUSTOMERS,
  AVAILABLE_CUSTOMER_TAGS,
  filterCustomers,
  computeCustomerStats,
  buildCustomerCadLink,
  filterSnapshotsForCustomer,
  getVipTierBadgeVariant,
} from '@/lib/staff-utils';
import { formatInrCurrency } from '@/lib/production-utils';

export default function CustomerDirectoryPage() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVipTier, setSelectedVipTier] = useState<'ALL' | VIPTier>('ALL');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [selectedBalanceStatus, setSelectedBalanceStatus] = useState<'ALL' | 'OUTSTANDING' | 'SETTLED'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'RECENT' | 'SPEND_DESC' | 'ORDERS_DESC' | 'NAME_ASC'>('RECENT');

  // Drawer & Modals
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CAD Snapshots from LocalStorage
  const [savedSnapshots, setSavedSnapshots] = useState<any[]>([]);

  // New Customer Form
  const [newCustomerForm, setNewCustomerForm] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    gender: 'Men',
    preferredFit: 'Slim Bespoke',
    vipTier: 'Regular',
    city: 'Main Flagship Atelier',
    notes: '',
    tags: [],
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // Persistence & Storage Sync
  // --------------------------------------------------------------------------
  useEffect(() => {
    const stored = getLocalStorage<Customer[]>('yh_customers', INITIAL_CUSTOMERS);
    setCustomers(stored);
    const snaps = getLocalStorage<any[]>('yh_measurement_snapshots', []);
    setSavedSnapshots(snaps);
  }, []);

  const persistCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    setLocalStorage('yh_customers', updated);
  };

  // --------------------------------------------------------------------------
  // Computed Statistics & Filtering
  // --------------------------------------------------------------------------
  const stats = useMemo(() => computeCustomerStats(customers), [customers]);

  const filteredCustomers = useMemo(() => {
    return filterCustomers(customers, {
      searchQuery,
      vipTier: selectedVipTier,
      gender: selectedGender,
      balanceStatus: selectedBalanceStatus,
      tag: selectedTag,
      sortBy,
    });
  }, [customers, searchQuery, selectedVipTier, selectedGender, selectedBalanceStatus, selectedTag, sortBy]);

  // Active client snapshots
  const activeClientSnapshots = useMemo(() => {
    if (!activeCustomer) return [];
    return filterSnapshotsForCustomer(savedSnapshots, activeCustomer.id);
  }, [savedSnapshots, activeCustomer]);

  // --------------------------------------------------------------------------
  // Customer Actions
  // --------------------------------------------------------------------------
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      showToast('Name and phone number are required.');
      return;
    }

    const nextId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const initials = newCustomerForm.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const isVipTier = newCustomerForm.vipTier && newCustomerForm.vipTier !== 'Regular';

    const newPatron: Customer = {
      id: nextId,
      name: newCustomerForm.name,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email,
      gender: (newCustomerForm.gender as any) || 'Men',
      preferredFit: (newCustomerForm.preferredFit as any) || 'Regular',
      vipTier: (newCustomerForm.vipTier as any) || 'Regular',
      isVip: Boolean(isVipTier),
      totalOrders: 0,
      totalSpend: 0,
      outstandingBalance: 0,
      tags: newCustomerForm.tags || [],
      measurementsCount: 0,
      lastVisit: 'Today',
      initials,
      city: newCustomerForm.city || 'Flagship Atelier',
      notes: newCustomerForm.notes || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newPatron, ...customers];
    persistCustomers(updated);
    logActivity({
      type: 'customer_added',
      message: `Enrolled new atelier client: ${newPatron.name} (${newPatron.vipTier})`,
    });

    setShowAddModal(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      gender: 'Men',
      preferredFit: 'Slim Bespoke',
      vipTier: 'Regular',
      city: 'Main Flagship Atelier',
      notes: '',
      tags: [],
    });
    showToast(`Registered patron ${newPatron.name}`);
  };

  const handleUpdateCustomer = () => {
    if (!activeCustomer || !editForm) return;

    const updatedList = customers.map((c) => {
      if (c.id === activeCustomer.id) {
        const isVipTier = editForm.vipTier ? editForm.vipTier !== 'Regular' : c.isVip;
        return {
          ...c,
          ...editForm,
          isVip: Boolean(isVipTier),
        };
      }
      return c;
    });

    persistCustomers(updatedList);
    const updatedActive = updatedList.find((c) => c.id === activeCustomer.id) || null;
    setActiveCustomer(updatedActive);
    setIsEditing(false);
    showToast(`Profile updated for ${activeCustomer.name}`);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (!deleteReason.trim()) {
      showToast('Audit deletion reason is required.');
      return;
    }

    const patron = customers.find((c) => c.id === customerId);
    const updated = customers.filter((c) => c.id !== customerId);
    persistCustomers(updated);

    const deleteLog = getLocalStorage<any[]>('yh_deleted_customers_log', []);
    deleteLog.push({
      customerId,
      name: patron?.name,
      reason: deleteReason,
      deletedAt: new Date().toISOString(),
    });
    setLocalStorage('yh_deleted_customers_log', deleteLog);

    setIsDeleting(false);
    setDeleteReason('');
    setActiveCustomer(null);
    showToast(`Client ${customerId} archived from directory.`);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="backdrop-blur-2xl bg-slate-900/90 text-amber-300 px-4 py-2.5 rounded-full border border-amber-500/30 shadow-ios-gold text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-display">Customer CRM Directory</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Atelier Client Profiles • 4-Tier VIP Hierarchy • 2D CAD Measurement Linkage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Register
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Client Intake
          </Button>
        </div>
      </div>

      {/* KPI STAT TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Total Atelier Patrons</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums font-display">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {stats.men} Men • {stats.women} Women
          </div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">VIP & Couture Segments</div>
          <div className="text-2xl font-bold text-amber-300 mt-1 tabular-nums font-display">
            {stats.couture + stats.wedding + stats.vip}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            {stats.couture} Couture • {stats.wedding} Wedding • {stats.vip} VIP
          </div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Outstanding Balances</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 tabular-nums font-display">
            {formatInrCurrency(stats.totalOutstandingBalance)}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Pending collection upon trial</div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Lifetime B2B Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums font-display">
            {formatInrCurrency(stats.totalLifetimeRevenue)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">All invoiced bespoke commissions</div>
        </Card>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <Card variant="glass" padding="sm" className="space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by patron name, phone number, email, or client ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              inputSize="sm"
              shape="squircle"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
            {/* VIP Tier Segmented / Select */}
            <select
              value={selectedVipTier}
              onChange={(e) => setSelectedVipTier(e.target.value as any)}
              className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
            >
              <option value="ALL" className="bg-slate-900">All VIP Tiers</option>
              <option value="Couture" className="bg-slate-900">Couture Tier</option>
              <option value="Wedding" className="bg-slate-900">Wedding Bridal</option>
              <option value="VIP" className="bg-slate-900">VIP Bespoke</option>
              <option value="Regular" className="bg-slate-900">Regular Patrons</option>
            </select>

            {/* Gender Morphology */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as any)}
              className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
            >
              <option value="All" className="bg-slate-900">All Morphology</option>
              <option value="Men" className="bg-slate-900">Men</option>
              <option value="Women" className="bg-slate-900">Women</option>
            </select>

            {/* Balance Status */}
            <select
              value={selectedBalanceStatus}
              onChange={(e) => setSelectedBalanceStatus(e.target.value as any)}
              className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
            >
              <option value="ALL" className="bg-slate-900">All Balances</option>
              <option value="OUTSTANDING" className="bg-slate-900">Pending Balance Only</option>
              <option value="SETTLED" className="bg-slate-900">Settled (₹0)</option>
            </select>

            {/* Sort Criteria */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
            >
              <option value="RECENT" className="bg-slate-900">Recently Enrolled</option>
              <option value="SPEND_DESC" className="bg-slate-900">Highest Spend</option>
              <option value="ORDERS_DESC" className="bg-slate-900">Most Orders</option>
              <option value="NAME_ASC" className="bg-slate-900">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <TagIcon className="w-3 h-3" /> Tags:
          </span>
          <button
            onClick={() => setSelectedTag('')}
            className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${
              !selectedTag ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            All Tags
          </button>
          {AVAILABLE_CUSTOMER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* CUSTOMER DIRECTORY CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCustomers.map((customer) => {
          const badgeVariant = getVipTierBadgeVariant(customer.vipTier);

          return (
            <Card
              key={customer.id}
              variant="glass"
              padding="sm"
              onClick={() => {
                setActiveCustomer(customer);
                setIsEditing(false);
              }}
              hoverable
              className="relative group border-l-4 border-l-amber-500/50 transition-all duration-300 hover:border-l-amber-400"
            >
              {/* Header: Initials Avatar + Name & VIP Tier */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-amber-300 font-bold flex items-center justify-center text-sm border border-amber-500/30 shadow-inner">
                    {customer.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {customer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{customer.id} • {customer.gender}</p>
                  </div>
                </div>

                <Badge variant={badgeVariant as any} size="sm">
                  {customer.vipTier}
                </Badge>
              </div>

              {/* Contact & Demographics */}
              <div className="space-y-1 text-xs text-slate-300 my-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-200">{customer.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Preferred Fit:</span>
                  <span className="text-amber-200/90 font-medium">{customer.preferredFit}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Lifetime Spend:</span>
                  <span className="font-bold text-white tabular-nums">
                    {formatInrCurrency(customer.totalSpend || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Balance Status:</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      (customer.outstandingBalance || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {(customer.outstandingBalance || 0) > 0
                      ? `${formatInrCurrency(customer.outstandingBalance)} Due`
                      : 'Settled'}
                  </span>
                </div>
              </div>

              {/* Client Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 my-2">
                  {customer.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Actions: CAD Linking & Profile Drawer */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/5 mt-2">
                <div className="text-[10px] text-slate-400">
                  {customer.measurementsCount} CAD Snapshot{customer.measurementsCount !== 1 ? 's' : ''}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(buildCustomerCadLink(customer.id));
                    }}
                    className="h-7 px-2 text-[10px] text-amber-300 hover:text-amber-200"
                    rightIcon={<ArrowUpRight className="w-3 h-3" />}
                  >
                    CAD Studio
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setActiveCustomer(customer);
                      setIsEditing(false);
                    }}
                    className="h-7 px-2 text-[10px]"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card variant="glass" padding="lg" className="text-center py-16 space-y-3">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matching atelier clients</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, VIP tier filter, or clearing selected tags.
          </p>
        </Card>
      )}

      {/* ==================================================================== */}
      {/* FROSTED GLASS SLIDING DETAIL DRAWER / SHEET */}
      {/* ==================================================================== */}
      {activeCustomer && (
        <>
          {/* Backdrop Scrim */}
          <div
            onClick={() => setActiveCustomer(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          />

          {/* Sliding Drawer Container */}
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-amber-300 font-bold flex items-center justify-center text-lg border-2 border-amber-500/40 shadow-ios-gold">
                  {activeCustomer.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white font-display">{activeCustomer.name}</h2>
                    <Badge variant={getVipTierBadgeVariant(activeCustomer.vipTier) as any} size="sm">
                      {activeCustomer.vipTier}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeCustomer.id} • Enrolled {activeCustomer.createdAt?.slice(0, 10) || '2026'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setActiveCustomer(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="p-4 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => router.push(buildCustomerCadLink(activeCustomer.id))}
                leftIcon={<Ruler className="w-3.5 h-3.5" />}
              >
                Open 2D CAD Studio
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/orders?customerId=${activeCustomer.id}`)}
                leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              >
                New Bespoke Order
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditForm(activeCustomer);
                  setIsEditing(!isEditing);
                }}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
              {/* EDIT FORM (TOGGLEABLE) */}
              {isEditing ? (
                <div className="p-4 rounded-2xl bg-slate-850/80 border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold text-amber-300 uppercase">Edit Patron Demographics</h3>
                  <Input
                    label="Full Name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    inputSize="sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Phone"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      inputSize="sm"
                    />
                    <Input
                      label="Email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      inputSize="sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">VIP Tier</label>
                      <select
                        value={editForm.vipTier || 'Regular'}
                        onChange={(e) => setEditForm({ ...editForm, vipTier: e.target.value as any })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="Regular">Regular</option>
                        <option value="VIP">VIP</option>
                        <option value="Couture">Couture</option>
                        <option value="Wedding">Wedding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Fit</label>
                      <select
                        value={editForm.preferredFit || 'Regular'}
                        onChange={(e) => setEditForm({ ...editForm, preferredFit: e.target.value as any })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        <option value="Slim Bespoke">Slim Bespoke</option>
                        <option value="Slim">Slim</option>
                        <option value="Regular">Regular</option>
                        <option value="Relaxed">Relaxed</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label="Bespoke Tailoring & Posture Observations"
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    inputSize="sm"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="gold" size="sm" onClick={handleUpdateCustomer}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* FINANCIAL & ORDER TELEMETRY TILES */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="text-[10px] text-slate-400">Lifetime Spend</div>
                  <div className="text-base font-bold text-white mt-1 tabular-nums font-display">
                    {formatInrCurrency(activeCustomer.totalSpend || 0)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="text-[10px] text-slate-400">Total Commissions</div>
                  <div className="text-base font-bold text-amber-300 mt-1 tabular-nums font-display">
                    {activeCustomer.totalOrders} Orders
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                  <div className="text-[10px] text-slate-400">Outstanding Balance</div>
                  <div
                    className={`text-base font-bold mt-1 tabular-nums font-display ${
                      (activeCustomer.outstandingBalance || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatInrCurrency(activeCustomer.outstandingBalance || 0)}
                  </div>
                </div>
              </div>

              {/* DEMOGRAPHICS DETAIL */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-800/20 border border-white/5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Contact & Atelier Profile
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone</span>
                    <span className="font-mono text-white font-medium">{activeCustomer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email</span>
                    <span className="text-white truncate block">{activeCustomer.email || 'None on file'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Morphology & Fit</span>
                    <span className="text-amber-300 font-medium">
                      {activeCustomer.gender} • {activeCustomer.preferredFit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Metropolitan Branch</span>
                    <span className="text-slate-300">{activeCustomer.city || 'Flagship Salon'}</span>
                  </div>
                </div>
              </div>

              {/* CLIENT TAGS SECTION */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Atelier Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCustomer.tags && activeCustomer.tags.length > 0 ? (
                    activeCustomer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No tags assigned.</span>
                  )}
                </div>
              </div>

              {/* 2D CAD MEASUREMENT SNAPSHOTS CAROUSEL / PREVIEW */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    2D CAD Measurement Version History
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(buildCustomerCadLink(activeCustomer.id))}
                    className="h-6 text-[10px] text-amber-300"
                    rightIcon={<ArrowUpRight className="w-3 h-3" />}
                  >
                    Take Measurements
                  </Button>
                </div>

                {activeClientSnapshots.length > 0 ? (
                  <div className="space-y-2">
                    {activeClientSnapshots.map((snap, idx) => (
                      <div
                        key={snap.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex items-center justify-between hover:border-amber-500/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">{snap.version || `v${idx + 1}.0`}</span>
                            <Badge variant="gold" size="sm">
                              {snap.garment || 'Sherwani'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Recorded: {snap.timestamp ? new Date(snap.timestamp).toLocaleDateString() : 'Active Version'}
                          </p>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`${buildCustomerCadLink(activeCustomer.id)}&snapshotId=${snap.id}`)}
                          className="h-7 text-[10px]"
                        >
                          Open Caliper
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-800/20 border border-dashed border-white/10 text-center space-y-2">
                    <Ruler className="w-5 h-5 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">Zero saved CAD measurement snapshots for this client.</p>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => router.push(buildCustomerCadLink(activeCustomer.id))}
                      className="text-[10px]"
                    >
                      Initialize 2D Caliper Workbench
                    </Button>
                  </div>
                )}
              </div>

              {/* BESPOKE TAILORING & POSTURE OBSERVATIONS */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Master Tailor Posture & Seam Notes
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 text-slate-200 leading-relaxed">
                  {activeCustomer.notes || 'No anatomical posture offsets or tailor alterations noted.'}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleting(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Archive Patron
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setActiveCustomer(null)}>
                Close Drawer
              </Button>
            </div>

            {/* DELETION AUDIT DIALOG */}
            {isDeleting && (
              <div className="p-4 bg-rose-950/60 border-t border-rose-500/30 space-y-3">
                <div className="text-xs font-semibold text-rose-300">
                  Archive Customer Record {activeCustomer.id}
                </div>
                <Input
                  placeholder="Specify GDPR or audit reason for archiving..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  inputSize="sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCustomer(activeCustomer.id)}>
                    Confirm Archive
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* MODAL: NEW PATRON ENROLLMENT */}
      {/* ==================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <Card variant="elevated" padding="none" className="w-full max-w-lg bg-slate-900/95 border-white/15">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">New Patron Client Intake</h2>
                <Badge variant="gold" size="sm">
                  CRM
                </Badge>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 text-xs">
              <Input
                label="Patron Full Name"
                placeholder="e.g. Maharaja Vikramaditya"
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                required
                inputSize="sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Contact Phone Number"
                  placeholder="+91 98765 43210"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  required
                  inputSize="sm"
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="patron@domain.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  inputSize="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">VIP Tier</label>
                  <select
                    value={newCustomerForm.vipTier}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, vipTier: e.target.value as any })}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Regular" className="bg-slate-900">Regular Tier</option>
                    <option value="VIP" className="bg-slate-900">VIP Bespoke</option>
                    <option value="Couture" className="bg-slate-900">Haute Couture</option>
                    <option value="Wedding" className="bg-slate-900">Wedding Bridal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Body Morphology</label>
                  <select
                    value={newCustomerForm.gender}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gender: e.target.value as any })}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Men" className="bg-slate-900">Men</option>
                    <option value="Women" className="bg-slate-900">Women</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Fit</label>
                  <select
                    value={newCustomerForm.preferredFit}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, preferredFit: e.target.value as any })
                    }
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Slim Bespoke" className="bg-slate-900">Slim Bespoke</option>
                    <option value="Slim" className="bg-slate-900">Slim</option>
                    <option value="Regular" className="bg-slate-900">Regular</option>
                    <option value="Relaxed" className="bg-slate-900">Relaxed</option>
                  </select>
                </div>

                <Input
                  label="Atelier Branch / City"
                  placeholder="e.g. South Extension, New Delhi"
                  value={newCustomerForm.city}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                  inputSize="sm"
                />
              </div>

              <Input
                label="Bespoke Tailoring & Posture Notes"
                placeholder="High armholes, sloped shoulders, contour dart preferences..."
                value={newCustomerForm.notes}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                inputSize="sm"
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Enroll Patron
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* PRINT-ONLY COMPONENT ISOLATION */}
      <div className="print-only hidden print:block">
        <CustomerListPrint customers={filteredCustomers as any} />
      </div>
    </div>
  );
}
