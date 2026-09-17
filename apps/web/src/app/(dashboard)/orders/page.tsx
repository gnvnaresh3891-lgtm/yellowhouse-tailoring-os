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
  AlertCircle,
  Printer,
  UserPlus,
  Ruler,
  Layers,
  ChevronRight,
  Package,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { syncOrderToJobsStorage, logActivity, calculatePaymentStatus, calculateBalance } from '@/lib/state-sync-utils';
import { useToast } from '@/components/toast-context';
import { QRCodeSVG, BarcodeSVG } from '@/components/id-codes';
import { calculateBespokePricing } from '@/lib/pricing-calculator';
import { calculateFabricYield } from '@/lib/fabric-yield';
import { GarmentCategory } from '@/types/measurement';
import { Tooltip } from '@/components/Tooltip';
import { useCurrency } from '@/components/currency-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type {
  OrderStatus,
  BOMItem,
  OrderItemRow,
  Order,
  OrderFormDraft,
  CustomerOption,
  GarmentOption
} from '@/lib/orders-utils';
import {
  initialOrders,
  customerList,
  garmentOptions,
  generateCustomerFabricSku,
  getDefaultBOMForGarment,
  getValidNextStatuses,
  resolveFabricSku,
  findGarmentPreset
} from '@/lib/orders-utils';

export default function OrderManagementPage() {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" size="sm" dot>DELIVERED</Badge>;
      case 'READY_FOR_DELIVERY':
        return <Badge variant="gold" size="sm" dot>READY</Badge>;
      case 'QC_CHECK':
        return <Badge variant="info" size="sm" dot>QC</Badge>;
      case 'TRIAL_FITTING':
        return <Badge variant="warning" size="sm" dot>TRIAL</Badge>;
      case 'IN_PRODUCTION':
        return <Badge variant="warning" size="sm" dot>PRODUCTION</Badge>;
      case 'CUTTING':
        return <Badge variant="info" size="sm" dot>CUTTING</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info" size="sm" dot>CONFIRMED</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral" size="sm" dot>DRAFT</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="sm" dot>CANCELLED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  // Load orders from localStorage on mount with array safety
  useEffect(() => {
    try {
      const storedOrders = getLocalStorage<Order[]>('yh_orders', initialOrders);
      if (Array.isArray(storedOrders) && storedOrders.length > 0) {
        setOrders(storedOrders);
      } else {
        setOrders(initialOrders);
        setLocalStorage('yh_orders', initialOrders);
      }
    } catch (e) {
      setOrders(initialOrders);
      console.error(e);
    }
  }, []);

  // Dynamic customer list from yh_customers with fallback
  const [customersList, setCustomersList] = useState<any[]>(customerList);

  useEffect(() => {
    try {
      const stored = getLocalStorage<any[]>('yh_customers', customerList);
      if (Array.isArray(stored) && stored.length > 0) {
        setCustomersList(stored);
      } else {
        setCustomersList(customerList);
      }
    } catch {
      setCustomersList(customerList);
    }
  }, []);

  const activeCustomers = customersList;

  // Form State for Create Order
  const [selectedClientId, setSelectedClientId] = useState<string>(customerList[0].id);
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [newQuickCustomer, setNewQuickCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Men' as 'Men' | 'Women',
    preferredFit: 'Slim Bespoke',
    isVip: false,
    notes: ''
  });
  const [quickCustomerError, setQuickCustomerError] = useState('');

  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>('');
  const [isPomLinked, setIsPomLinked] = useState<boolean>(true);
  
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [deleteModalOrder, setDeleteModalOrder] = useState<Order | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [printModalOrder, setPrintModalOrder] = useState<Order | null>(null);

  const [items, setItems] = useState<OrderItemRow[]>([
    {
      id: 'item-1',
      garmentType: 'Sherwani',
      fabricSku: 'SKU-SHER-901',
      fabricMeters: 4.5,
      unitPrice: 32000,
      bomItems: getDefaultBOMForGarment('Sherwani')
    }
  ]);

  // Load unsubmitted order draft from yh_orders_draft on mount
  useEffect(() => {
    try {
      const draft = getLocalStorage<OrderFormDraft | null>('yh_orders_draft', null);
      if (draft && typeof draft === 'object' && Array.isArray(draft.items) && draft.items.length > 0) {
        if (draft.selectedClientId) setSelectedClientId(draft.selectedClientId);
        if (draft.dueDate) setDueDate(draft.dueDate);
        if (draft.notes !== undefined) setNotes(draft.notes);
        if (draft.advanceAmount !== undefined) setAdvanceAmountInput(draft.advanceAmount.toString());
        setItems(draft.items);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Dynamic order draft autosave
  useEffect(() => {
    const draft: OrderFormDraft = {
      selectedClientId,
      dueDate,
      notes,
      advanceAmount: Number(advanceAmountInput) || 0,
      items,
      updatedAt: new Date().toISOString()
    };
    setLocalStorage('yh_orders_draft', draft);
  }, [selectedClientId, dueDate, notes, advanceAmountInput, items]);

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
          const isCust = item.isCustomerFabric;
          const sku = isCust ? item.fabricSku : preset.skuPrefix;
          return {
            ...item,
            garmentType: newGarmentType,
            fabricSku: sku,
            fabricMeters: preset.defaultMeters,
            unitPrice: preset.defaultPrice,
            bomItems: getDefaultBOMForGarment(newGarmentType)
          };
        }
        return item;
      })
    );
  };

  // Handle Customer Fabric Toggle strictly adhering to CUST-FAB- prefix
  const handleToggleCustomerFabric = (itemId: string, isCustomer: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const fabricSku = resolveFabricSku(item.fabricSku, isCustomer, item.garmentType, garmentOptions);
          return {
            ...item,
            isCustomerFabric: isCustomer,
            fabricSku,
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
      unitPrice: preset.defaultPrice,
      bomItems: getDefaultBOMForGarment(preset.value)
    };
    setItems([...items, newItem]);
  };

  // Remove Item Row
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  // Add BOM Item to an Order Item Row
  const handleAddBOMItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentBOM = item.bomItems || getDefaultBOMForGarment(item.garmentType);
          const newBOMItem: BOMItem = {
            id: `bom-${Date.now()}-${currentBOM.length + 1}`,
            name: 'New Custom Accessory / Trim',
            category: 'other',
            quantity: 1,
            unit: 'pcs',
            unitCost: 75,
            isOptional: true
          };
          return { ...item, bomItems: [...currentBOM, newBOMItem] };
        }
        return item;
      })
    );
  };

  // Update BOM Item Field
  const handleUpdateBOMItem = (itemId: string, bomId: string, field: keyof BOMItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentBOM = item.bomItems || getDefaultBOMForGarment(item.garmentType);
          const updatedBOM = currentBOM.map((b) => (b.id === bomId ? { ...b, [field]: value } : b));
          return { ...item, bomItems: updatedBOM };
        }
        return item;
      })
    );
  };

  // Remove BOM Item
  const handleRemoveBOMItem = (itemId: string, bomId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentBOM = item.bomItems || getDefaultBOMForGarment(item.garmentType);
          return { ...item, bomItems: currentBOM.filter((b) => b.id !== bomId) };
        }
        return item;
      })
    );
  };

  // Update Item Field
  const handleUpdateItem = <K extends keyof OrderItemRow>(id: string, field: K, value: OrderItemRow[K]) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Dynamic Bespoke Pricing Engine Integration
  const dynamicPricing = useMemo(() => {
    return items.map((item) => {
      const g = item.garmentType.toLowerCase();
      let cat: GarmentCategory = 'mens-suit';
      if (g.includes('sherwani') || g.includes('kurta')) cat = 'mens-sherwani';
      else if (g.includes('shirt')) cat = 'mens-shirt';
      else if (g.includes('trouser')) cat = 'mens-trouser';
      else if (g.includes('lehenga')) cat = 'womens-lehenga';
      else if (g.includes('anarkali')) cat = 'womens-anarkali';
      else if (g.includes('corset')) cat = 'womens-corset';
      else if (g.includes('gown')) cat = 'womens-gown';
      else if (g.includes('blouse')) cat = 'womens-blouse';

      const meters = item.fabricMeters || calculateFabricYield({ garmentCategory: cat, boltWidth: 44 }).requiredMeters;
      const costPerMeter = Math.round((item.unitPrice || 2500) / (meters || 1));

      return calculateBespokePricing({
        garmentCategory: cat,
        fabricCostPerMeter: costPerMeter > 0 ? costPerMeter : 2500,
        boltWidth: 44,
      });
    });
  }, [items]);

  const totalCalculatedSamMinutes = useMemo(() => {
    return dynamicPricing.reduce((sum, p) => sum + p.totalSamMinutes, 0);
  }, [dynamicPricing]);

  const totalLaborCost = useMemo(() => {
    return dynamicPricing.reduce((sum, p) => sum + p.baseLaborCost, 0);
  }, [dynamicPricing]);

  // Calculations for Order Summary
  const totalItemsCount = items.length;
  const totalOrderAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0);
  }, [items]);
  const advanceAmount = Math.round(totalOrderAmount * 0.5);

  const selectedCustomer = activeCustomers.find((c: any) => c.id === selectedClientId) || activeCustomers[0] || customerList[0];

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) {
      const today = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[today.getMonth()]} ${today.getDate()}`;
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${months[monthIdx]} ${day}`;
    }
    return dateStr;
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    const client = activeCustomers.find(c => c.name === order.clientName);
    if (client) setSelectedClientId(client.id);
    
    if (order.rawDueDate) {
      setDueDate(order.rawDueDate);
    }
    
    setNotes(order.notes || '');
    if (order.items && order.items.length > 0) {
      setItems(order.items);
    }
    setActiveTab('create');
  };

  const handleQuickAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCustomerError('');

    if (!newQuickCustomer.name.trim()) {
      setQuickCustomerError('Customer name is required.');
      return;
    }
    if (!newQuickCustomer.phone.trim()) {
      setQuickCustomerError('Phone number is required.');
      return;
    }

    const newId = `CUST-${String(customersList.length + 1).padStart(3, '0')}`;
    const initials = newQuickCustomer.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const createdCustomer = {
      id: newId,
      name: newQuickCustomer.name.trim(),
      phone: newQuickCustomer.phone.trim(),
      email: newQuickCustomer.email.trim() || undefined,
      gender: newQuickCustomer.gender,
      preferredFit: newQuickCustomer.preferredFit,
      isVip: newQuickCustomer.isVip,
      measurementsCount: 0,
      lastVisit: 'Just now',
      initials: initials || 'CL',
      notes: newQuickCustomer.notes.trim() || undefined
    };

    const updated = [createdCustomer, ...customersList];
    setCustomersList(updated);
    setLocalStorage('yh_customers', updated);
    
    // Auto-select this newly created customer for the current order
    setSelectedClientId(newId);
    
    logActivity({
      type: 'customer_added',
      message: `New customer registered: ${createdCustomer.name}`,
      entityId: newId
    });

    setIsQuickAddCustomerOpen(false);
    setNewQuickCustomer({
      name: '',
      phone: '',
      email: '',
      gender: 'Men',
      preferredFit: 'Slim Bespoke',
      isVip: false,
      notes: ''
    });
    toast.success(`Client ${createdCustomer.name} added and selected!`);
  };

  const handleConfirmDelete = () => {
    if (!deleteModalOrder || !deleteReason.trim()) return;
    
    try {
      const deletedLogs = getLocalStorage<any[]>('yh_deleted_orders_log', []);
      deletedLogs.push({
        orderId: deleteModalOrder.id,
        reason: deleteReason,
        deletedAt: new Date().toISOString()
      });
      setLocalStorage('yh_deleted_orders_log', deletedLogs);
    } catch (e) { console.error(e); }

    const updatedOrders = orders.filter(o => o.id !== deleteModalOrder.id);
    setOrders(updatedOrders);
    setLocalStorage('yh_orders', updatedOrders);
    
    setDeleteModalOrder(null);
    setDeleteReason('');
    showNotification(`Order ${deleteModalOrder.id} deleted successfully.`);
  };

  // Direct status change handler with bidirectional sync to jobs storage
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    let updatedOrderObj: Order | null = null;
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        updatedOrderObj = { ...o, status: newStatus };
        return updatedOrderObj;
      }
      return o;
    });
    setOrders(updatedOrders);
    setLocalStorage('yh_orders', updatedOrders);

    if (updatedOrderObj) {
      syncOrderToJobsStorage(updatedOrderObj);
      showNotification(`Order ${orderId} transitioned to ${newStatus}`);
    }
  };

  // Create / Update Order Handler
  const handleSaveOrder = (status: OrderStatus) => {
    const garmentSummary = items.map((i) => i.garmentType).join(' + ');
    const formattedDate = formatDueDate(dueDate);
    
    const parsedAdvance = Number(advanceAmountInput) || 0;
    const computedBalance = calculateBalance(totalOrderAmount, parsedAdvance);
    const computedPaymentStatus = calculatePaymentStatus(totalOrderAmount, parsedAdvance);

    let updatedOrders = [...orders];
    let finalOrderId = '';
    let isNew = !editingOrderId;

    if (editingOrderId) {
      finalOrderId = editingOrderId;
      updatedOrders = updatedOrders.map(o => {
        if (o.id === editingOrderId) {
          const updated: Order = {
            ...o,
            customerId: selectedCustomer.id,
            clientName: selectedCustomer.name,
            clientPhone: selectedCustomer.phone,
            garmentSummary,
            itemCount: totalItemsCount,
            status: status === 'DRAFT' ? o.status : status, 
            totalAmount: totalOrderAmount,
            advanceAmount: parsedAdvance,
            balanceAmount: computedBalance,
            paymentStatus: computedPaymentStatus as any,
            dueDate: formattedDate,
            rawDueDate: dueDate,
            items,
            notes,
            pomSnapshotLinked: isPomLinked
          };
          syncOrderToJobsStorage(updated);
          logActivity({ type: 'order_updated', message: `Order ${updated.id} was updated.`, entityId: updated.id });
          return updated;
        }
        return o;
      });
    } else {
      finalOrderId = `#YH-${Date.now().toString(36).toUpperCase()}`;
      const newOrder: Order = {
        id: finalOrderId,
        customerId: selectedCustomer.id,
        clientName: selectedCustomer.name,
        clientPhone: selectedCustomer.phone,
        garmentSummary,
        itemCount: totalItemsCount,
        status,
        totalAmount: totalOrderAmount,
        advanceAmount: parsedAdvance,
        balanceAmount: computedBalance,
        paymentStatus: computedPaymentStatus as any,
        dueDate: formattedDate,
        rawDueDate: dueDate,
        createdAt: new Date().toISOString().split('T')[0],
        items,
        notes,
        pomSnapshotLinked: isPomLinked
      };
      updatedOrders = [newOrder, ...orders];
      syncOrderToJobsStorage(newOrder);
      logActivity({ type: 'order_created', message: `Order ${newOrder.id} was created.`, entityId: newOrder.id });
    }

    setOrders(updatedOrders);
    setLocalStorage('yh_orders', updatedOrders);
    removeLocalStorage('yh_orders_draft');

    setActiveTab('active');
    setEditingOrderId(null);

    // Reset form
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 14);
    setDueDate(nextDueDate.toISOString().split('T')[0]);
    setNotes('');
    setAdvanceAmountInput('');
    setItems([
      {
        id: 'item-1',
        garmentType: 'Sherwani',
        fabricSku: 'SKU-SHER-901',
        fabricMeters: 4.5,
        unitPrice: 32000,
        bomItems: getDefaultBOMForGarment('Sherwani')
      }
    ]);

    if (status === 'CONFIRMED') {
      showNotification(`Order ${finalOrderId} confirmed! WhatsApp quotation dispatched to ${selectedCustomer.name}.`);
    } else {
      showNotification(`Order ${finalOrderId} saved as Draft.`, 'info');
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-[1540px] mx-auto w-full space-y-8 animate-fade-in pb-16 font-sans">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-2xl ${
              notification.type === 'success'
                ? 'bg-amber-950/40 border-[#D4AF37]/50 text-amber-300 shadow-[0_12px_32px_rgba(212,175,55,0.2)]'
                : 'bg-slate-900/95 border-white/10 text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-3 p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header with Apple Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
              Orders & Dynamic BOM Studio
            </h1>
            <Badge variant="gold" size="sm">Atelier OS</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Intake bespoke commissions, allocate fabrics, manage 12-garment BOM presets, and monitor fitting trials.
          </p>
        </div>

        {/* Apple Segmented Control Tab Switcher */}
        <div className="w-full md:w-auto">
          <SegmentedControl
            options={[
              { value: 'active', label: `Active Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
              { value: 'create', label: editingOrderId ? 'Edit Order' : 'Create Order', icon: <Plus className="w-4 h-4" /> }
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'active' | 'create')}
            size="md"
          />
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" padding="sm" hoverable className="border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white font-display">{orders.length}</span>
            <span className="text-[11px] text-slate-500">All registered</span>
          </div>
        </Card>

        <Card variant="glass" padding="sm" hoverable className="border-amber-500/30 bg-amber-950/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">In Production</span>
            <Scissors className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-amber-300 font-display">
              {orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'CUTTING').length}
            </span>
            <span className="text-[11px] text-amber-400/80">Active floor</span>
          </div>
        </Card>

        <Card variant="glass" padding="sm" hoverable className="border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Fitting Trials</span>
            <Shirt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-white font-display">
              {orders.filter((o) => o.status === 'TRIAL_FITTING' || o.status === 'QC_CHECK').length}
            </span>
            <span className="text-[11px] text-slate-500">First / 2nd Trials</span>
          </div>
        </Card>

        <Card variant="glass" padding="sm" hoverable className="border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Gross Booking</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              {formatCurrency(orders.reduce((acc, curr) => acc + curr.totalAmount, 0))}
            </span>
            <span className="text-[11px] text-slate-500">Pipeline</span>
          </div>
        </Card>
      </div>

      {/* TAB 1: ACTIVE ORDERS */}
      {activeTab === 'active' && (
        <div className="space-y-5 animate-fade-in">
          {/* Filters & Search - Apple Style Controls */}
          <Card variant="glass" padding="sm" className="border-white/10">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by Order #, Client name, or Garment type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  shape="pill"
                  inputSize="md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                  <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Stage:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900/80 border border-white/10 hover:border-white/20 rounded-full text-xs font-semibold px-4 py-2 text-slate-200 cursor-pointer focus:outline-none focus:border-[#D4AF37] backdrop-blur-md"
                >
                  <option value="ALL" className="bg-slate-900">All Stages</option>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Orders Table with Apple Styling */}
          <Card variant="glass" padding="none" className="border-white/10 hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Order #</th>
                    <th className="py-4 px-4">Client Profile</th>
                    <th className="py-4 px-4">Garments & BOM</th>
                    <th className="py-4 px-4 text-center">Items</th>
                    <th className="py-4 px-4">Stage Transition</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4">Due Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order # */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-300 text-sm group-hover:underline">
                            {order.id}
                          </span>
                          {order.isUrgent && (
                            <Badge variant="danger" size="sm">URGENT</Badge>
                          )}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                            <span>{order.clientName}</span>
                            {order.pomSnapshotLinked && (
                              <Tooltip content="POM measurements linked to active CAD form">
                                <span className="p-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">
                                  <Ruler className="w-3 h-3 inline" />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{order.clientPhone}</div>
                        </div>
                      </td>

                      {/* Garment Type */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="text-slate-200 font-medium text-xs bg-slate-900/90 px-3 py-1 rounded-full border border-white/10 inline-block">
                            {order.garmentSummary}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 text-center">
                        <Badge variant="neutral" size="sm" className="font-mono font-bold">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </Badge>
                      </td>

                      {/* Status State Machine Transition */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-900/90 border border-white/15 hover:border-[#D4AF37] rounded-full text-xs py-1.5 px-3 text-slate-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                        >
                          <option value={order.status} className="bg-slate-900 text-amber-300 font-bold">{order.status}</option>
                          {getValidNextStatuses(order.status).map((s) => {
                            if (s !== order.status) {
                              return <option key={s} value={s} className="bg-slate-900">{s}</option>;
                            }
                            return null;
                          })}
                        </select>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-semibold text-white tabular-nums">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        {order.paymentStatus === 'FULLY_PAID' && <Badge variant="success" size="sm" className="mt-1">FULLY PAID</Badge>}
                        {order.paymentStatus === 'ADVANCE_PAID' && <Badge variant="warning" size="sm" className="mt-1">ADVANCE PAID</Badge>}
                        {(!order.paymentStatus || order.paymentStatus === 'UNPAID') && <Badge variant="danger" size="sm" className="mt-1">UNPAID</Badge>}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{order.dueDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <Tooltip content="Print Delivery Note & Job Tag">
                            <button
                              onClick={() => setPrintModalOrder(order)}
                              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              <Printer className="w-4 h-4 text-amber-400" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Inspect item breakdown and status">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit Order">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Resend WhatsApp quotation message">
                            <button
                              onClick={() => {
                                showNotification(`Quotation resent for ${order.id} via WhatsApp`);
                              }}
                              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-[#D4AF37] transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete Order">
                            <button
                              onClick={() => setDeleteModalOrder(order)}
                              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                          <p className="text-slate-300 text-sm font-semibold">No orders match your filter</p>
                          <p className="text-slate-500 text-xs">Try clearing the search query or changing stage criteria.</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('ALL');
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> atelier orders</span>
              <span className="font-mono text-slate-500">YellowHouse OS • High-Altitude Order Engine</span>
            </div>
          </Card>

          {/* Mobile Orders View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                variant="glass"
                padding="sm"
                className="border-white/10 space-y-3 cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-2">
                      <span>{order.clientName}</span>
                      {order.isUrgent && <Badge variant="danger" size="sm">URGENT</Badge>}
                    </div>
                    <div className="text-xs text-amber-300 font-mono mt-0.5">{order.id}</div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-900 border border-white/10 rounded-full text-[10px] py-1 px-2.5 text-slate-200 font-bold focus:outline-none"
                    >
                      <option value={order.status}>{order.status}</option>
                      {getValidNextStatuses(order.status).map(s => {
                        if (s !== order.status) return <option key={s} value={s}>{s}</option>;
                        return null;
                      })}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="truncate max-w-[200px]">{order.garmentSummary}</span>
                  <span className="font-mono font-bold">{formatCurrency(order.totalAmount)}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#D4AF37]" /> Due {order.dueDate}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPrintModalOrder(order); }} className="text-amber-400 hover:text-amber-300">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEditOrder(order); }} className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE / EDIT BESPOKE ORDER STUDIO */}
      {activeTab === 'create' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Client Profile, Garment Selection, BOM Presets */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Profile & POM Linking Card */}
              <Card variant="glass" padding="md" className="border-white/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-display tracking-tight">Client Profile & Fit Linking</h2>
                      <p className="text-xs text-slate-400">Select patron and bind to 2D CAD anatomical measurements</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsQuickAddCustomerOpen(true)}
                    leftIcon={<UserPlus className="w-4 h-4 text-[#D4AF37]" />}
                  >
                    Quick Add Patron
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Select Patron Profile *</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="input-dark w-full text-sm font-medium cursor-pointer"
                    >
                      {activeCustomers.map((c: any) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} ({c.phone}) {c.isVip ? '★ VIP' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Delivery Date *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="input-dark text-sm w-full font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Selected Patron Intelligence Card */}
                {selectedCustomer && (
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-700 flex items-center justify-center font-bold text-slate-950 font-display">
                        {selectedCustomer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedCustomer.name}</span>
                          {selectedCustomer.isVip && <Badge variant="gold" size="sm">VIP Patron</Badge>}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{selectedCustomer.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center cursor-pointer select-none text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={isPomLinked}
                          onChange={(e) => setIsPomLinked(e.target.checked)}
                          className="mr-2 rounded border-slate-700 bg-slate-900 text-[#D4AF37] focus:ring-[#D4AF37]/30"
                        />
                        <span>Link 2D CAD Measurement Profile</span>
                      </label>
                      <Link href="/measurements">
                        <button className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold ml-2">
                          <Ruler className="w-3 h-3" /> CAD Workbench
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>

              {/* Garment Items & Dynamic BOM Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display tracking-tight">Commissions & Dynamic BOM</h2>
                    <p className="text-xs text-slate-400">12 garment presets with automatic trim and accessory calculations</p>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={handleAddItem}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Garment Item
                  </Button>
                </div>

                {items.map((item, index) => {
                  const preset = garmentOptions.find((g) => g.value === item.garmentType) || garmentOptions[0];
                  return (
                    <Card key={item.id} variant="glass" padding="md" className="border-white/10 space-y-5 relative">
                      {/* Item Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center font-bold text-xs font-mono">
                            {index + 1}
                          </div>
                          <h3 className="font-bold text-white text-base font-display">{item.garmentType}</h3>
                          {item.isCustomerFabric && (
                            <Badge variant="success" size="sm">Client Fabric: {item.fabricSku}</Badge>
                          )}
                        </div>

                        {items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove Garment Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Garment Selection & Dimensions */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Garment Preset *</label>
                          <select
                            value={item.garmentType}
                            onChange={(e) => handleGarmentTypeChange(item.id, e.target.value)}
                            className="input-dark text-xs py-2 px-3 w-full cursor-pointer font-medium"
                          >
                            {garmentOptions.map((g) => (
                              <option key={g.value} value={g.value} className="bg-slate-900 text-white">
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Fabric Required (Meters)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={item.fabricMeters}
                            onChange={(e) => handleUpdateItem(item.id, 'fabricMeters', parseFloat(e.target.value) || 0)}
                            className="input-dark text-xs py-2 px-3 w-full font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Item Price ({formatCurrency(0).slice(0, 1)})</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="input-dark text-xs py-2 px-3 w-full font-mono font-bold text-amber-300"
                          />
                        </div>
                      </div>

                      {/* Fabric SKU & Customer Fabric Allocation Toggle */}
                      <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="inline-flex items-center cursor-pointer select-none text-xs font-semibold text-slate-200">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isCustomerFabric)}
                              onChange={(e) => handleToggleCustomerFabric(item.id, e.target.checked)}
                              className="mr-2 rounded border-slate-700 bg-slate-900 text-[#D4AF37] focus:ring-[#D4AF37]/30"
                            />
                            <span className="text-amber-300 font-bold">Client Provided Their Own Fabric</span>
                          </label>

                          <span className="text-[11px] font-mono text-slate-400">
                            Bolt Spec: {preset.boltWidth || 44}" width ({preset.bufferNote || 'Standard allowance'})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-semibold">
                              Fabric SKU {item.isCustomerFabric ? '(Strictly CUST-FAB-)' : '(Atelier Catalog)'}
                            </label>
                            <input
                              type="text"
                              value={item.fabricSku}
                              onChange={(e) => handleUpdateItem(item.id, 'fabricSku', e.target.value)}
                              className="input-dark text-xs py-1.5 px-3 font-mono"
                              placeholder="CUST-FAB-..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-semibold">Fabric Material / Swatch Notes</label>
                            <input
                              type="text"
                              value={item.materialNotes || ''}
                              onChange={(e) => handleUpdateItem(item.id, 'materialNotes', e.target.value)}
                              placeholder="e.g., Italian Super 140s Wool, Banarasi Brocade..."
                              className="input-dark text-xs py-1.5 px-3"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Bill of Materials (BOM) Editor */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Scissors className="w-4 h-4 text-[#D4AF37]" />
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                              Dynamic Bill of Materials (Trims & Accessories)
                            </h4>
                          </div>
                          <button
                            onClick={() => handleAddBOMItem(item.id)}
                            className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Trim
                          </button>
                        </div>

                        <div className="space-y-2">
                          {item.bomItems?.map((bom) => (
                            <div
                              key={bom.id}
                              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={bom.name}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'name', e.target.value)}
                                    className="bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#D4AF37] outline-none text-xs text-white font-medium w-full max-w-xs"
                                  />
                                  {bom.isCustomerProvided && (
                                    <Badge variant="success" size="sm">Client Supplied</Badge>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 capitalize">
                                  Category: {bom.category} &bull; Standard unit cost: {formatCurrency(bom.unitCost)}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={bom.quantity}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="input-dark w-16 text-center text-xs py-1 px-1 font-mono"
                                  />
                                  <span className="text-slate-400 text-[10px]">{bom.unit}</span>
                                </div>

                                <label className="inline-flex items-center text-[10px] text-slate-400 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(bom.isCustomerProvided)}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'isCustomerProvided', e.target.checked)}
                                    className="mr-1 rounded border-slate-700 bg-slate-900 text-emerald-400"
                                  />
                                  <span>Client Given</span>
                                </label>

                                <button
                                  onClick={() => handleRemoveBOMItem(item.id, bom.id)}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dynamic Atelier Pricing & Commission Summary */}
            <div className="space-y-6">
              {/* Financial Quotation Summary Card */}
              <Card variant="gold" padding="md" className="space-y-5 sticky top-24">
                <div className="pb-3 border-b border-[#D4AF37]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-bold text-base text-white font-display">Bespoke Quotation</h3>
                  </div>
                  <Badge variant="gold" size="sm">Draft</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Commission Items</span>
                    <span className="font-mono font-bold text-white">{totalItemsCount} items</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Estimated Artisan SAM</span>
                    <span className="font-mono font-bold text-amber-300">{totalCalculatedSamMinutes} mins</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Base Tailoring Labor</span>
                    <span className="font-mono font-semibold text-slate-200">{formatCurrency(totalLaborCost)}</span>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Order Value</span>
                    <span className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                      {formatCurrency(totalOrderAmount)}
                    </span>
                  </div>

                  {/* Advance Payment Input */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 mt-2">
                    <label className="text-[11px] font-semibold text-slate-300 flex justify-between">
                      <span>Advance Amount Received</span>
                      <span className="text-slate-400 font-mono">Suggested: 50%</span>
                    </label>
                    <input
                      type="number"
                      placeholder={String(advanceAmount)}
                      value={advanceAmountInput}
                      onChange={(e) => setAdvanceAmountInput(e.target.value)}
                      className="input-dark text-sm py-2 px-3 font-mono font-bold text-emerald-400"
                    />
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>Balance Due on Fitting:</span>
                      <span className="text-slate-200">
                        {formatCurrency(Math.max(0, totalOrderAmount - (Number(advanceAmountInput) || 0)))}
                      </span>
                    </div>
                  </div>

                  {/* Commission Special Notes */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Special Instructions & Fittings</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter styling nuances, specific pocket requests, trial scheduling..."
                      className="input-dark text-xs py-2 px-3 resize-none"
                    />
                  </div>
                </div>

                {/* Submission Buttons */}
                <div className="space-y-2.5 pt-3 border-t border-[#D4AF37]/20">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={() => handleSaveOrder('CONFIRMED')}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Confirm & Send WhatsApp Quote
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => handleSaveOrder('DRAFT')}
                    leftIcon={<Save className="w-4 h-4 text-slate-400" />}
                  >
                    Save as Draft Commission
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDER INSPECTION SLIDE-OVER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in print:hidden">
          <Card variant="glass" padding="none" className="border-white/10 max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedOrder.id}</h2>
                    {renderStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Commissioned on {selectedOrder.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client & Schedule Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Patron Details</span>
                <p className="text-white font-bold text-sm">{selectedOrder.clientName}</p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedOrder.clientPhone}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Target Fitting Due</span>
                <p className="text-amber-300 font-mono font-bold flex items-center space-x-1.5 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{selectedOrder.dueDate}</span>
                </p>
                <p className="text-slate-500 text-[10px]">Atelier Production Slot</p>
              </div>
            </div>

            {/* Fitting Trial Stage Transition Actions */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-purple-400" />
                  <span>Fitting Trial Stage Transitions</span>
                </span>
                <Badge variant="neutral" size="sm">{selectedOrder.status}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.status === 'IN_PRODUCTION' && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleOrderStatusChange(selectedOrder.id, 'TRIAL_FITTING')}
                  >
                    Advance to First Fitting Trial
                  </Button>
                )}

                {selectedOrder.status === 'TRIAL_FITTING' && (
                  <>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleOrderStatusChange(selectedOrder.id, 'QC_CHECK')}
                    >
                      Alterations Required (Second Trial)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOrderStatusChange(selectedOrder.id, 'READY_FOR_DELIVERY')}
                    >
                      Approve & Mark Ready for Delivery
                    </Button>
                  </>
                )}

                {selectedOrder.status === 'QC_CHECK' && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleOrderStatusChange(selectedOrder.id, 'READY_FOR_DELIVERY')}
                  >
                    Pass QC & Mark Ready for Delivery
                  </Button>
                )}

                {selectedOrder.status === 'READY_FOR_DELIVERY' && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleOrderStatusChange(selectedOrder.id, 'DELIVERED')}
                  >
                    Complete Handover (Final Delivery)
                  </Button>
                )}
              </div>
            </div>

            {/* Garments Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Commissions Summary</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-200 font-semibold">{selectedOrder.garmentSummary}</span>
                <Badge variant="neutral" size="sm">{selectedOrder.itemCount} Items</Badge>
              </div>
              <div className="border-t border-white/5 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400 text-xs">Total Amount:</span>
                <span className="font-mono font-extrabold text-white text-base">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#D4AF37] pt-1">
                <span>50% Advance Received:</span>
                <span className="font-mono font-bold">{formatCurrency(selectedOrder.totalAmount * 0.5)}</span>
              </div>
            </div>

            {/* BOM Materials List in Inspection Drawer */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Required Materials & Trims (BOM)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedOrder.items?.reduce((acc, it) => acc + (it.bomItems?.length || 0), 0) || 0} items
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {selectedOrder.items && selectedOrder.items.some(it => it.bomItems && it.bomItems.length > 0) ? (
                  selectedOrder.items.map((it) => (
                    <div key={it.id} className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300 border-b border-white/5 pb-0.5 flex items-center justify-between">
                        <span>{it.garmentType}</span>
                        <span className={`text-[9px] font-mono font-semibold ${it.isCustomerFabric ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {it.isCustomerFabric ? '✓ Client Fabric: ' : 'SKU: '}{it.fabricSku}
                        </span>
                      </div>
                      {it.bomItems?.map((bom) => (
                        <div key={bom.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                          <div className="flex items-center space-x-1.5 truncate max-w-[220px]">
                            {bom.isCustomerProvided && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                                CLIENT GIVEN
                              </span>
                            )}
                            <span className="text-slate-300 truncate">{bom.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="font-mono text-slate-400 text-[10px]">{bom.quantity} {bom.unit}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${bom.isOptional ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {bom.isOptional ? 'Optional' : 'Required'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-xs text-slate-500">
                    Standard materials (threads, canvas, zipper) provisioned on cutting allocation.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  const o = selectedOrder;
                  setSelectedOrder(null);
                  setPrintModalOrder(o);
                }}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Delivery Note & Job Tag
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    showNotification(`WhatsApp quotation shared for ${selectedOrder.id}`);
                    setSelectedOrder(null);
                  }}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />}
                >
                  Resend WhatsApp
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:hidden">
          <Card variant="glass" padding="md" className="border-rose-500/30 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Delete Order {deleteModalOrder.id}
            </h3>
            <p className="text-xs text-slate-300">Are you sure you want to delete this order? This action logs the deletion and cannot be undone.</p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Reason for deletion (Required)</label>
              <textarea 
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="input-dark text-xs w-full"
                rows={3}
                placeholder="e.g. Client cancelled commission, duplicate booking..."
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalOrder(null)}>Cancel</Button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={!deleteReason.trim()}
                className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-4 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30"
              >
                Confirm Delete
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Printable Delivery Note & Karigar Job Tag Modal with Strict @media print Isolation */}
      {printModalOrder && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print-section, .print-section * { visibility: visible !important; }
              .print-section {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 24px !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
              }
            }
          `}</style>
          <div className="print-section rounded-3xl border border-[#D4AF37]/30 max-w-2xl w-full p-8 shadow-2xl relative bg-slate-900/95 text-slate-100 print:!border-none print:!shadow-none print:!text-black print:!bg-white">
            <button
              onClick={() => setPrintModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/80 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Printable Header with Vector QR & Code 128 Barcode */}
            <div className="flex justify-between items-start border-b border-white/10 print:border-black pb-6 mb-6">
              <div>
                <h1 className="text-3xl font-black text-[#D4AF37] print:text-black tracking-tight font-display mb-1">
                  YELLOWHOUSE
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest font-semibold">
                  Delivery Note & Karigar Job Tag
                </p>
              </div>
              <div className="flex items-center gap-3">
                <QRCodeSVG value={`https://yellowhouse.atelier/track/${printModalOrder.id}`} size={56} />
                <BarcodeSVG value={printModalOrder.id} width={130} height={36} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-bold mb-1">Patron Details</h4>
                <p className="font-bold text-white print:text-black text-base">{printModalOrder.clientName}</p>
                <p className="text-xs text-slate-400 print:text-gray-600 font-mono">{printModalOrder.clientPhone}</p>
              </div>
              <div className="text-right">
                <h4 className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-bold mb-1">Commission Details</h4>
                <p className="font-mono font-bold text-white print:text-black text-base">{printModalOrder.id}</p>
                <p className="text-xs text-slate-400 print:text-gray-600">Target Delivery: {printModalOrder.dueDate}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-xs text-slate-400 print:text-gray-500 uppercase font-bold border-b border-white/10 print:border-black pb-2">
                Order Items & Material BOM Presets
              </h4>
              {printModalOrder.items?.map((item, idx) => (
                <div key={item.id} className="border-b border-white/5 print:border-gray-300 pb-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-100 print:text-black">{idx + 1}. {item.garmentType}</p>
                      <p className="text-xs text-slate-400 print:text-gray-600 font-mono">
                        {item.isCustomerFabric ? '✓ Client Provided Fabric: ' : 'Fabric SKU: '}{item.fabricSku} ({item.fabricMeters}m)
                      </p>
                      {item.materialNotes && <p className="text-xs text-slate-400 print:text-gray-600 italic mt-0.5">Note: {item.materialNotes}</p>}
                    </div>
                  </div>
                  {item.bomItems && item.bomItems.length > 0 && (
                    <div className="bg-slate-950/60 print:bg-gray-100 p-2.5 rounded-xl text-[11px] print:text-[10px] space-y-1">
                      <div className="font-semibold text-amber-300 print:text-gray-700 uppercase tracking-wider text-[9px]">
                        Bill of Materials (BOM) Allocated:
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-300 print:text-black">
                        {item.bomItems.map(b => (
                          <div key={b.id} className="flex items-center justify-between pr-2">
                            <span>• {b.name} {b.isCustomerProvided ? '(Client Given)' : ''}</span>
                            <span className="font-mono text-slate-400 print:text-gray-600">{b.quantity} {b.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-xs text-slate-400 print:text-gray-600">
              <p>Thank you for choosing YellowHouse Atelier Bespoke Couture.</p>
              <p className="mt-6 border-t border-white/10 print:border-black pt-4 w-1/2 mx-auto text-slate-300 print:text-black">
                Authorized Artisan / Client Signature
              </p>
            </div>

            <div className="mt-8 flex justify-center print:hidden">
              <Button
                variant="gold"
                size="md"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Delivery Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOMER MODAL */}
      {isQuickAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card variant="glass" padding="md" className="max-w-lg w-full rounded-3xl border border-[#D4AF37]/35 p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Add New Client Profile</h3>
                  <p className="text-xs text-slate-400">Instantly create client and attach to current order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuickAddCustomerOpen(false);
                  setQuickCustomerError('');
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickCustomerError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{quickCustomerError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Client Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Deepika Padukone"
                  value={newQuickCustomer.name}
                  onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, name: e.target.value })}
                  className="input-dark text-xs py-2 px-3 w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newQuickCustomer.phone}
                    onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, phone: e.target.value })}
                    className="input-dark text-xs py-2 px-3 w-full font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@atelier.com"
                    value={newQuickCustomer.email}
                    onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, email: e.target.value })}
                    className="input-dark text-xs py-2 px-3 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Gender / Department</label>
                  <select
                    value={newQuickCustomer.gender}
                    onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, gender: e.target.value as any })}
                    className="input-dark text-xs py-2 px-3 w-full"
                  >
                    <option value="Men" className="bg-slate-900 text-white">Men (Bespoke Suit/Sherwani)</option>
                    <option value="Women" className="bg-slate-900 text-white">Women (Couture/Blouse/Lehenga)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fit Preference</label>
                  <select
                    value={newQuickCustomer.preferredFit}
                    onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, preferredFit: e.target.value })}
                    className="input-dark text-xs py-2 px-3 w-full"
                  >
                    <option value="Slim Bespoke" className="bg-slate-900 text-white">Slim Bespoke</option>
                    <option value="Regular Tailored" className="bg-slate-900 text-white">Regular Tailored</option>
                    <option value="Relaxed Royal" className="bg-slate-900 text-white">Relaxed Royal</option>
                    <option value="Comfort Traditional" className="bg-slate-900 text-white">Comfort Traditional</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="quickIsVip"
                  checked={newQuickCustomer.isVip}
                  onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, isVip: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer"
                />
                <label htmlFor="quickIsVip" className="text-xs font-semibold text-amber-300 cursor-pointer flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Mark as VIP Atelier Patron</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Special Fitting Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Shoulder slope, preferred fabric feel, styling requests..."
                  value={newQuickCustomer.notes}
                  onChange={(e) => setNewQuickCustomer({ ...newQuickCustomer, notes: e.target.value })}
                  className="input-dark text-xs py-2 px-3 w-full resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsQuickAddCustomerOpen(false);
                    setQuickCustomerError('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  type="submit"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add & Select Client
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
