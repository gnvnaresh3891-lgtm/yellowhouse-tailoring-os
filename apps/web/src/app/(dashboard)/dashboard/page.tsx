'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  Factory, 
  TrendingUp, 
  Plus, 
  Ruler, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Sparkles,
  Scissors,
  Activity,
  ChevronRight,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Order, OrderStatus, JobCardItem, syncAllOrdersToJobs, ActivityItem, dispatchSyncEvent } from '@/lib/state-sync-utils';
import { formatRelativeTime, isOrderOverdue, computeDaysOverdue } from '@/lib/date-utils';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';
import { useToast } from '@/components/toast-context';
import { useCurrency } from '@/components/currency-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_INITIAL_ORDERS: Order[] = [
  {
    id: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    clientPhone: '+91 98765 43210',
    garmentSummary: 'Sherwani + Churidar',
    itemCount: 2,
    status: 'IN_PRODUCTION',
    totalAmount: 45000,
    advanceAmount: 22500,
    dueDate: 'Aug 15',
    createdAt: '2026-08-01',
    isUrgent: true,
  },
  {
    id: '#YH-9018',
    clientName: 'Ananya Sharma',
    clientPhone: '+91 98765 43211',
    garmentSummary: 'Lehenga Choli',
    itemCount: 1,
    status: 'TRIAL_FITTING',
    totalAmount: 68000,
    advanceAmount: 34000,
    dueDate: 'Aug 12',
    createdAt: '2026-07-28',
    isUrgent: true,
  },
  {
    id: '#YH-8994',
    clientName: 'Priya Patel',
    clientPhone: '+91 98765 43213',
    garmentSummary: 'Sari Blouse (x3)',
    itemCount: 3,
    status: 'QC_CHECK',
    totalAmount: 12000,
    advanceAmount: 12000,
    dueDate: 'Aug 10',
    createdAt: '2026-07-25',
  },
  {
    id: '#YH-9025',
    clientName: 'Vikram Singh',
    clientPhone: '+91 98765 43212',
    garmentSummary: '3-Piece Suit',
    itemCount: 1,
    status: 'CUTTING',
    totalAmount: 35000,
    advanceAmount: 15000,
    dueDate: 'Aug 20',
    createdAt: '2026-08-03',
  },
  {
    id: '#YH-9030',
    clientName: 'Deepika Nair',
    clientPhone: '+91 98765 43215',
    garmentSummary: 'Anarkali Gown',
    itemCount: 1,
    status: 'DELIVERED',
    totalAmount: 28000,
    advanceAmount: 28000,
    dueDate: 'Aug 5',
    createdAt: '2026-07-20',
  },
];

const DEFAULT_INITIAL_JOBS: JobCardItem[] = [
  { id: 'JC-9035', orderId: 'JC-9035', client: 'Sunita Verma', garment: 'Lehenga Choli', karigar: 'Karigar Salim', stage: 'Fabric Inspection', priority: 'Urgent', dueDate: 'Aug 14', samMinutesLogged: 35, samTotalEstimate: 240, progress: 15 },
  { id: 'JC-9038', orderId: 'JC-9038', client: 'Kabir Roy', garment: 'Sherwani', karigar: 'Karigar Latif', stage: 'Fabric Inspection', priority: 'Normal', dueDate: 'Aug 18', samMinutesLogged: 20, samTotalEstimate: 180, progress: 10 },
  { id: 'JC-9021', orderId: 'JC-9021', client: 'Rajeshwar Malhotra', garment: 'Sherwani', karigar: 'Karigar Latif', stage: 'Master Cutting', priority: 'Urgent', dueDate: 'Aug 12', samMinutesLogged: 65, samTotalEstimate: 180, progress: 35 },
  { id: 'JC-9025', orderId: 'JC-9025', client: 'Vikram Singh', garment: 'Bandhgala', karigar: 'Karigar Ahmed', stage: 'Master Cutting', priority: 'Normal', dueDate: 'Aug 15', samMinutesLogged: 45, samTotalEstimate: 150, progress: 30 },
  { id: 'JC-9028', orderId: 'JC-9028', client: 'Rohan Kapoor', garment: 'Suit', karigar: 'Karigar Ahmed', stage: 'Master Cutting', priority: 'Normal', dueDate: 'Aug 16', samMinutesLogged: 50, samTotalEstimate: 140, progress: 40 },
  { id: 'JC-9018', orderId: 'JC-9018', client: 'Ananya Sharma', garment: 'Lehenga Choli', karigar: 'Karigar Salim', stage: 'Zardozi/Aari Embroidery', priority: 'Urgent', dueDate: 'Aug 13', samMinutesLogged: 240, samTotalEstimate: 360, progress: 65 },
  { id: 'JC-9022', orderId: 'JC-9022', client: 'Sanya Mirza', garment: 'Sari Blouse', karigar: 'Karigar Usman', stage: 'Zardozi/Aari Embroidery', priority: 'Normal', dueDate: 'Aug 17', samMinutesLogged: 180, samTotalEstimate: 220, progress: 55 },
  { id: 'JC-8994', orderId: 'JC-8994', client: 'Priya Patel', garment: 'Sari Blouse', karigar: 'Karigar Usman', stage: 'Stitching Assembly', priority: 'Normal', dueDate: 'Aug 10', samMinutesLogged: 85, samTotalEstimate: 120, progress: 75 },
  { id: 'JC-9030', orderId: 'JC-9030', client: 'Deepika Nair', garment: 'Anarkali', karigar: 'Karigar Rafi', stage: 'Stitching Assembly', priority: 'Normal', dueDate: 'Aug 11', samMinutesLogged: 110, samTotalEstimate: 160, progress: 70 },
  { id: 'JC-8988', orderId: 'JC-8988', client: 'Aarav Mehta', garment: 'Tuxedo', karigar: 'Karigar Latif', stage: 'QC & Ready for Delivery', priority: 'Normal', dueDate: 'Aug 8', samMinutesLogged: 160, samTotalEstimate: 160, progress: 100 },
];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_INITIAL_ORDERS);
  const [jobs, setJobs] = useState<JobCardItem[]>(DEFAULT_INITIAL_JOBS);
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const toast = useToast();
  const { formatCurrency } = useCurrency();

  const loadData = () => {
    let storedOrders = getLocalStorage<Order[]>('yh_orders', []);
    if (storedOrders.length === 0) {
      storedOrders = DEFAULT_INITIAL_ORDERS;
      setLocalStorage('yh_orders', storedOrders);
    }
    setOrders(storedOrders);

    let storedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
    if (storedJobs.length === 0) {
      storedJobs = DEFAULT_INITIAL_JOBS;
      setLocalStorage('yh_production_jobs', storedJobs);
    }
    setJobs(storedJobs);

    const storedCustomers = getLocalStorage<any[]>('yh_customers', []);
    setCustomersCount(storedCustomers.length);

    const storedActivities = getLocalStorage<ActivityItem[]>('yh_activities', []);
    setActivities(storedActivities);
  };

  useEffect(() => {
    // Initial sync of orders to jobs
    syncAllOrdersToJobs();
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('yh-data-sync', handleSync);
    return () => window.removeEventListener('yh-data-sync', handleSync);
  }, []);

  // Compute Metrics strictly following invariant specifications
  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DRAFT').length;
  }, [orders]);

  const urgentJobsCount = useMemo(() => {
    return jobs.filter(j => j.priority === 'Urgent' && j.stage !== 'QC & Ready for Delivery').length;
  }, [jobs]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'DRAFT')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalCollected = useMemo(() => {
    return orders
      .filter(o => o.status !== 'DRAFT')
      .reduce((sum, o) => sum + (o.advanceAmount || 0), 0);
  }, [orders]);
  
  const isCollectedGood = totalRevenue > 0 && (totalCollected / totalRevenue) > 0.5;

  const deliveryRate = useMemo(() => {
    const total = orders.filter(o => o.status !== 'DRAFT').length;
    if (total === 0) return 0;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    return Math.round((delivered / total) * 100);
  }, [orders]);

  const overdueOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter(o => {
        if (o.status === 'DELIVERED' || o.status === 'DRAFT') return false;
        return isOrderOverdue(o.dueDate, today, o.createdAt);
      })
      .map(o => {
        const daysOverdue = computeDaysOverdue(o.dueDate, today, o.createdAt);
        return { ...o, daysOverdue: daysOverdue || 1 };
      });
  }, [orders]);

  // Karigar SAM Yield Telemetry
  const samTelemetry = useMemo(() => {
    const totalEstimateMins = jobs.reduce((sum, j) => sum + (j.samTotalEstimate || 0), 0);
    const totalLoggedMins = jobs.reduce((sum, j) => sum + (j.samMinutesLogged || 0), 0);
    const efficiencyRate = totalEstimateMins > 0 ? Math.round((totalLoggedMins / totalEstimateMins) * 100) : 0;
    return {
      totalEstimateMins,
      totalLoggedMins,
      efficiencyRate
    };
  }, [jobs]);

  // Status badge utility using Apple-grade Badge primitive
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info" size="sm">CONFIRMED</Badge>;
      case 'CUTTING':
        return <Badge variant="warning" size="sm">CUTTING</Badge>;
      case 'IN_PRODUCTION':
        return <Badge variant="gold" size="sm">PRODUCTION</Badge>;
      case 'TRIAL_FITTING':
        return <span className="inline-flex items-center font-medium rounded-full tracking-tight select-none backdrop-blur-md font-sans transition-colors text-[10px] px-2.5 py-0.5 gap-1 bg-purple-500/15 text-purple-300 border border-purple-500/30">TRIAL</span>;
      case 'QC_CHECK':
        return <span className="inline-flex items-center font-medium rounded-full tracking-tight select-none backdrop-blur-md font-sans transition-colors text-[10px] px-2.5 py-0.5 gap-1 bg-orange-500/15 text-orange-300 border border-orange-500/30">QC</span>;
      case 'READY_FOR_DELIVERY':
        return <Badge variant="success" size="sm">READY</Badge>;
      case 'DELIVERED':
        return <Badge variant="success" size="sm">DELIVERED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const WORKSHOP_STAGES = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery'
  ];

  const stageColors: Record<string, string> = {
    'Fabric Inspection': 'bg-slate-400',
    'Master Cutting': 'bg-amber-400',
    'Zardozi/Aari Embroidery': 'bg-purple-400',
    'Stitching Assembly': 'bg-blue-400',
    'QC & Ready for Delivery': 'bg-emerald-400'
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_created': return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'job_moved': return <ArrowRight className="w-4 h-4 text-amber-400" />;
      case 'customer_added': return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'payment_received': return <DollarSign className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-[1540px] mx-auto w-full space-y-8 animate-fade-in pb-16 font-sans">
      {/* Apple-Grade Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-950/95 border border-[#D4AF37]/35 shadow-[0_12px_40px_0_rgba(212,175,55,0.12),inset_0_1px_1px_0_rgba(228,191,100,0.25)] backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#E4BF64] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Master Atelier Command Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Executive Control Center
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Real-time atelier telemetry, bespoke client fitting intelligence, SAM production ledger, and automated order workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Tooltip content="Launch new bespoke order draft & pricing engine">
              <Link href="/orders">
                <Button variant="gold" size="md" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                  Create Bespoke Order
                </Button>
              </Link>
            </Tooltip>
            
            <Tooltip content="Open 2D CAD silhouette & posture measurement engine">
              <Link href="/measurements">
                <Button variant="secondary" size="md" leftIcon={<Ruler className="w-4 h-4 text-[#D4AF37]" />}>
                  Fit Profiles & CAD
                </Button>
              </Link>
            </Tooltip>

            <Tooltip content="Review Karigar artisan workshop Kanban board">
              <Link href="/production">
                <Button variant="secondary" size="md" leftIcon={<Factory className="w-4 h-4 text-emerald-400" />}>
                  Workshop Floor
                </Button>
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Apple Frosted Glass with Layered Luminance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Active Orders */}
        <Tooltip content="Orders currently in confirmed, cutting, production, or trial stage">
          <Card variant="glass" padding="md" hoverable className="border-white/10 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Orders</span>
                <div className="text-3xl font-bold text-white font-display tracking-tight">{activeOrdersCount}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>In active processing</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>

        {/* 2. Total Clients */}
        <Tooltip content="Total registered client profiles with active fit histories">
          <Card variant="glass" padding="md" hoverable className="border-white/10 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clients</span>
                <div className="text-3xl font-bold text-white font-display tracking-tight">{customersCount}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered accounts</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>

        {/* 3. Urgent Kanban Tasks */}
        <Tooltip content="High priority jobs requiring immediate artisan action on Kanban">
          <Card variant="glass" padding="md" hoverable className="border-white/10 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urgent Jobs</span>
                <div className="text-3xl font-bold text-white font-display tracking-tight">{urgentJobsCount}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Require immediate action</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform duration-300">
                <Factory className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>

        {/* 4. Total Booking Value */}
        <Tooltip content="Gross total value across all confirmed bespoke order bookings">
          <Card variant="glass" padding="md" hoverable className="border-white/10 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Booking Value</span>
                <div className="text-2xl font-bold text-white truncate max-w-[170px] font-mono tabular-nums">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmed booking sums</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>
        
        {/* 5. Collected Advance */}
        <Tooltip content="Total advance amount collected across all orders">
          <Card 
            variant="glass" 
            padding="md" 
            hoverable 
            className={`border-white/10 group ${isCollectedGood ? 'border-emerald-500/30 bg-emerald-950/15' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected</span>
                <div className={`text-2xl font-bold truncate max-w-[170px] font-mono tabular-nums ${isCollectedGood ? 'text-emerald-400' : 'text-white'}`}>
                  {formatCurrency(totalCollected)}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <DollarSign className={`w-3.5 h-3.5 ${isCollectedGood ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{isCollectedGood ? 'Cashflow positive (>50%)' : 'Advance payments collected'}</span>
                </div>
              </div>
              <div className={`p-3.5 rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${
                isCollectedGood 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800/80 text-slate-300 border-white/10'
              }`}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>

        {/* 6. Delivery Completion Rate */}
        <Tooltip content="Percentage of total orders that have been successfully delivered">
          <Card variant="glass" padding="md" hoverable className="border-white/10 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Rate</span>
                <div className="text-3xl font-bold text-white font-display tracking-tight">{deliveryRate}%</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Delivered vs Total Orders</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Tooltip>
      </div>

      {/* Overdue Orders Alert Banner */}
      {overdueOrders.length > 0 && (
        <Card variant="glass" padding="md" className="border-rose-500/30 bg-rose-950/15 animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold font-display">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-base tracking-tight">Overdue Orders ({overdueOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueOrders.map(order => (
              <div key={order.id} className="bg-slate-900/70 rounded-2xl p-4 border border-rose-500/20 backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <Link href="/orders" className="font-mono font-bold text-rose-300 hover:text-rose-200 transition-colors">
                    {order.id}
                  </Link>
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/30">
                    {order.daysOverdue} {order.daysOverdue === 1 ? 'day' : 'days'} overdue
                  </span>
                </div>
                <div className="text-white font-semibold text-sm">{order.clientName}</div>
                <div className="text-slate-400 text-xs mt-1">{order.garmentSummary}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Grid: Recent Orders & Pipeline Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders & Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Card */}
          <Card variant="glass" padding="none" className="border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white font-display tracking-tight">Recent Orders</h2>
              </div>
              <Link href="/orders">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All Orders
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold bg-slate-950/30">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Garment</th>
                    <th className="py-3.5 px-4 text-right">Value</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-300 group-hover:text-[#D4AF37] transition-colors">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{order.clientName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{order.garmentSummary}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-200 tabular-nums">
                        {formatCurrency(order?.totalAmount || 0)}
                      </td>
                      <td className="py-3.5 px-6 text-center">{renderStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-medium">
                        No orders found. Set up your first order to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Today's Activity Feed */}
          <Card variant="glass" padding="md" className="border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white font-display tracking-tight">Today's Activity Feed</h2>
              </div>
              <Badge variant="neutral" size="sm">Live Stream</Badge>
            </div>
            
            {activities.length > 0 ? (
              <div className="space-y-3 pt-2">
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-slate-800/80 border border-white/5 shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium">{activity.message}</p>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono">
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                        {activity.entityId && (
                          <>
                            <span>&bull;</span>
                            <span className="text-[#D4AF37]">{activity.entityId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                No recent activity. Actions you take will appear here.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Karigar SAM Yield & Workshop Pipeline */}
        <div className="space-y-6">
          {/* Workshop Pipeline & Karigar SAM Yield Telemetry */}
          <Card variant="glass" padding="md" className="border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display tracking-tight">Workshop Pipeline</h2>
                  <p className="text-[11px] text-slate-400">Karigar production stage distribution</p>
                </div>
              </div>
            </div>

            {/* SAM Yield Summary Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SAM Efficiency Yield</span>
                <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                  {samTelemetry.efficiencyRate}% Yield
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged / Target SAM</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {samTelemetry.totalLoggedMins}m / {samTelemetry.totalEstimateMins}m
                </span>
              </div>
            </div>

            {/* 5-Stage Yield Bars */}
            <div className="space-y-4">
              {WORKSHOP_STAGES.map((stage) => {
                const count = jobs.filter(j => j.stage === stage).length;
                const total = jobs.length || 1;
                const percentage = Math.round((count / total) * 100);
                const dotColor = stageColors[stage] || 'bg-slate-500';
                
                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span className="text-slate-300 font-medium">{stage}</span>
                      </div>
                      <span className="font-mono text-slate-400 tabular-nums">{count} jobs ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full ${dotColor} rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Shortcuts Panel */}
          <Card variant="glass" padding="md" className="border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white font-display tracking-tight">Atelier Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Tooltip content="Configure swatches, labor & surcharges for new order">
                <Link 
                  href="/orders" 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-[#D4AF37]/40 hover:bg-slate-900/90 transition-all duration-200 group w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">Create Order</div>
                      <div className="text-[11px] text-slate-400">Configure swatches & BOM presets</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>

              <Tooltip content="Adjust 2D anatomical hotspots & posture modifiers">
                <Link 
                  href="/measurements" 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-200 group w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">2D CAD Studio</div>
                      <div className="text-[11px] text-slate-400">Mannequin calipers & drapes</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>

              <Tooltip content="Register new client contact & fit history file">
                <Link 
                  href="/customers" 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-200 group w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Add Client CRM</div>
                      <div className="text-[11px] text-slate-400">Log patron contacts & profiles</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>

              <Tooltip content="Manage Karigar artisan workforce and SAM timesheets">
                <Link 
                  href="/staff" 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all duration-200 group w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Staff Roster</div>
                      <div className="text-[11px] text-slate-400">Master cutters & karigars</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
