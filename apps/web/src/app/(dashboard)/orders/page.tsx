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
  UserPlus
} from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { syncOrderToJobsStorage, logActivity, calculatePaymentStatus, calculateBalance } from '@/lib/state-sync-utils';
import { useToast } from '@/components/toast-context';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { OrderReceipt } from '@/components/print-layouts';
import { calculateBespokePricing } from '@/lib/pricing-calculator';
import { calculateFabricYield } from '@/lib/fabric-yield';
import { GarmentCategory } from '@/types/measurement';
import { Tooltip } from '@/components/Tooltip';
import { useCurrency } from '@/components/currency-context';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'CUTTING'
  | 'IN_PRODUCTION'
  | 'TRIAL_FITTING'
  | 'QC_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface BOMItem {
  id: string;
  name: string;
  category: 'thread' | 'zipper' | 'button' | 'lining' | 'canvas' | 'lace' | 'hook' | 'piping' | 'other';
  quantity: number;
  unit: string;
  unitCost: number;
  isOptional?: boolean;
}

export interface OrderItemRow {
  id: string;
  garmentType: string;
  fabricSku: string;
  fabricMeters: number;
  unitPrice: number;
  fabricImage?: string;
  liningImage?: string;
  materialNotes?: string;
  bomItems?: BOMItem[];
}

export interface Order {
  id: string;
  customerId?: string;
  clientName: string;
  clientPhone: string;
  garmentSummary: string;
  itemCount: number;
  status: OrderStatus;
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus?: 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
  dueDate: string;
  rawDueDate?: string;
  createdAt: string;
  isUrgent?: boolean;
  items?: OrderItemRow[];
  notes?: string;
}

export interface OrderFormDraft {
  selectedClientId: string;
  dueDate: string;
  notes: string;
  advanceAmount?: number;
  items: OrderItemRow[];
  updatedAt: string;
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
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      unitPrice: 28000
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

  // Helper: Default BOM generation based on garment type
  const getDefaultBOMForGarment = (garmentType: string): BOMItem[] => {
    const g = garmentType.toLowerCase();
    const items: BOMItem[] = [
      {
        id: `bom-${Date.now()}-1`,
        name: 'Matching Spun Poly / Silk Thread Spools',
        category: 'thread',
        quantity: 2,
        unit: 'spools',
        unitCost: 60,
        isOptional: false
      }
    ];

    if (g.includes('trouser') || g.includes('suit') || g.includes('churidar')) {
      items.push({
        id: `bom-${Date.now()}-2`,
        name: 'YKK Concealed Metal Trouser Zipper (7 inch)',
        category: 'zipper',
        quantity: 1,
        unit: 'pcs',
        unitCost: 45,
        isOptional: false
      });
      items.push({
        id: `bom-${Date.now()}-3`,
        name: 'Waistband Canvas Stiffener (Interlining)',
        category: 'canvas',
        quantity: 1.2,
        unit: 'meters',
        unitCost: 120,
        isOptional: true
      });
      items.push({
        id: `bom-${Date.now()}-4`,
        name: 'Horn / Resin Jacket Buttons (Set of 6)',
        category: 'button',
        quantity: 1,
        unit: 'set',
        unitCost: 250,
        isOptional: true
      });
    } else if (g.includes('blouse') || g.includes('corset') || g.includes('choli')) {
      items.push({
        id: `bom-${Date.now()}-2`,
        name: 'Heavy Duty Side Invisible Zipper (12 inch)',
        category: 'zipper',
        quantity: 1,
        unit: 'pcs',
        unitCost: 55,
        isOptional: false
      });
      items.push({
        id: `bom-${Date.now()}-3`,
        name: 'Back Eyelet / Braided Dori Hooks & Loops',
        category: 'hook',
        quantity: 8,
        unit: 'pairs',
        unitCost: 15,
        isOptional: true
      });
      items.push({
        id: `bom-${Date.now()}-4`,
        name: 'Padded Cup Inserts & Boning Strips',
        category: 'canvas',
        quantity: 1,
        unit: 'pair',
        unitCost: 180,
        isOptional: true
      });
    } else if (g.includes('sherwani') || g.includes('bandhgala') || g.includes('kurta')) {
      items.push({
        id: `bom-${Date.now()}-2`,
        name: 'Gold Plated / Antique Metal Kurta Buttons',
        category: 'button',
        quantity: 7,
        unit: 'pcs',
        unitCost: 80,
        isOptional: false
      });
      items.push({
        id: `bom-${Date.now()}-3`,
        name: 'Horsehair Canvas Chest Piece Reinforcement',
        category: 'canvas',
        quantity: 1.5,
        unit: 'meters',
        unitCost: 350,
        isOptional: true
      });
      items.push({
        id: `bom-${Date.now()}-4`,
        name: 'Gold Zari Border Piping Trim',
        category: 'piping',
        quantity: 3.5,
        unit: 'meters',
        unitCost: 90,
        isOptional: true
      });
    } else if (g.includes('lehenga') || g.includes('gown') || g.includes('anarkali')) {
      items.push({
        id: `bom-${Date.now()}-2`,
        name: 'Cancan Mesh Netting for Flare Volume',
        category: 'canvas',
        quantity: 4.0,
        unit: 'meters',
        unitCost: 110,
        isOptional: true
      });
      items.push({
        id: `bom-${Date.now()}-3`,
        name: 'Heavy Zari Waistband Latkan Tassels',
        category: 'lace',
        quantity: 2,
        unit: 'pcs',
        unitCost: 220,
        isOptional: true
      });
      items.push({
        id: `bom-${Date.now()}-4`,
        name: 'Concealed Side Zipper (18 inch)',
        category: 'zipper',
        quantity: 1,
        unit: 'pcs',
        unitCost: 65,
        isOptional: false
      });
    }

    return items;
  };

  // Add BOM Item to an Order Item Row
  const handleAddBOMItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentBOM = item.bomItems || getDefaultBOMForGarment(item.garmentType);
          const newBOMItem: BOMItem = {
            id: `bom-${Date.now()}-${currentBOM.length + 1}`,
            name: 'New Accessory / Trim',
            category: 'thread',
            quantity: 1,
            unit: 'pcs',
            unitCost: 50,
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

  const getValidNextStatuses = (current: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CONFIRMED', 'CUTTING', 'CANCELLED'],
      CUTTING: ['CUTTING', 'IN_PRODUCTION', 'CANCELLED'],
      IN_PRODUCTION: ['IN_PRODUCTION', 'TRIAL_FITTING', 'CANCELLED'],
      TRIAL_FITTING: ['TRIAL_FITTING', 'READY_FOR_DELIVERY', 'QC_CHECK', 'CANCELLED'],
      QC_CHECK: ['QC_CHECK', 'READY_FOR_DELIVERY', 'CANCELLED'],
      READY_FOR_DELIVERY: ['READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      DELIVERED: ['DELIVERED', 'CANCELLED'],
      CANCELLED: ['CANCELLED']
    };
    return transitions[current] || ['CANCELLED'];
  };

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

  const handleFileUpload = (id: string, field: 'fabricImage' | 'liningImage', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      handleUpdateItem(id, field, base64);
    };
    reader.readAsDataURL(file);
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
      showNotification(`Order ${orderId} status changed to ${newStatus}`);
    }
  };

  // Create Order Handler
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
            notes
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
        notes
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
        unitPrice: 28000
      }
    ]);

    if (status === 'CONFIRMED') {
      showNotification(`Quotation sent via WhatsApp to ${selectedCustomer.name}! Order ${finalOrderId} ${isNew ? 'created' : 'updated'}.`);
    } else {
      showNotification(`Order ${finalOrderId} ${isNew ? 'saved as Draft' : 'updated'}.`, 'info');
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-gold-500/15 border-gold-500/40 text-gold-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
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
          <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400 shadow-md">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Management</h1>
              <span className="badge badge-gold flex items-center space-x-1">
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
            <Tooltip content="Launch new bespoke order draft workspace">
              <button
                onClick={() => setActiveTab('create')}
                className="btn-gold flex items-center space-x-2 cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Order</span>
              </button>
            </Tooltip>
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
            <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider">In Production</span>
            <Scissors className="w-4 h-4 text-gold-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-gold-300">
              {orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'CUTTING').length}
            </span>
            <span className="text-[11px] text-gold-400/80">Cutting & Stitching</span>
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
              ? 'border-gold-500 text-gold-400'
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
              ? 'border-gold-500 text-gold-400'
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
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl hidden md:block">
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
                          <span className="font-mono font-bold text-gold-400 text-sm group-hover:underline">
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
                          <div className="font-semibold text-white group-hover:text-gold-300 transition-colors">
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
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-900 border border-slate-700 hover:border-gold-500/60 rounded-lg text-xs py-1 px-2 text-slate-200 font-bold cursor-pointer focus:outline-none focus:border-gold-500"
                        >
                          <option value={order.status} className="bg-slate-900 text-slate-300">{order.status}</option>
                          {getValidNextStatuses(order.status).map(s => {
                            if (s !== order.status) {
                              return <option key={s} value={s} className="bg-slate-900">{s}</option>;
                            }
                            return null;
                          })}
                        </select>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-semibold text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        {order.paymentStatus === 'FULLY_PAID' && <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] mt-1">FULLY PAID</span>}
                        {order.paymentStatus === 'ADVANCE_PAID' && <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] mt-1">ADVANCE PAID</span>}
                        {(!order.paymentStatus || order.paymentStatus === 'UNPAID') && <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] mt-1">UNPAID</span>}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                          <span>{order.dueDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          {(order.status === 'READY_FOR_DELIVERY' || order.status === 'DELIVERED') && (
                            <Tooltip content="Print Delivery Note">
                              <button
                                onClick={() => setPrintModalOrder(order)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip content="Inspect item breakdown and status">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit Order">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Resend WhatsApp quotation message">
                            <button
                              onClick={() => {
                                showNotification(`Quotation resent for ${order.id} via WhatsApp`);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gold-500/10 text-slate-400 hover:text-gold-400 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete Order">
                            <button
                              onClick={() => setDeleteModalOrder(order)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
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

          {/* Mobile Orders View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card rounded-2xl border border-slate-800 p-4 space-y-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                {/* Top row: Client name (bold) + Status badge (colored) */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-base">
                      {order.clientName}
                      {order.isUrgent && <span className="ml-2 badge badge-rose text-[9px] px-1.5 py-0.2">URGENT</span>}
                    </div>
                    <div className="text-xs text-gold-400 font-mono mt-0.5">{order.id}</div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-900 border border-slate-700 hover:border-gold-500/60 rounded-lg text-[10px] py-1 px-2 text-slate-200 font-bold cursor-pointer focus:outline-none focus:border-gold-500"
                    >
                      <option value={order.status} className="bg-slate-900 text-slate-300">{order.status}</option>
                      {getValidNextStatuses(order.status).map(s => {
                        if (s !== order.status) {
                          return <option key={s} value={s} className="bg-slate-900">{s}</option>;
                        }
                        return null;
                      })}
                    </select>
                  </div>
                </div>

                {/* Middle: Garment summary, Due date */}
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                  <div className="text-xs text-slate-300 font-medium">
                    {order.garmentSummary} <span className="text-slate-500 font-mono">({order.itemCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{order.dueDate}</span>
                  </div>
                </div>

                {/* Bottom row: Total amount (formatted) + Action buttons */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                  <div className="font-mono font-bold text-white text-base">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    {(order.status === 'READY_FOR_DELIVERY' || order.status === 'DELIVERED') && (
                      <button
                        onClick={() => setPrintModalOrder(order)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors border border-slate-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors border border-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        showNotification(`Quotation resent for ${order.id} via WhatsApp`);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-gold-500/10 text-slate-400 hover:text-gold-400 transition-colors border border-slate-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteModalOrder(order)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="glass-card rounded-2xl border border-slate-800 p-8 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 text-sm font-semibold">No orders match your filter</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="btn-ghost text-xs py-1.5 px-3 mt-2"
                >
                  Clear Filters
                </button>
              </div>
            )}
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
                  <User className="w-5 h-5 text-gold-400" />
                  <h2 className="text-base font-bold text-white">1. Select Client Profile</h2>
                </div>
                {selectedCustomer.isVip && (
                  <span className="badge badge-gold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-gold-400 fill-gold-400" />
                    <span>VIP Client</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Client Name *</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddCustomerOpen(true)}
                      className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add New Client</span>
                    </button>
                  </div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="input-dark cursor-pointer text-sm font-medium"
                  >
                    {activeCustomers.map((c: any) => (
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
                  <Scissors className="w-5 h-5 text-gold-400" />
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
                      <span className="text-xs font-bold text-gold-400 flex items-center space-x-1.5">
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
                        <label className="text-[11px] font-semibold text-gold-400 flex items-center justify-between">
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
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gold-400/80 font-mono">meters</span>
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

                    {/* FABRIC SWATCH & MATERIAL ATTACHMENTS SECTION */}
                    <div className="border-t border-slate-800/60 pt-3 mt-3 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fabric & Lining Attachments</span>
                        <div className="flex items-center space-x-2">
                          <label className="btn-ghost py-1 px-2.5 text-[10px] flex items-center space-x-1 cursor-pointer">
                            <span>+ Fabric Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(item.id, 'fabricImage', e.target.files[0]);
                                  showNotification("Uploaded custom fabric swatch successfully!");
                                }
                              }}
                            />
                          </label>
                          <label className="btn-ghost py-1 px-2.5 text-[10px] flex items-center space-x-1 cursor-pointer">
                            <span>+ Lining Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(item.id, 'liningImage', e.target.files[0]);
                                  showNotification("Uploaded custom lining photo successfully!");
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Selected Fabric Preset / Thumbnail */}
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Fabric Swatch Preview</span>
                          <div className="flex items-center space-x-3">
                            {item.fabricImage ? (
                              <div className="relative w-12 h-12 rounded bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                                <img src={item.fabricImage} alt="Fabric Swatch" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, 'fabricImage', '')}
                                  className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl hover:bg-black/90"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                                <Shirt className="w-5 h-5 opacity-30" />
                              </div>
                            )}
                            <div className="flex-1 space-y-1">
                              <select
                                onChange={(e) => handleUpdateItem(item.id, 'fabricImage', e.target.value)}
                                value={item.fabricImage || ''}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-300 w-full focus:outline-none focus:border-gold-500/50"
                              >
                                <option value="">Choose Swatch Preset</option>
                                <option value="https://images.unsplash.com/photo-1590736969955-71cb94801759?w=150">Crimson Silk Velvet</option>
                                <option value="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=150">Emerald Green Velvet</option>
                                <option value="https://images.unsplash.com/photo-1544816155-12df9643f363?w=150">Royal Blue Brocade</option>
                                <option value="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=150">Ivory Gold Jacquard</option>
                              </select>
                              <p className="text-[8px] text-slate-500">Pick preset or click "+ Fabric Photo"</p>
                            </div>
                          </div>
                        </div>

                        {/* Selected Lining / Accessories Swatch */}
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Lining / Accs Preview</span>
                          <div className="flex items-center space-x-3">
                            {item.liningImage ? (
                              <div className="relative w-12 h-12 rounded bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                                <img src={item.liningImage} alt="Lining Swatch" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, 'liningImage', '')}
                                  className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl hover:bg-black/90"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                                <Tag className="w-5 h-5 opacity-30" />
                              </div>
                            )}
                            <div className="flex-1 space-y-1">
                              <select
                                onChange={(e) => handleUpdateItem(item.id, 'liningImage', e.target.value)}
                                value={item.liningImage || ''}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-300 w-full focus:outline-none focus:border-gold-500/50"
                              >
                                <option value="">Choose Lining Preset</option>
                                <option value="https://images.unsplash.com/photo-1544816155-12df9643f363?w=150">Gold Zari Threads</option>
                                <option value="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=150">Satin Silk Lining</option>
                                <option value="https://images.unsplash.com/photo-1590736969955-71cb94801759?w=150">Premium Brass Buttons</option>
                              </select>
                              <p className="text-[8px] text-slate-500">Pick preset or click "+ Lining Photo"</p>
                            </div>
                          </div>
                        </div>

                        {/* Materials Notes details input */}
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1 flex flex-col justify-between">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Trim & Material Specs</label>
                          <textarea
                            placeholder="Specify buttons, zipper, laces, canvas collar reinforcement specs..."
                            value={item.materialNotes || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'materialNotes', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-200 placeholder-slate-600 w-full h-11 focus:outline-none focus:border-gold-500/50 resize-none"
                          />
                        </div>
                      </div>

                      {/* BILL OF MATERIALS (BOM) & TRIMS SECTION */}
                      <div className="bg-slate-950/80 rounded-xl border border-slate-800/90 p-3.5 mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Scissors className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Bill of Materials (BOM) & Trims</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono font-semibold">
                              {(item.bomItems || getDefaultBOMForGarment(item.garmentType)).length} Items Required
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddBOMItem(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center space-x-1 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Material</span>
                          </button>
                        </div>

                        {/* BOM Items Table / List */}
                        <div className="space-y-2">
                          {(item.bomItems || getDefaultBOMForGarment(item.garmentType)).map((bom) => (
                            <div
                              key={bom.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={!bom.isOptional}
                                  onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'isOptional', !e.target.checked)}
                                  className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer shrink-0"
                                  title="Check if mandatory for production, uncheck if optional"
                                />
                                <input
                                  type="text"
                                  value={bom.name}
                                  onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'name', e.target.value)}
                                  placeholder="Material / Trim description"
                                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 flex-1"
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <select
                                  value={bom.category}
                                  onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'category', e.target.value as any)}
                                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                                >
                                  <option value="thread">Thread</option>
                                  <option value="zipper">Zipper</option>
                                  <option value="button">Buttons</option>
                                  <option value="lining">Lining</option>
                                  <option value="canvas">Canvas / Interlining</option>
                                  <option value="lace">Lace / Latkan</option>
                                  <option value="hook">Hooks</option>
                                  <option value="piping">Piping</option>
                                  <option value="other">Other Trim</option>
                                </select>

                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0.1"
                                    value={bom.quantity}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-right text-slate-200 w-12 font-mono"
                                  />
                                  <input
                                    type="text"
                                    value={bom.unit}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'unit', e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-400 w-14 text-center font-mono"
                                    placeholder="unit"
                                  />
                                </div>

                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-500 font-mono">₹</span>
                                  <input
                                    type="number"
                                    value={bom.unitCost}
                                    onChange={(e) => handleUpdateBOMItem(item.id, bom.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-right text-amber-300 w-14 font-mono font-semibold"
                                  />
                                </div>

                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${bom.isOptional ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                  {bom.isOptional ? 'Optional' : 'Required'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveBOMItem(item.id, bom.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
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

          {/* Right Column: Order Summary Card (Upgraded to glass-card-gold) */}
          <div className="space-y-6">
            <div className="glass-card-gold rounded-2xl p-6 border border-gold-500/30 space-y-6 sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-gold-500/30">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-gold-400" />
                  <h3 className="text-lg font-bold text-white">Order Pricing Engine</h3>
                </div>
                <span className="badge badge-gold font-mono">LIVE QUOTE</span>
              </div>

              {/* Client Info Brief */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Client Profile</div>
                <div className="font-bold text-white text-sm">{selectedCustomer.name}</div>
                <div className="text-slate-400 font-mono">{selectedCustomer.phone}</div>
              </div>

              {/* Breakdown with Tooltips */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Items</span>
                  <span className="font-mono font-bold text-white">{totalItemsCount} {totalItemsCount === 1 ? 'garment' : 'garments'}</span>
                </div>

                <Tooltip content="Estimated fabric yield based on garment category and 44 bolt width">
                  <div className="flex items-center justify-between text-slate-300 w-full">
                    <span>Fabric Required</span>
                    <span className="font-mono text-gold-400 font-semibold">
                      {items.reduce((acc, curr) => acc + (curr.fabricMeters || 0), 0).toFixed(1)} meters
                    </span>
                  </div>
                </Tooltip>

                <Tooltip content="Standard Allowed Minutes (SAM) calculated for workshop labor allocation">
                  <div className="flex items-center justify-between text-slate-300 w-full">
                    <span>Estimated SAM</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {totalCalculatedSamMinutes} mins ({Number((totalCalculatedSamMinutes / 60).toFixed(1))} hrs)
                    </span>
                  </div>
                </Tooltip>

                <Tooltip content="Base labor surcharge rated at ₹42/minute for master tailors">
                  <div className="flex items-center justify-between text-slate-300 w-full">
                    <span>Tailoring Labor (₹42/min)</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {formatCurrency(totalLaborCost)}
                    </span>
                  </div>
                </Tooltip>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-200">Total Order Amount</span>
                  <span className="font-mono text-lg font-extrabold text-white">
                    {formatCurrency(totalOrderAmount)}
                  </span>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Advance/Deposit (₹)</label>
                    <input
                      type="number"
                      value={advanceAmountInput}
                      onChange={(e) => setAdvanceAmountInput(e.target.value)}
                      placeholder="e.g. 10000"
                      className="input-dark w-full font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Balance Due on Fitting</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {formatCurrency(calculateBalance(totalOrderAmount, Number(advanceAmountInput) || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Send Quotation via WhatsApp & Save as Draft */}
              <div className="space-y-3 pt-2">
                <Tooltip content="Generate WhatsApp payment link with 50% advance requirement">
                  <button
                    type="button"
                    onClick={() => handleSaveOrder('CONFIRMED')}
                    className="btn-gold w-full flex items-center justify-center space-x-2 py-3 cursor-pointer text-sm font-bold shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{editingOrderId ? 'Update & Send Quotation' : 'Send Quotation via WhatsApp'}</span>
                  </button>
                </Tooltip>

                <Tooltip content="Save current draft locally to resume editing later">
                  <button
                    type="button"
                    onClick={() => handleSaveOrder('DRAFT')}
                    className="btn-ghost w-full flex items-center justify-center space-x-2 py-2.5 cursor-pointer text-sm"
                  >
                    <Save className="w-4 h-4 text-slate-400" />
                    <span>{editingOrderId ? 'Update Order' : 'Save as Draft'}</span>
                  </button>
                </Tooltip>
                
                {editingOrderId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrderId(null);
                      setActiveTab('active');
                    }}
                    className="btn-ghost w-full flex items-center justify-center space-x-2 py-2 cursor-pointer text-sm text-slate-400"
                  >
                    Cancel Edit
                  </button>
                )}
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
          <div className="glass-card-gold rounded-2xl border border-gold-500/30 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedOrder.id}</h3>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        const newStat = e.target.value as OrderStatus;
                        handleOrderStatusChange(selectedOrder.id, newStat);
                        setSelectedOrder({ ...selectedOrder, status: newStat });
                      }}
                      className="bg-slate-900 border border-gold-500/40 rounded-lg text-xs py-1 px-2 text-gold-400 font-bold cursor-pointer focus:outline-none focus:border-gold-500"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CUTTING">CUTTING</option>
                      <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                      <option value="TRIAL_FITTING">TRIAL_FITTING</option>
                      <option value="QC_CHECK">QC_CHECK</option>
                      <option value="READY_FOR_DELIVERY">READY_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
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
                <p className="text-gold-400 font-mono font-bold flex items-center space-x-1">
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
              <div className="flex items-center justify-between text-xs text-gold-400/90 pt-1">
                <span>50% Advance Received:</span>
                <span className="font-mono font-bold">{formatCurrency(selectedOrder.totalAmount * 0.5)}</span>
              </div>
            </div>

            {/* Bill of Materials (BOM) Summary in Inspection Drawer */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Required Materials & Trims (BOM)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedOrder.items?.reduce((acc, it) => acc + (it.bomItems?.length || 0), 0) || 0} items
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.some(it => it.bomItems && it.bomItems.length > 0) ? (
                  selectedOrder.items.map((it) => (
                    <div key={it.id} className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300 border-b border-slate-800/60 pb-0.5">
                        {it.garmentType} ({it.fabricSku})
                      </div>
                      {it.bomItems?.map((bom) => (
                        <div key={bom.id} className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-slate-900/60 border border-slate-800/50">
                          <span className="text-slate-300 truncate max-w-[200px]">{bom.name}</span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="font-mono text-slate-400 text-[10px]">{bom.quantity} {bom.unit}</span>
                            <span className={`text-[9px] px-1.5 rounded font-bold uppercase ${bom.isOptional ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {bom.isOptional ? 'Optional' : 'Required'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-xs text-slate-500">
                    Standard materials (threads, canvas, zipper) provisioned on cutting allocation.
                  </div>
                )}
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

      {/* Delete Confirmation Modal */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:hidden">
          <div className="glass-card rounded-2xl border border-rose-500/30 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Delete Order {deleteModalOrder.id}
            </h3>
            <p className="text-sm text-slate-300">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Reason for deletion (Required)</label>
              <textarea 
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="input-dark text-sm w-full"
                rows={3}
                placeholder="e.g. Client cancelled, duplicate entry..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setDeleteModalOrder(null)} className="btn-ghost text-xs">Cancel</button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={!deleteReason.trim()}
                className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Delivery Note Modal */}
      {printModalOrder && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md overflow-y-auto">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .print-section, .print-section * { visibility: visible; }
              .print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; border: none; box-shadow: none; background: white; color: black; }
            }
          `}</style>
          <div className="print-section glass-card-gold rounded-2xl border border-gold-500/30 max-w-2xl w-full p-8 shadow-2xl relative print:!border-none print:!shadow-none print:!text-black print:!bg-white">
            <button
              onClick={() => setPrintModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center border-b border-slate-800 print:border-black pb-6 mb-6">
              <h1 className="text-3xl font-extrabold text-gold-400 print:text-black tracking-tight mb-1">YELLOWHOUSE</h1>
              <p className="text-sm text-slate-400 print:text-gray-600 uppercase tracking-widest">Delivery Note</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs text-slate-500 print:text-gray-500 uppercase font-bold mb-2">Client Details</h4>
                <p className="font-bold text-white print:text-black">{printModalOrder.clientName}</p>
                <p className="text-sm text-slate-400 print:text-gray-600">{printModalOrder.clientPhone}</p>
              </div>
              <div className="text-right">
                <h4 className="text-xs text-slate-500 print:text-gray-500 uppercase font-bold mb-2">Order Information</h4>
                <p className="font-bold text-white print:text-black">{printModalOrder.id}</p>
                <p className="text-sm text-slate-400 print:text-gray-600">Due: {printModalOrder.dueDate}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-xs text-slate-500 print:text-gray-500 uppercase font-bold border-b border-slate-800 print:border-black pb-2">Order Items & Material BOM</h4>
              {printModalOrder.items?.map((item, idx) => (
                <div key={item.id} className="border-b border-slate-800/50 print:border-gray-300 pb-3 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-200 print:text-black">{idx + 1}. {item.garmentType}</p>
                      <p className="text-xs text-slate-400 print:text-gray-600">Fabric: {item.fabricSku} ({item.fabricMeters}m)</p>
                      {item.materialNotes && <p className="text-xs text-slate-400 print:text-gray-600 italic mt-1">Note: {item.materialNotes}</p>}
                    </div>
                  </div>
                  {item.bomItems && item.bomItems.length > 0 && (
                    <div className="bg-slate-900/60 print:bg-gray-100 p-2 rounded text-[11px] print:text-[10px] space-y-1">
                      <div className="font-semibold text-amber-400 print:text-gray-700 uppercase tracking-wider text-[9px]">Material BOM / Trims:</div>
                      <div className="grid grid-cols-2 gap-1 text-slate-300 print:text-black">
                        {item.bomItems.map(b => (
                          <div key={b.id} className="flex items-center justify-between pr-2">
                            <span>• {b.name}</span>
                            <span className="font-mono text-slate-400 print:text-gray-600">{b.quantity} {b.unit} ({b.isOptional ? 'Optional' : 'Req'})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center text-sm text-slate-500 print:text-gray-600">
              <p>Thank you for choosing YellowHouse Atelier.</p>
              <p className="mt-4 border-t border-slate-800 print:border-black pt-4 w-1/2 mx-auto text-black">Client Signature</p>
            </div>

            <div className="mt-8 flex justify-center print:hidden">
              <button
                onClick={() => window.print()}
                className="btn-gold flex items-center space-x-2 py-2 px-6"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOMER MODAL */}
      {isQuickAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-2xl border border-gold-500/30 p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Client Profile</h3>
                  <p className="text-xs text-slate-400">Instantly create client and attach to current order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuickAddCustomerOpen(false);
                  setQuickCustomerError('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickCustomerError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
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
                    className="input-dark text-xs py-2 px-3 w-full"
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
                  className="rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-gold-500/20 cursor-pointer"
                />
                <label htmlFor="quickIsVip" className="text-xs font-semibold text-gold-400 cursor-pointer flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
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

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickAddCustomerOpen(false);
                    setQuickCustomerError('');
                  }}
                  className="btn-ghost text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs py-2 px-5 cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add & Select Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
