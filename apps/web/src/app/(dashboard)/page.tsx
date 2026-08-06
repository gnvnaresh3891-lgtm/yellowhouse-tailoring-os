'use client';

import React from 'react';
import {
  ShoppingBag,
  Scissors,
  CheckCircle2,
  MessageSquare,
  ArrowUpRight,
  Package,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';

const kpiCards = [
  {
    label: 'Active Orders',
    value: '42',
    trend: '+12%',
    trendUp: true,
    sub: '18 in Stitching, 12 in Embroidery',
    icon: ShoppingBag,
    iconColor: 'text-yellow-400',
  },
  {
    label: 'Karigar SAM Payout',
    value: '₹1,42,800',
    trend: '3,420 mins',
    trendUp: true,
    sub: 'Logged this week',
    icon: Scissors,
    iconColor: 'text-yellow-400',
  },
  {
    label: 'Fitting Success',
    value: '96.4%',
    trend: '+2.1%',
    trendUp: true,
    sub: 'First-trial approval SLA',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
  {
    label: 'WhatsApp Deposits',
    value: '₹4,85,000',
    trend: '91% conv.',
    trendUp: true,
    sub: '50% advance deposit rate',
    icon: MessageSquare,
    iconColor: 'text-yellow-400',
  },
];

const recentOrders = [
  {
    id: '#YH-9021',
    client: 'Rajeshwar Malhotra',
    garment: 'Sherwani',
    status: 'Cutting',
    badgeClass: 'badge-amber',
    amount: '₹45,000',
  },
  {
    id: '#YH-9018',
    client: 'Ananya Sharma',
    garment: 'Lehenga',
    status: 'Embroidery',
    badgeClass: 'badge-gold',
    amount: '₹85,000',
  },
  {
    id: '#YH-8994',
    client: 'Priya Patel',
    garment: 'Blouse',
    status: 'Stitching',
    badgeClass: 'badge-blue',
    amount: '₹12,500',
  },
  {
    id: '#YH-8977',
    client: 'Vikram Singh',
    garment: 'Suit (3-Piece)',
    status: 'Stitching',
    badgeClass: 'badge-blue',
    amount: '₹38,000',
  },
  {
    id: '#YH-8965',
    client: 'Meera Iyer',
    garment: 'Anarkali',
    status: 'QC Ready',
    badgeClass: 'badge-emerald',
    amount: '₹28,000',
  },
];

const productionStages = [
  { label: 'Cutting', count: 3, percentage: 20, color: 'bg-slate-400' },
  { label: 'Embroidery', count: 2, percentage: 13, color: 'bg-amber-400' },
  { label: 'Stitching', count: 4, percentage: 27, color: 'bg-blue-400' },
  { label: 'QC Check', count: 1, percentage: 7, color: 'bg-purple-400' },
  { label: 'Ready for Delivery', count: 5, percentage: 33, color: 'bg-emerald-400' },
];

export default function TenantDashboard() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tenant Atelier Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{today}</span>
            <span className="text-slate-700">•</span>
            <span>
              Welcome back, <span className="text-yellow-400 font-medium">Master Latif</span>
            </span>
          </p>
        </div>
        <button className="btn-gold flex items-center space-x-2">
          <Package className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="glass-card animate-fade-in rounded-2xl p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
                {card.trend && (
                  <span
                    className={`text-xs font-medium flex items-center ${
                      card.trendUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Orders + Production Overview Mini Chart Placeholder */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table — 2 columns */}
        <div className="xl:col-span-2 glass-card animate-fade-in rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-yellow-400" />
                <span>Recent Orders</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Active atelier client orders and payment status
              </p>
            </div>
            <button className="text-xs text-yellow-400 hover:text-yellow-300 font-medium flex items-center space-x-1 transition-colors">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/40">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Garment Type
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-yellow-400 font-semibold text-xs">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200 text-xs">
                        {order.client}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {order.garment}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${order.badgeClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-xs text-white">
                      {order.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Overview Mini Chart Placeholder */}
        <div className="glass-card animate-fade-in rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
                <span>Production Overview</span>
              </h2>
              <span className="text-[10px] badge badge-gold">Active Jobs: 15</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Stage distribution across workshop active job pipeline
            </p>

            {/* Stage Progress Bars */}
            <div className="space-y-4">
              {productionStages.map((stage, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{stage.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {stage.count} jobs ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Fitting SLA</span>
            <span className="text-emerald-400 font-bold font-mono">98% On Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
