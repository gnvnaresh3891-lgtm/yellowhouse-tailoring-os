'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Send,
  Save,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Scissors,
  Shirt,
  Sparkles,
  ChevronDown,
  Eye,
  Edit,
  X,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  FileText,
  Check,
  Tag,
  AlertCircle
} from 'lucide-react';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'CUTTING'
  | 'IN_PRODUCTION'
  | 'TRIAL_FITTING'
  | 'QC_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED';

export interface OrderItemRow {
  id: string;
  garmentType: string;
  fabricSku: string;
  fabricMeters: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  garmentSummary: string;
  itemCount: number;
  status: OrderStatus;
  totalAmount: number;
  dueDate: string;
  createdAt: string;
  isUrgent?: boolean;
}

const initialOrders: Order[] = [
  {
    id: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    clientPhone: '+91 98765 43210',
    garmentSummary: 'Sherwani + Churidar',
    itemCount: 2,
    status: 'IN_PRODUCTION',
    totalAmount: 45000,
    dueDate: 'Aug 15',
    createdAt: '2026-08-01',
    isUrgent: true
  },
  {
    id: '#YH-9018',
    clientName: 'Ananya Sharma',
    clientPhone: '+91 98765 43211',
    garmentSummary: 'Lehenga Choli',
    itemCount: 1,
    status: 'TRIAL_FITTING',
    totalAmount: 68000,
    dueDate: 'Aug 12',
    createdAt: '2026-07-28',
    isUrgent: true
  },
  {
    id: '#YH-8994',
    clientName: 'Priya Patel',
    clientPhone: '+91 98765 43213',
    garmentSummary: 'Sari Blouse (x3)',
    itemCount: 3,
    status: 'QC_CHECK',
    totalAmount: 12000,
    dueDate: 'Aug 10',
    createdAt: '2026-07-25'
  },
  {
    id: '#YH-9025',
    clientName: 'Vikram Singh',
    clientPhone: '+91 98765 43212',
    garmentSummary: '3-Piece Suit',
    itemCount: 1,
    status: 'CUTTING',
    totalAmount: 35000,
    dueDate: 'Aug 20',
    createdAt: '2026-08-03'
  },
  {
    id: '#YH-9030',
    clientName: 'Deepika Nair',
    clientPhone: '+91 98765 43215',
    garmentSummary: 'Anarkali Gown',
    itemCount: 1,
    status: 'DELIVERED',
    totalAmount: 28000,
    dueDate: 'Aug 5',
    createdAt: '2026-07-20'
  },
  {
    id: '#YH-9033',
    clientName: 'Mohammed Farooq',
    clientPhone: '+91 98765 43214',
    garmentSummary: 'Bandhgala + Trouser',
    itemCount: 2,
    status: 'DRAFT',
    totalAmount: 42000,
    dueDate: 'Aug 25',
    createdAt: '2026-08-05'
  },
  {
    id: '#YH-9035',
    clientName: 'Arjun Kapoor',
    clientPhone: '+91 98765 43216',
    garmentSummary: 'Custom Shirt (x5)',
    itemCount: 5,
    status: 'CONFIRMED',
    totalAmount: 15000,
    dueDate: 'Aug 18',
    createdAt: '2026-08-04'
  },
  {
    id: '#YH-9038',
    clientName: 'Meera Reddy',
    clientPhone: '+91 98765 43217',
    garmentSummary: 'Corset Blouse',
    itemCount: 1,
    status: 'READY_FOR_DELIVERY',
    totalAmount: 22000,
    dueDate: 'Aug 8',
    createdAt: '2026-08-02'
  }
];

const customerList = [
  { id: 'CUST-001', name: 'Rajeshwar Malhotra', phone: '+91 98765 43210', isVip: true },
  { id: 'CUST-002', name: 'Ananya Sharma', phone: '+91 98765 43211', isVip: true },
  { id: 'CUST-003', name: 'Vikram Singh', phone: '+91 98765 43212', isVip: false },
  { id: 'CUST-004', name: 'Priya Patel', phone: '+91 98765 43213', isVip: false },
  { id: 'CUST-005', name: 'Mohammed Farooq', phone: '+91 98765 43214', isVip: false },
  { id: 'CUST-006', name: 'Deepika Nair', phone: '+91 98765 43215', isVip: true },
  { id: 'CUST-007', name: 'Arjun Kapoor', phone: '+91 98765 43216', isVip: false },
  { id: 'CUST-008', name: 'Meera Reddy', phone: '+91 98765 43217', isVip: false }
];

const garmentOptions: { label: string; value: string; defaultMeters: number; defaultPrice: number; skuPrefix: string }[] = [
  { label: 'Sherwani', value: 'Sherwani', defaultMeters: 4.5, defaultPrice: 28000, skuPrefix: 'SKU-SHER-901' },
  { label: '3-Piece Suit', value: 'Suit', defaultMeters: 3.8, defaultPrice: 35000, skuPrefix: 'SKU-SUIT-804' },
  { label: 'Kurta Set', value: 'Kurta', defaultMeters: 3.0, defaultPrice: 8500, skuPrefix: 'SKU-KRT-302' },
  { label: 'Blouse', value: 'Blouse', defaultMeters: 1.2, defaultPrice: 4000, skuPrefix: 'SKU-BLS-112' },
  { label: 'Lehenga Choli', value: 'Lehenga', defaultMeters: 6.0, defaultPrice: 68000, skuPrefix: 'SKU-LHG-509' },
  { label: 'Anarkali Gown', value: 'Anarkali', defaultMeters: 5.5, defaultPrice: 28000, skuPrefix: 'SKU-ANK-440' },
  { label: 'Corset Blouse', value: 'Corset', defaultMeters: 1.5, defaultPrice: 22000, skuPrefix: 'SKU-CST-201' },
  { label: 'Evening Gown', value: 'Gown', defaultMeters: 5.0, defaultPrice: 32000, skuPrefix: 'SKU-GWN-710' }
];

export default function OrderManagementPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load orders from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('yh_orders');
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {}
      } else {
        localStorage.setItem('yh_orders', JSON.stringify(initialOrders));
      }
    }
  }, []);

  // Form State for Create Order
  const [selectedClientId, setSelectedClientId] = useState<string>(customerList[0].id);
  const [dueDate, setDueDate] = useState<string>('2026-08-25');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<OrderItemRow[]>([
    {
      id: 'item-1',
      garmentType: 'Sherwani',
      fabricSku: 'SKU-SHER-901',
      fabricMeters: 4.5,
      unitPrice: 28000
    }
  ]);

  // Toast / Feedback State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.garmentSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handle Garment Type Change in Item Row
  const handleGarmentTypeChange = (id: string, newGarmentType: string) => {
    const preset = garmentOptions.find((g) => g.value === newGarmentType) || garmentOptions[0];
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            garmentType: newGarmentType,
            fabricSku: preset.skuPrefix,
            fabricMeters: preset.defaultMeters,
            unitPrice: preset.defaultPrice
          };
        }
        return item;
      })
    );
  };

  // Add Item Row
  const handleAddItem = () => {
    const preset = garmentOptions[items.length % garmentOptions.length];
    const newItem: OrderItemRow = {
      id: `item-${Date.now()}-${items.length + 1}`,
      garmentType: preset.value,
      fabricSku: preset.skuPrefix,
      fabricMeters: preset.defaultMeters,
      unitPrice: preset.defaultPrice
    };
    setItems([...items, newItem]);
  };

  // Remove Item Row
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  // Update Item Field
  const handleUpdateItem = (id: string, field: keyof OrderItemRow, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Calculations for Order Summary
  const totalItemsCount = items.length;
  const totalOrderAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0);
  }, [items]);
  const advanceAmount = Math.round(totalOrderAmount * 0.5);

  const selectedCustomer = customerList.find((c) => c.id === selectedClientId) || customerList[0];

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Render Status Badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="badge bg-slate-500/10 text-slate-400 border border-slate-500/20">
            DRAFT
          </span>
        );
      case 'CONFIRMED':
        return <span className="badge badge-blue">CONFIRMED</span>;
      case 'CUTTING':
        return <span className="badge badge-amber">CUTTING</span>;
      case 'IN_PRODUCTION':
        return <span className="badge badge-gold">IN_PRODUCTION</span>;
      case 'TRIAL_FITTING':
        return (
          <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
            TRIAL_FITTING
          </span>
        );
      case 'QC_CHECK':
        return (
          <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20">
            QC_CHECK
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return <span className="badge badge-emerald">READY_FOR_DELIVERY</span>;
      case 'DELIVERED':
        return (
          <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">
            DELIVERED
          </span>
        );
      default:
        return <span className="badge bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  // Create Order Handler
  const handleSaveOrder = (status: OrderStatus) => {
    const nextNum = 9040 + orders.length;
    const garmentSummary = items.map((i) => i.garmentType).join(' + ');

    const newOrder: Order = {
      id: `#YH-${nextNum}`,
      clientName: selectedCustomer.name,
      clientPhone: selectedCustomer.phone,
      garmentSummary,
      itemCount: totalItemsCount,
      status,
      totalAmount: totalOrderAmount,
      dueDate: 'Aug 28',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    if (typeof window !== 'undefined') {
      localStorage.setItem('yh_orders', JSON.stringify(updatedOrders));

      // Auto-generate a Kanban Job Card if the status warrants workshop processing
      if (status !== 'DRAFT') {
        const storedJobs = localStorage.getItem('yh_production_jobs');
        let jobsList = [];
        if (storedJobs) {
          try {
            jobsList = JSON.parse(storedJobs);
          } catch (e) {}
        }

        const newJobCard = {
          id: `JC-${nextNum}`,
          orderId: newOrder.id,
          client: newOrder.clientName,
          garment: garmentSummary,
          karigar: 'Karigar Salim', // Default assignee
          samMinutesLogged: 0,
          samTotalEstimate: items.length * 120, // 2 hours base estimate per item
          priority: status === 'CONFIRMED' || newOrder.isUrgent ? 'Urgent' as const : 'Normal' as const,
          dueDate: 'Aug 28',
          progress: 0,
          stage: 'Fabric Inspection' as const,
          fabricDetails: items.map(i => `${i.fabricSku || 'Standard Fabric'} - ${i.fabricMeters}m`).join(', '),
          notes: notes || 'New order launched. Verify landmarks and pattern specs.'
        };

        localStorage.setItem('yh_production_jobs', JSON.stringify([newJobCard, ...jobsList]));
      }
    }

    setActiveTab('active');

    // Reset form
    setNotes('');
    setItems([
      {
        id: 'item-1',
        garmentType: 'Sherwani',
        fabricSku: 'SKU-SHER-901',
        fabricMeters: 4.5,
        unitPrice: 28000
      }
    ]);

    if (status === 'CONFIRMED') {
      showNotification(`Quotation sent via WhatsApp to ${selectedCustomer.name}! Order #${newOrder.id} created.`);
    } else {
      showNotification(`Order #${newOrder.id} saved as Draft.`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-2 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shadow-md">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Management</h1>
              <span className="badge badge-rose flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Atelier OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Create tailored customer orders, allocate fabrics, manage fittings, and send WhatsApp quotations.
            </p>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="flex items-center space-x-2">
          {activeTab === 'active' ? (
            <button
              onClick={() => setActiveTab('create')}
              className="btn-gold flex items-center space-x-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Order</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('active')}
              className="btn-ghost flex items-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Active Orders</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white">{orders.length}</span>
            <span className="text-[11px] text-slate-500">Live atelier jobs</span>
          </div>
        </div>

        <div className="glass-card-gold rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">In Production</span>
            <Scissors className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-yellow-300">
              {orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'CUTTING').length}
            </span>
            <span className="text-[11px] text-yellow-500/80">Cutting & Stitching</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Fittings & QC</span>
            <Shirt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white">
              {orders.filter((o) => o.status === 'TRIAL_FITTING' || o.status === 'QC_CHECK').length}
            </span>
            <span className="text-[11px] text-slate-500">Client Reviews</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Gross Order Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold text-white">
              {formatCurrency(orders.reduce((acc, curr) => acc + curr.totalAmount, 0))}
            </span>
            <span className="text-[11px] text-slate-500">Pipeline</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-800/80 space-x-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3.5 px-3 text-sm font-semibold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'active'
              ? 'border-yellow-500 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Active Orders</span>
          <span className="badge badge-gold font-mono ml-1.5">{orders.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3.5 px-3 text-sm font-semibold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
            activeTab === 'create'
              ? 'border-yellow-500 text-yellow-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
          <span className="badge badge-blue ml-1.5">New</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ORDERS */}
      {activeTab === 'active' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters & Search */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order #, Client name, or Garment type..."
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
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-dark w-auto text-xs font-medium cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Statuses</option>
                  <option value="DRAFT" className="bg-slate-900">DRAFT</option>
                  <option value="CONFIRMED" className="bg-slate-900">CONFIRMED</option>
                  <option value="CUTTING" className="bg-slate-900">CUTTING</option>
                  <option value="IN_PRODUCTION" className="bg-slate-900">IN_PRODUCTION</option>
                  <option value="TRIAL_FITTING" className="bg-slate-900">TRIAL_FITTING</option>
                  <option value="QC_CHECK" className="bg-slate-900">QC_CHECK</option>
                  <option value="READY_FOR_DELIVERY" className="bg-slate-900">READY_FOR_DELIVERY</option>
                  <option value="DELIVERED" className="bg-slate-900">DELIVERED</option>
                </select>

                {(searchQuery || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="btn-ghost text-xs py-2 px-3 flex items-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/50 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Order #</th>
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Garment Type</th>
                    <th className="py-4 px-4 text-center">Items</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4">Due Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order # */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-yellow-400 text-sm group-hover:underline">
                            {order.id}
                          </span>
                          {order.isUrgent && (
                            <span className="badge badge-rose text-[9px] px-1.5 py-0.2">URGENT</span>
                          )}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                            {order.clientName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{order.clientPhone}</div>
                        </div>
                      </td>

                      {/* Garment Type */}
                      <td className="py-4 px-4">
                        <span className="text-slate-300 font-medium text-xs bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                          {order.garmentSummary}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 text-center">
                        <span className="badge badge-blue font-mono font-bold">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{renderStatusBadge(order.status)}</td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right font-mono font-semibold text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-yellow-500/80 shrink-0" />
                          <span>{order.dueDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View Order Details"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              showNotification(`Quotation resent for ${order.id} via WhatsApp`);
                            }}
                            title="Resend WhatsApp Quotation"
                            className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                          <p className="text-slate-300 text-sm font-semibold">No orders match your filter</p>
                          <p className="text-slate-500 text-xs">Try clearing the search query or changing status criteria.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('ALL');
                            }}
                            className="btn-ghost text-xs py-1.5 px-3"
                          >
                            Clear Filters
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
              <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> active orders</span>
              <span className="font-mono text-slate-500">YellowHouse Tailoring OS • Order Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE NEW ORDER */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Selection */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-base font-bold text-white">1. Select Client Profile</h2>
                </div>
                {selectedCustomer.isVip && (
                  <span className="badge badge-gold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>VIP Client</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Client Name *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="input-dark cursor-pointer text-sm font-medium"
                  >
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name} ({c.phone}) {c.isVip ? '★ VIP' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Requested Target Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-dark text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Item List Creation */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-base font-bold text-white">2. Order Garment Items</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn-gold text-xs flex items-center space-x-1.5 cursor-pointer py-1.5 px-3"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Items Table / Cards */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/90 space-y-3 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-xs font-bold text-yellow-400 flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Garment Item #{idx + 1}</span>
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Garment Type Selector */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Garment Type</label>
                        <select
                          value={item.garmentType}
                          onChange={(e) => handleGarmentTypeChange(item.id, e.target.value)}
                          className="input-dark text-xs font-medium cursor-pointer"
                        >
                          {garmentOptions.map((g) => (
                            <option key={g.value} value={g.value} className="bg-slate-900">
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fabric SKU Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Fabric SKU</label>
                        <input
                          type="text"
                          value={item.fabricSku}
                          onChange={(e) => handleUpdateItem(item.id, 'fabricSku', e.target.value)}
                          placeholder="e.g. SKU-SILK-902"
                          className="input-dark text-xs font-mono"
                        />
                      </div>

                      {/* Fabric Meters (Auto-Calculated / Editable using pom-input) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-yellow-400/90 flex items-center justify-between">
                          <span>Fabric Required (m)</span>
                          <span className="text-[9px] text-slate-500">Auto</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            value={item.fabricMeters}
                            onChange={(e) => handleUpdateItem(item.id, 'fabricMeters', parseFloat(e.target.value) || 0)}
                            className="pom-input text-xs"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-yellow-500/70 font-mono">meters</span>
                        </div>
                      </div>

                      {/* Unit Price Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Unit Price (₹)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="500"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="input-dark text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Special Tailoring Notes */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Special Tailoring & Embroidery Instructions</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention specific lining materials, thread color preferences, embroidery motifs, or fitting trial preferences..."
                className="input-dark resize-none text-xs"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="space-y-6">
            <div className="glass-card-gold rounded-2xl p-6 space-y-6 sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-yellow-500/20">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Order Summary</h3>
                </div>
                <span className="badge badge-gold font-mono">NEW QUOTE</span>
              </div>

              {/* Client Info Brief */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Client Profile</div>
                <div className="font-bold text-white text-sm">{selectedCustomer.name}</div>
                <div className="text-slate-400 font-mono">{selectedCustomer.phone}</div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Items</span>
                  <span className="font-mono font-bold text-white">{totalItemsCount} {totalItemsCount === 1 ? 'garment' : 'garments'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Fabric Estimated</span>
                  <span className="font-mono text-yellow-400 font-semibold">
                    {items.reduce((acc, curr) => acc + (curr.fabricMeters || 0), 0).toFixed(1)} meters
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-200">Total Order Amount</span>
                  <span className="font-mono text-lg font-extrabold text-white">
                    {formatCurrency(totalOrderAmount)}
                  </span>
                </div>

                {/* 50% Advance Calculation Card */}
                <div className="bg-yellow-500/10 rounded-xl p-3.5 border border-yellow-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-yellow-400">
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>50% Mandatory Advance</span>
                    </span>
                    <span className="font-mono font-extrabold text-base text-yellow-300">
                      {formatCurrency(advanceAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-yellow-500/20">
                    <span>Balance Due on Fitting</span>
                    <span className="font-mono font-semibold text-slate-300">{formatCurrency(totalOrderAmount - advanceAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Send Quotation via WhatsApp & Save as Draft */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveOrder('CONFIRMED')}
                  className="btn-gold w-full flex items-center justify-center space-x-2 py-3 cursor-pointer text-sm font-bold shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Quotation via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveOrder('DRAFT')}
                  className="btn-ghost w-full flex items-center justify-center space-x-2 py-2.5 cursor-pointer text-sm"
                >
                  <Save className="w-4 h-4 text-slate-400" />
                  <span>Save as Draft</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                Clicking WhatsApp Quotation generates client payment link with 50% advance requirement.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Detail Drawer for Selected Active Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-gold rounded-2xl border border-yellow-500/30 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedOrder.id}</h3>
                    {renderStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Created on {selectedOrder.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Client</span>
                <p className="text-white font-bold">{selectedOrder.clientName}</p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedOrder.clientPhone}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Target Due Date</span>
                <p className="text-yellow-400 font-mono font-bold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 inline shrink-0" />
                  <span>{selectedOrder.dueDate}</span>
                </p>
                <p className="text-slate-500 text-[10px]">Atelier Schedule</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Garment Items Summary</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-200 font-medium">{selectedOrder.garmentSummary}</span>
                <span className="badge badge-blue font-mono">{selectedOrder.itemCount} Items</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400 text-xs">Total Amount:</span>
                <span className="font-mono font-extrabold text-white text-base">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-400/90 pt-1">
                <span>50% Advance Received:</span>
                <span className="font-mono font-bold">{formatCurrency(selectedOrder.totalAmount * 0.5)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-ghost text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showNotification(`WhatsApp quotation shared for ${selectedOrder.id}`);
                  setSelectedOrder(null);
                }}
                className="btn-gold text-xs flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Resend WhatsApp Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
