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
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus, JobCardItem, syncAllOrdersToJobs, ActivityItem, dispatchSyncEvent } from '@/lib/state-sync-utils';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';
import { useToast } from '@/components/toast-context';
import { useCurrency } from '@/components/currency-context';

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

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_INITIAL_ORDERS);
  const [jobs, setJobs] = useState<JobCardItem[]>(DEFAULT_INITIAL_JOBS);
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const toast = useToast();

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

  // Compute Metrics
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
    return orders.filter(o => {
      if (o.status === 'DELIVERED' || o.status === 'DRAFT') return false;
      if (!o.dueDate) return false;
      // Handle formats like "Aug 15", "2026-08-15"
      const dateStr = o.dueDate.includes('202') ? o.dueDate : `${o.dueDate}, ${today.getFullYear()}`;
      const dDate = new Date(dateStr);
      if (isNaN(dDate.getTime())) return false;
      return dDate < today;
    }).map(o => {
      const dateStr = o.dueDate.includes('202') ? o.dueDate : `${o.dueDate}, ${today.getFullYear()}`;
      const dDate = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - dDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...o, daysOverdue: isNaN(diffDays) ? 1 : diffDays };
    });
  }, [orders]);

  const { formatCurrency } = useCurrency();

  // Status badge utility
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge bg-slate-800 text-slate-400 border-slate-700">DRAFT</span>;
      case 'CONFIRMED':
        return <span className="badge badge-blue">CONFIRMED</span>;
      case 'CUTTING':
        return <span className="badge badge-amber">CUTTING</span>;
      case 'IN_PRODUCTION':
        return <span className="badge badge-gold">PRODUCTION</span>;
      case 'TRIAL_FITTING':
        return <span className="badge bg-purple-500/10 text-purple-400 border-purple-500/20">TRIAL</span>;
      case 'QC_CHECK':
        return <span className="badge bg-orange-500/10 text-orange-400 border-orange-500/20">QC</span>;
      case 'READY_FOR_DELIVERY':
        return <span className="badge badge-emerald">READY</span>;
      case 'DELIVERED':
        return <span className="badge bg-green-500/10 text-green-400 border-green-500/20">DELIVERED</span>;
      default:
        return <span className="badge bg-slate-800 text-slate-300">{status}</span>;
    }
  };

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
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time control center for your bespoke tailoring boutique.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip content="Launch new bespoke order draft & pricing engine">
            <Link href="/orders" className="btn-gold">
              <Plus className="w-4 h-4 mr-2" />
              <span>New Order</span>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Active Orders */}
        <Tooltip content="Orders currently in confirmed, cutting, production, or trial stage">
          <div className="glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-yellow-500/40 transition-all duration-300 group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</span>
              <div className="text-3xl font-black text-white">{activeOrdersCount}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                <span>In active processing</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>

        {/* Total Customers */}
        <Tooltip content="Total registered client profiles with active fit histories">
          <div className="glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-blue-500/40 transition-all duration-300 group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clients</span>
              <div className="text-3xl font-black text-white">{customersCount}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registered accounts</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>

        {/* Urgent Kanban Tasks */}
        <Tooltip content="High priority jobs requiring immediate artisan action on Kanban">
          <div className="glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-rose-500/40 transition-all duration-300 group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent Jobs</span>
              <div className="text-3xl font-black text-white">{urgentJobsCount}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Require immediate attention</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <Factory className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>

        {/* Accrued Revenue */}
        <Tooltip content="Gross total value across all confirmed bespoke order bookings">
          <div className="glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Booking Value</span>
              <div className="text-2xl font-black text-white truncate max-w-[160px]">{formatCurrency(totalRevenue)}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirmed booking sums</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>
        
        {/* Collected */}
        <Tooltip content="Total advance amount collected across all orders">
          <div className={`glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-green-500/40 transition-all duration-300 group ${isCollectedGood ? 'border-green-500/30 bg-green-500/5' : ''}`}>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected</span>
              <div className={`text-2xl font-black truncate max-w-[160px] ${isCollectedGood ? 'text-green-400' : 'text-white'}`}>{formatCurrency(totalCollected)}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <DollarSign className={`w-3.5 h-3.5 ${isCollectedGood ? 'text-green-400' : 'text-slate-400'}`} />
                <span>Sum of advance payments</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl group-hover:scale-110 transition-transform ${isCollectedGood ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-300'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>

        {/* Delivery Rate */}
        <Tooltip content="Percentage of total orders that have been successfully delivered">
          <div className="glass-card w-full p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/40 transition-all duration-300 group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Rate</span>
              <div className="text-3xl font-black text-white">{deliveryRate}%</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Delivered vs Total Orders</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Overdue Orders Alert */}
      {overdueOrders.length > 0 && (
        <div className="glass-card rounded-2xl border-rose-500/30 bg-rose-500/5 p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h2>Overdue Orders ({overdueOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueOrders.map(order => (
              <div key={order.id} className="bg-slate-900/60 rounded-xl p-4 border border-rose-500/20">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/orders`} className="font-mono font-bold text-rose-300 hover:text-rose-200">{order.id}</Link>
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded font-bold">
                    {order.daysOverdue} {order.daysOverdue === 1 ? 'day' : 'days'} overdue
                  </span>
                </div>
                <div className="text-white font-semibold text-sm">{order.clientName}</div>
                <div className="text-slate-400 text-xs mt-1">{order.garmentSummary}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
                <span>Recent Orders</span>
              </h2>
              <Link href="/orders" className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Order ID</th>
                    <th className="pb-3 px-4">Client</th>
                    <th className="pb-3 px-4">Garment</th>
                    <th className="pb-3 px-4 text-right">Value</th>
                    <th className="pb-3 pl-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pr-4 font-mono font-bold text-slate-300">{order.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{order.clientName}</td>
                      <td className="py-3 px-4 text-slate-400">{order.garmentSummary}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{formatCurrency(order?.totalAmount || 0)}</td>
                      <td className="py-3 pl-4 text-center">{renderStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                        No orders found. Set up your first order to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Today's Activity Feed */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-400" />
              <span>Today's Activity Feed</span>
            </h2>
            
            {activities.length > 0 ? (
              <div className="space-y-4 mt-4">
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <div className="p-2 rounded-lg bg-slate-800">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">{activity.message}</p>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                        {activity.entityId && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-slate-400">{activity.entityId}</span>
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
          </div>
        </div>

        {/* Right Column: Quick Tools */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Quick Shortcuts</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Tooltip content="Configure swatches, labor & surcharges for new order">
                <Link href="/orders" className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-gold-500/40 hover:bg-slate-900 transition-all group w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Create Order</div>
                      <div className="text-[10px] text-slate-500">Configure swatches & items</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>

              <Tooltip content="Adjust 2D anatomical hotspots & posture modifiers">
                <Link href="/measurements" className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all group w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Fit Profile Engine</div>
                      <div className="text-[10px] text-slate-500">Check CAD 2D silhouettes</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>

              <Tooltip content="Register new client contact & fit history file">
                <Link href="/customers" className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Add Customer</div>
                      <div className="text-[10px] text-slate-500">Log new client contacts</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </Tooltip>
            </div>
          </div>

          {/* Workshop Pipeline Enhancement */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-gold-400" />
              <span>Workshop Pipeline</span>
            </h2>
            <div className="space-y-4">
              {['Fabric Inspection', 'Master Cutting', 'Zardozi/Aari Embroidery', 'Stitching Assembly', 'QC & Ready for Delivery'].map((stage) => {
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
                      <span className="font-mono text-slate-400">{count} jobs</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${dotColor} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
