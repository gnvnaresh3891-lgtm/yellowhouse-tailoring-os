'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
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
  Lock,
  Key,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Tenant,
  TenantPlan,
  TenantStatus,
  AuditLog,
  INITIAL_TENANTS,
  verifyMasterPasskey,
  isSuperAdminUser,
  filterTenants,
  computeTenantStats,
  toggleTenantStatus as executeToggleTenantStatus,
  createNewTenant,
  aggregateAuditLogs,
  generateAuditCsv,
} from '@/lib/admin-utils';

export default function GlobalAdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(() =>
    getLocalStorage<Tenant[]>('yh_admin_tenants', INITIAL_TENANTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  // RBAC Route Guard: Auto-authorize if user already holds SUPER_ADMIN or SYSTEM_ADMIN
  useEffect(() => {
    const user = getLocalStorage<{ name: string; role: string } | null>('yh_auth_user', null);
    if (isSuperAdminUser(user)) {
      setIsAuthorized(true);
    }
  }, []);

  const handleAdminPasskeyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError('');

    if (!adminPasskey.trim()) {
      setPasskeyError('Please enter the administrative master passkey.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const result = verifyMasterPasskey(adminPasskey);
      if (result.success && result.user) {
        setLocalStorage('yh_auth_user', result.user);
        setIsAuthorized(true);
        showNotification('Administrative access granted. Welcome to Global Security Console.');
      } else {
        setPasskeyError(
          result.error || 'Invalid administrative passkey. Access restricted to authorized platform personnel.'
        );
      }
      setIsAuthenticating(false);
    }, 400);
  };

  // Persist Tenants
  useEffect(() => {
    setLocalStorage('yh_admin_tenants', tenants);
  }, [tenants]);

  // Aggregate Audit Logs from soft-delete keys
  useEffect(() => {
    if (showAuditPanel) {
      const deletedOrders = getLocalStorage<any[]>('yh_deleted_orders_log', []) || [];
      const deletedCustomers = getLocalStorage<any[]>('yh_deleted_customers_log', []) || [];
      const deletedJobs = getLocalStorage<any[]>('yh_deleted_jobs_log', []) || [];

      const normalized = aggregateAuditLogs(deletedOrders, deletedCustomers, deletedJobs);
      setAuditLogs(normalized);
    }
  }, [showAuditPanel]);

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Enterprise' | 'Pro' | 'Starter'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Tenant Form state
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<TenantPlan>('Pro');
  const [newTenantOwner, setNewTenantOwner] = useState('');
  const [newTenantLocation, setNewTenantLocation] = useState('');
  const [newTenantStaff, setNewTenantStaff] = useState('5');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered tenants logic
  const filteredTenants = useMemo(() => {
    return filterTenants(tenants, searchTerm, planFilter, statusFilter);
  }, [tenants, searchTerm, planFilter, statusFilter]);

  // Toggle tenant status
  const handleToggleStatus = (id: string) => {
    const { updatedTenants, affectedTenant, newStatus } = executeToggleTenantStatus(tenants, id);
    setTenants(updatedTenants);
    if (affectedTenant) {
      showNotification(`Tenant "${affectedTenant.name}" status updated to ${newStatus}`);
    }
  };

  // Handle Add Tenant
  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) return;

    const newTenant = createNewTenant({
      name: newTenantName,
      slug: newTenantSlug,
      plan: newTenantPlan,
      owner: newTenantOwner,
      location: newTenantLocation,
      staffCount: parseInt(newTenantStaff, 10) || 1,
    });

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
  const {
    totalTenantsCount,
    activeSubsCount,
    monthlyRevenueStr,
    totalOrdersStr,
    karigarPoolCount,
    systemUptimeStr,
    distributionData,
  } = useMemo(() => {
    return computeTenantStats(tenants);
  }, [tenants]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] px-4 animate-fade-in">
        <div className="max-w-md w-full backdrop-blur-2xl bg-slate-900/80 rounded-3xl p-8 border border-amber-500/30 shadow-ios-xl relative overflow-hidden space-y-6">
          {/* Top Subtle Amber Ambient Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          {/* Glowing Pill Icon */}
          <div className="flex items-center justify-center pt-2">
            <div className="w-16 h-16 rounded-2.5xl bg-amber-500/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-ios-gold animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">
              Master Admin Console
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              This environment is strictly reserved for YellowHouse Platform Administrators and is password-protected.
            </p>
          </div>

          <form onSubmit={handleAdminPasskeyAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Administrative Passkey</span>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">
                  Restricted Access
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  placeholder="Enter master passkey (e.g. yh-admin-2026)..."
                  className="w-full px-4 py-3 rounded-xl bg-[#070A12]/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  autoFocus
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {passkeyError && (
                <div className="flex items-center space-x-1.5 text-rose-400 text-xs mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passkeyError}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={isAuthenticating}
                className="w-full text-slate-950 font-extrabold text-xs shadow-ios-gold cursor-pointer"
              >
                {!isAuthenticating && (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Unlock Admin Console</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => router.push('/dashboard')}
                className="w-full text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Return to Atelier Dashboard
              </Button>
            </div>
          </form>

          <div className="pt-3 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              YellowHouse SaaS Platform Security Engine • Active Defense
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 backdrop-blur-2xl bg-slate-900/90 rounded-2xl px-5 py-3 text-sm text-yellow-300 font-semibold shadow-ios-xl flex items-center space-x-2 border border-[#D4AF37]/40 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-ios-gold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display flex items-center gap-2.5">
                System Administration
                <Badge variant="gold" size="sm" className="font-mono">
                  Global OS v2.4
                </Badge>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 font-sans">
                Global platform security console & multi-tenant atelier management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAuditPanel(true)}
            className="cursor-pointer gap-2"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </Button>
          <Tooltip content="Provision new tenant boutique instance on platform">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer gap-2 text-slate-950 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tenant</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 6 KPI Stat Cards (2 rows x 3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Tenants */}
        <Card variant="glass" padding="md" className="group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Tenants
            </span>
            <Badge variant="success" size="sm" className="gap-1">
              <ArrowUpRight className="w-3 h-3" /> +3 this month
            </Badge>
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
        </Card>

        {/* Card 2: Active Subscriptions */}
        <Card variant="glass" padding="md" className="group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Subscriptions
            </span>
            <Badge variant="gold" size="sm" className="font-mono">
              91.6% Active Rate
            </Badge>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D4AF37]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {activeSubsCount}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">1 Suspended / In Review</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Monthly Revenue */}
        <Card variant="gold" padding="md" className="group transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
              Monthly Revenue (MRR)
            </span>
            <Badge variant="gold" size="sm" className="gap-1">
              <TrendingUp className="w-3 h-3 text-[#D4AF37]" /> +18.4% MoM
            </Badge>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-[#D4AF37] tracking-tight font-mono">
                  {monthlyRevenueStr}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">Recurring subscription baseline</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: Total Orders (Platform) */}
        <Card variant="glass" padding="md" className="group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Orders (Platform)
            </span>
            <Badge variant="info" size="sm">
              +240 this week
            </Badge>
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
        </Card>

        {/* Card 5: Karigar Pool */}
        <Card variant="glass" padding="md" className="group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Karigar Pool
            </span>
            <Badge variant="warning" size="sm">
              94% Utilization
            </Badge>
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
        </Card>

        {/* Card 6: System Uptime */}
        <Card variant="glass" padding="md" className="group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              System Uptime
            </span>
            <Badge variant="success" size="sm" className="gap-1">
              <Server className="w-3 h-3" /> Operational
            </Badge>
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
                <p className="text-[11px] text-slate-400 mt-0.5">Avg response latency: 42ms</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mini Visualization: Subscription Plan Distribution */}
      <Card variant="glass" padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-display">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>Subscription Plan Distribution</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Platform tenant distribution breakdown across active subscription tiers
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Total Tenants:</span>
            <span className="text-[#D4AF37] font-bold">{totalTenantsCount}</span>
          </div>
        </div>

        {/* Stacked Bar Container */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-950/80 rounded-xl overflow-hidden flex border border-white/10 p-0.5 shadow-inner">
            {distributionData.map((item) => {
              const widthPct = Math.max(0, item.percentage);
              if (widthPct === 0) return null;
              return (
                <div
                  key={item.plan}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full ${item.color} first:rounded-l-lg last:rounded-r-lg transition-all duration-500 relative group cursor-pointer`}
                  title={`${item.plan}: ${item.count} tenants (${widthPct}%)`}
                />
              );
            })}
          </div>

          {/* Breakdown cards / legends */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {distributionData.map((item) => {
              const IconComp = item.plan === 'Enterprise' ? Crown : item.plan === 'Pro' ? Zap : Layers;
              return (
                <div
                  key={item.plan}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Badge variant={item.plan === 'Enterprise' ? 'gold' : item.plan === 'Pro' ? 'info' : 'warning'} size="sm">
                      <IconComp className="w-3 h-3 mr-1" />
                      <span>{item.plan}</span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white font-mono">{item.count} ateliers</span>
                    <span className="text-[11px] text-slate-400 block font-mono">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tenant Directory Table Container */}
      <Card variant="glass" padding="none" className="overflow-hidden shadow-ios-xl">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-display">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                <span>Tenant Directory</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Overview of all registered ateliers, subscription status, order volume, and revenue
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Showing <span className="text-[#D4AF37] font-bold">{filteredTenants.length}</span> of{' '}
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
                className="w-full pl-10 pr-8 py-2.5 rounded-full bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer font-sans"
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
                className="w-full px-3.5 py-2.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer font-sans"
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
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-white/5">
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
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Tenant Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-850 border border-white/10 flex items-center justify-center font-bold text-[#D4AF37] text-xs shadow-ios-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs hover:text-[#D4AF37] transition-colors">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t.owner} • {t.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-4 font-mono text-[#D4AF37] text-xs">
                      {t.slug}
                    </td>

                    {/* Plan Badge */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          t.plan === 'Enterprise'
                            ? 'gold'
                            : t.plan === 'Pro'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {t.plan}
                      </Badge>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={t.status === 'Active' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {t.status}
                      </Badge>
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
                        <Tooltip content="Inspect tenant metadata and subscription details">
                          <button
                            onClick={() => setSelectedTenant(t)}
                            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip
                          content={
                            t.status === 'Active'
                              ? 'Suspend tenant platform access'
                              : 'Reactivate tenant access'
                          }
                        >
                          <button
                            onClick={() => handleToggleStatus(t.id)}
                            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                              t.status === 'Active'
                                ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/15'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                            }`}
                          >
                            {t.status === 'Active' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Tenant Details */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <Card variant="gold" padding="lg" className="max-w-lg w-full space-y-5 shadow-ios-xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold flex items-center justify-center text-base shadow-ios-gold">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">{selectedTenant.name}</h3>
                  <p className="text-xs text-[#D4AF37] font-mono">{selectedTenant.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Plan</p>
                <p className="font-bold text-white mt-1">{selectedTenant.plan} Tier</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
                <p className="font-bold text-white mt-1">{selectedTenant.status}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Owner / Admin</p>
                <p className="font-bold text-white mt-1">{selectedTenant.owner}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Location</p>
                <p className="font-bold text-white mt-1">{selectedTenant.location}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Staff Count</p>
                <p className="font-bold text-white mt-1 font-mono">{selectedTenant.staffCount} Active Members</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">MRR</p>
                <p className="font-bold text-[#D4AF37] mt-1 font-mono">{selectedTenant.mrr}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleToggleStatus(selectedTenant.id);
                  setSelectedTenant(null);
                }}
                className="cursor-pointer gap-1.5"
              >
                {selectedTenant.status === 'Active' ? (
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{selectedTenant.status === 'Active' ? 'Suspend Access' : 'Reactivate Access'}</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setSelectedTenant(null)}
                className="cursor-pointer text-slate-950 font-bold"
              >
                Close Details
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Audit Logs */}
      {showAuditPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <Card variant="glass" padding="lg" className="max-w-4xl w-full flex flex-col max-h-[85vh] shadow-ios-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 font-display">
                <Server className="w-5 h-5 text-slate-400" />
                <span>System Soft-Delete Audit Logs</span>
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const csvContent = generateAuditCsv(auditLogs);
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'yellowhouse_audit_logs.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('Audit Logs downloaded successfully');
                  }}
                  className="cursor-pointer gap-1.5 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
                <button
                  onClick={() => setShowAuditPanel(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto mt-4 pr-2 custom-scrollbar">
              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                  <Activity className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium">No soft-delete audit records found</p>
                  <p className="text-xs text-slate-600">Soft-deleted orders, customers, and jobs appear here automatically</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-950/60 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-xl">Time</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                        <th className="px-4 py-3 font-medium">Entity</th>
                        <th className="px-4 py-3 font-medium rounded-tr-xl">Details / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="danger" size="sm" className="font-mono text-[10px]">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{log.entity}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 truncate max-w-[150px]">{log.entityName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-slate-400 max-w-sm truncate" title={log.reason}>
                              {log.reason}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Add New Tenant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <Card variant="gold" padding="lg" className="max-w-md w-full space-y-4 shadow-ios-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-display">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Onboard New Atelier Tenant</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tenant Atelier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Silk Tailors"
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tenant Slug (Subdomain) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. royal-silk"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-[#D4AF37] font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Subscription Plan</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs cursor-pointer focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Starter">Starter (₹5,000/mo)</option>
                    <option value="Pro">Pro (₹25,000/mo)</option>
                    <option value="Enterprise">Enterprise (₹45,000/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Staff Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newTenantStaff}
                    onChange={(e) => setNewTenantStaff(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Owner / Lead Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Master Latif"
                  value={newTenantOwner}
                  onChange={(e) => setNewTenantOwner(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={newTenantLocation}
                  onChange={(e) => setNewTenantLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="cursor-pointer text-slate-950 font-bold"
                >
                  Create Tenant
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
