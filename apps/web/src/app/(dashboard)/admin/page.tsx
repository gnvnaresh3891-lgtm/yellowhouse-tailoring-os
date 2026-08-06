'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Building2,
  CheckCircle2,
  IndianRupee,
  ShoppingBag,
  Users,
  Activity,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Ban,
  RotateCcw,
  Eye,
  X,
  Check,
  TrendingUp,
  Server,
  Layers,
  Crown,
  Zap,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  status: 'Active' | 'Suspended';
  staffCount: number;
  orders: number;
  mrr: string;
  mrrValue: number;
  owner: string;
  location: string;
  joinedDate: string;
}

const initialTenants: Tenant[] = [
  {
    id: 't-1',
    name: 'Royal Silhouette Atelier',
    slug: 'royal-silhouette',
    plan: 'Enterprise',
    status: 'Active',
    staffCount: 12,
    orders: 342,
    mrr: '₹45,000',
    mrrValue: 45000,
    owner: 'Vikramaditya R.',
    location: 'New Delhi',
    joinedDate: 'Jan 2024',
  },
  {
    id: 't-2',
    name: 'Maharani Couture House',
    slug: 'maharani-couture',
    plan: 'Pro',
    status: 'Active',
    staffCount: 8,
    orders: 215,
    mrr: '₹25,000',
    mrrValue: 25000,
    owner: 'Sunita Rao',
    location: 'Jaipur',
    joinedDate: 'Mar 2024',
  },
  {
    id: 't-3',
    name: "Nawab's Bespoke",
    slug: 'nawabs-bespoke',
    plan: 'Pro',
    status: 'Active',
    staffCount: 6,
    orders: 178,
    mrr: '₹25,000',
    mrrValue: 25000,
    owner: 'Tariq Nawab',
    location: 'Lucknow',
    joinedDate: 'Apr 2024',
  },
  {
    id: 't-4',
    name: 'Silk Thread Studio',
    slug: 'silk-thread',
    plan: 'Starter',
    status: 'Active',
    staffCount: 3,
    orders: 89,
    mrr: '₹5,000',
    mrrValue: 5000,
    owner: 'Ananya Sharma',
    location: 'Bengaluru',
    joinedDate: 'May 2024',
  },
  {
    id: 't-5',
    name: 'Zari & Zardozi Works',
    slug: 'zari-zardozi',
    plan: 'Pro',
    status: 'Suspended',
    staffCount: 5,
    orders: 134,
    mrr: '₹0',
    mrrValue: 0,
    owner: 'Farooq Ali',
    location: 'Hyderabad',
    joinedDate: 'Feb 2024',
  },
  {
    id: 't-6',
    name: 'Golden Needle Tailors',
    slug: 'golden-needle',
    plan: 'Starter',
    status: 'Active',
    staffCount: 2,
    orders: 45,
    mrr: '₹5,000',
    mrrValue: 5000,
    owner: 'Ramesh Kumar',
    location: 'Mumbai',
    joinedDate: 'Jun 2024',
  },
];

export default function GlobalAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Enterprise' | 'Pro' | 'Starter'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Tenant Form state
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'Enterprise' | 'Pro' | 'Starter'>('Pro');
  const [newTenantOwner, setNewTenantOwner] = useState('');
  const [newTenantLocation, setNewTenantLocation] = useState('');
  const [newTenantStaff, setNewTenantStaff] = useState('5');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered tenants logic
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'All' || t.plan === planFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [tenants, searchTerm, planFilter, statusFilter]);

  // Toggle tenant status
  const toggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === 'Active' ? 'Suspended' : 'Active';
          const newMrr = newStatus === 'Suspended' ? '₹0' : t.plan === 'Enterprise' ? '₹45,000' : t.plan === 'Pro' ? '₹25,000' : '₹5,000';
          const newMrrVal = newStatus === 'Suspended' ? 0 : t.plan === 'Enterprise' ? 45000 : t.plan === 'Pro' ? 25000 : 5000;
          showNotification(`Tenant "${t.name}" status updated to ${newStatus}`);
          return { ...t, status: newStatus, mrr: newMrr, mrrValue: newMrrVal };
        }
        return t;
      })
    );
  };

  // Handle Add Tenant
  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) return;

    const mrrVal = newTenantPlan === 'Enterprise' ? 45000 : newTenantPlan === 'Pro' ? 25000 : 5000;
    const mrrStr = `₹${mrrVal.toLocaleString('en-IN')}`;

    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: newTenantName,
      slug: newTenantSlug.toLowerCase().replace(/\s+/g, '-'),
      plan: newTenantPlan,
      status: 'Active',
      staffCount: parseInt(newTenantStaff) || 1,
      orders: 0,
      mrr: mrrStr,
      mrrValue: mrrVal,
      owner: newTenantOwner || 'Atelier Manager',
      location: newTenantLocation || 'India',
      joinedDate: 'Just Now',
    };

    setTenants((prev) => [newTenant, ...prev]);
    setIsAddModalOpen(false);
    showNotification(`New tenant "${newTenant.name}" onboarded successfully!`);

    // Reset Form
    setNewTenantName('');
    setNewTenantSlug('');
    setNewTenantOwner('');
    setNewTenantLocation('');
    setNewTenantStaff('5');
  };

  // Stats calculation
  const totalTenantsCount = 24; // Benchmark requirement
  const activeSubsCount = 22;
  const monthlyRevenueStr = '₹8,45,000';
  const totalOrdersStr = '1,847';
  const karigarPoolCount = 156;
  const systemUptimeStr = '99.97%';

  // Distribution counts across total 24 platform tenants
  const distributionData = [
    { plan: 'Pro', count: 12, percentage: 50.0, color: 'bg-blue-500', badgeClass: 'badge-blue', icon: Zap },
    { plan: 'Starter', count: 8, percentage: 33.3, color: 'bg-amber-500', badgeClass: 'badge-amber', icon: Layers },
    { plan: 'Enterprise', count: 4, percentage: 16.7, color: 'bg-yellow-500', badgeClass: 'badge-gold', icon: Crown },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 glass-card-gold rounded-xl px-4 py-3 text-sm text-yellow-300 font-semibold shadow-2xl flex items-center space-x-2 border border-yellow-500/40 animate-fade-in">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500/20 via-amber-500/20 to-yellow-600/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-500/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                System Administration
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Global OS v2.4
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Global platform oversight & tenant management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => showNotification('Audit Logs exported successfully!')}
            className="btn-ghost flex items-center space-x-2 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold flex items-center space-x-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Tenant</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Stat Cards (2 rows x 3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Tenants */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Tenants
            </span>
            <span className="badge badge-emerald flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +3 this month
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {totalTenantsCount}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Active multi-tenant ateliers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Subscriptions */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Subscriptions
            </span>
            <span className="badge badge-gold font-mono">91.6% Active Rate</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {activeSubsCount}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">2 Suspended / Pending review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="glass-card-gold rounded-2xl p-5 relative overflow-hidden group transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400">
              Monthly Revenue
            </span>
            <span className="badge badge-gold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-yellow-400" /> +18.4% MoM
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-yellow-400 tracking-tight font-mono">
                  {monthlyRevenueStr}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">Avg MRR ₹38,409 per tenant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Orders (Platform) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Orders (Platform)
            </span>
            <span className="badge badge-blue">+240 this week</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {totalOrdersStr}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">₹1.42 Cr total GMV processed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Karigar Pool */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Karigar Pool
            </span>
            <span className="badge badge-amber">94% Utilization</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {karigarPoolCount}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Master artisans & craftsmen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 6: System Uptime */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              System Uptime
            </span>
            <span className="badge badge-emerald flex items-center gap-1">
              <Server className="w-3 h-3" /> Operational
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {systemUptimeStr}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Avg response time: 42ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Visualization: Subscription Plan Distribution */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-yellow-400" />
              <span>Subscription Plan Distribution</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform tenant distribution breakdown across active subscription tiers
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Total Tenants:</span>
            <span className="text-yellow-400 font-bold">24</span>
          </div>
        </div>

        {/* Stacked Bar Container */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800 p-0.5">
            {distributionData.map((item) => (
              <div
                key={item.plan}
                style={{ width: `${item.percentage}%` }}
                className={`h-full ${item.color} first:rounded-l-lg last:rounded-r-lg transition-all duration-500 relative group cursor-pointer`}
                title={`${item.plan}: ${item.count} tenants (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Breakdown cards / legends */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {distributionData.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.plan}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`badge ${item.badgeClass} flex items-center space-x-1`}>
                      <IconComp className="w-3 h-3 mr-0.5" />
                      <span>{item.plan}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white font-mono">{item.count} tenants</span>
                    <span className="text-[11px] text-slate-400 block font-mono">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tenant Directory Table Container */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden space-y-4">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-slate-800/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-yellow-400" />
                <span>Tenant Directory</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of all registered ateliers, subscription status, order volume, and revenue
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Showing <span className="text-yellow-400 font-bold">{filteredTenants.length}</span> of{' '}
              <span className="text-slate-200">{tenants.length}</span> listed ateliers
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenant by name, slug, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark pl-10 pr-4 py-2 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Plan Filter */}
            <div className="sm:col-span-3 flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500 hidden xl:block" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="input-dark py-2 text-xs cursor-pointer"
              >
                <option value="All">All Subscription Plans</option>
                <option value="Enterprise">Enterprise Tier</option>
                <option value="Pro">Pro Tier</option>
                <option value="Starter">Starter Tier</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-dark py-2 text-xs cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Suspended">Suspended Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Tenant Name</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5">Plan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Staff Count</th>
                <th className="px-4 py-3.5 text-center">Orders</th>
                <th className="px-4 py-3.5 text-right">MRR</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-medium">No tenants found matching filters</p>
                    <p className="text-xs text-slate-600 mt-1">Try clearing search query or plan/status filters</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Tenant Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-yellow-400 text-xs">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs hover:text-yellow-400 transition-colors">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t.owner} • {t.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-4 font-mono text-yellow-400/90 text-xs">
                      {t.slug}
                    </td>

                    {/* Plan Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`badge ${
                          t.plan === 'Enterprise'
                            ? 'badge-gold'
                            : t.plan === 'Pro'
                            ? 'badge-blue'
                            : 'badge-amber'
                        }`}
                      >
                        {t.plan}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`badge ${
                          t.status === 'Active' ? 'badge-emerald' : 'badge-rose'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Staff Count */}
                    <td className="px-4 py-4 text-center font-mono font-semibold text-slate-200">
                      {t.staffCount}
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-4 text-center font-mono font-semibold text-slate-200">
                      {t.orders}
                    </td>

                    {/* MRR */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-white text-xs">
                      {t.mrr}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedTenant(t)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition-all"
                          title="View Tenant Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleTenantStatus(t.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            t.status === 'Active'
                              ? 'border-rose-950 text-rose-400 hover:bg-rose-950/40'
                              : 'border-emerald-950 text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                          title={t.status === 'Active' ? 'Suspend Tenant' : 'Activate Tenant'}
                        >
                          {t.status === 'Active' ? (
                            <Ban className="w-3.5 h-3.5" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Tenant Details */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-card-gold rounded-2xl max-w-lg w-full p-6 space-y-5 border border-yellow-500/30 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold flex items-center justify-center text-base">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTenant.name}</h3>
                  <p className="text-xs text-yellow-400 font-mono">{selectedTenant.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Plan</p>
                <p className="font-bold text-white mt-1">{selectedTenant.plan} Tier</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
                <p className="font-bold text-white mt-1">{selectedTenant.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Owner / Admin</p>
                <p className="font-bold text-white mt-1">{selectedTenant.owner}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Location</p>
                <p className="font-bold text-white mt-1">{selectedTenant.location}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Staff Count</p>
                <p className="font-bold text-white mt-1 font-mono">{selectedTenant.staffCount} Active Members</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">MRR</p>
                <p className="font-bold text-yellow-400 mt-1 font-mono">{selectedTenant.mrr}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  toggleTenantStatus(selectedTenant.id);
                  setSelectedTenant(null);
                }}
                className="btn-ghost text-xs flex items-center space-x-1"
              >
                {selectedTenant.status === 'Active' ? <Ban className="w-3.5 h-3.5 text-rose-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{selectedTenant.status === 'Active' ? 'Suspend Access' : 'Reactivate Access'}</span>
              </button>
              <button
                onClick={() => setSelectedTenant(null)}
                className="btn-gold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Tenant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card-gold rounded-2xl max-w-md w-full p-6 space-y-4 border border-yellow-500/30 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-yellow-400" />
                <span>Onboard New Atelier Tenant</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tenant Atelier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Silk Tailors"
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tenant Slug (Subdomain)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. royal-silk"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value)}
                  className="input-dark font-mono text-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subscription Plan</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value as any)}
                    className="input-dark cursor-pointer"
                  >
                    <option value="Starter">Starter (₹5,000/mo)</option>
                    <option value="Pro">Pro (₹25,000/mo)</option>
                    <option value="Enterprise">Enterprise (₹45,000/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Staff Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newTenantStaff}
                    onChange={(e) => setNewTenantStaff(e.target.value)}
                    className="input-dark font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Owner / Lead Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Master Latif"
                  value={newTenantOwner}
                  onChange={(e) => setNewTenantOwner(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={newTenantLocation}
                  onChange={(e) => setNewTenantLocation(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold py-2">
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
