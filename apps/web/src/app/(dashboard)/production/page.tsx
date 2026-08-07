'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers, Scissors, Sparkles, Package, CheckCircle2,
  Clock, User, AlertCircle, GripVertical, Filter,
  Eye, Search, Plus, ArrowRight, X, SlidersHorizontal,
  ChevronRight, Calendar, AlertTriangle, ShieldCheck, Flame,
  Trash2, Edit2, FileText, Printer
} from 'lucide-react';

// ============================================================
// TYPES & DEFINITIONS
// ============================================================
export type KanbanStage =
  | 'Fabric Inspection'
  | 'Master Cutting'
  | 'Zardozi/Aari Embroidery'
  | 'Stitching Assembly'
  | 'QC & Ready for Delivery';

export type Priority = 'Urgent' | 'Normal';

export interface JobCardItem {
  id: string;
  orderId: string;
  client: string;
  garment: string;
  karigar: string;
  samMinutesLogged: number;
  samTotalEstimate: number;
  priority: Priority;
  dueDate: string;
  progress: number;
  stage: KanbanStage;
  fabricDetails?: string;
  notes?: string;
}

// Stage Configuration mapping to design system styles
const STAGE_CONFIG: Record<
  KanbanStage,
  {
    label: string;
    headerBadgeColor: string;
    headerTextColor: string;
    accentBorder: string;
    dotColor: string;
    progressGradient: string;
  }
> = {
  'Fabric Inspection': {
    label: 'Fabric Inspection',
    headerBadgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    headerTextColor: 'text-slate-300',
    accentBorder: 'border-t-slate-500',
    dotColor: 'bg-slate-400',
    progressGradient: 'bg-slate-400',
  },
  'Master Cutting': {
    label: 'Master Cutting',
    headerBadgeColor: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
    headerTextColor: 'text-yellow-400',
    accentBorder: 'border-t-yellow-500',
    dotColor: 'bg-yellow-400',
    progressGradient: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
  },
  'Zardozi/Aari Embroidery': {
    label: 'Zardozi/Aari Embroidery',
    headerBadgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    headerTextColor: 'text-amber-400',
    accentBorder: 'border-t-amber-500',
    dotColor: 'bg-amber-400',
    progressGradient: 'bg-gradient-to-r from-amber-600 to-amber-400',
  },
  'Stitching Assembly': {
    label: 'Stitching Assembly',
    headerBadgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    headerTextColor: 'text-blue-400',
    accentBorder: 'border-t-blue-500',
    dotColor: 'bg-blue-400',
    progressGradient: 'bg-gradient-to-r from-blue-600 to-blue-400',
  },
  'QC & Ready for Delivery': {
    label: 'QC & Ready for Delivery',
    headerBadgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    headerTextColor: 'text-emerald-400',
    accentBorder: 'border-t-emerald-500',
    dotColor: 'bg-emerald-400',
    progressGradient: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  },
};

// Helper for Garment Badges as specified:
// badge-gold for Sherwani, badge-amber for Lehenga, badge-blue for Suit, badge-rose for Blouse
const getGarmentBadgeClass = (garment: string): string => {
  const g = garment.toLowerCase();
  if (g.includes('sherwani')) return 'badge-gold';
  if (g.includes('lehenga') || g.includes('anarkali')) return 'badge-amber';
  if (g.includes('suit') || g.includes('bandhgala')) return 'badge-blue';
  if (g.includes('blouse') || g.includes('sari')) return 'badge-rose';
  return 'badge-gold';
};

// Initial 14 Job Cards structured strictly per column count requirements:
// Column 1: Fabric Inspection - 2 cards
// Column 2: Master Cutting - 3 cards
// Column 3: Zardozi/Aari Embroidery - 2 cards
// Column 4: Stitching Assembly - 4 cards
// Column 5: QC & Ready for Delivery - 3 cards
const INITIAL_JOB_CARDS: JobCardItem[] = [
  // --- COLUMN 1: Fabric Inspection (2 Cards) ---
  {
    id: 'JC-9035',
    orderId: 'JC-9035',
    client: 'Sunita Verma',
    garment: 'Lehenga Choli',
    karigar: 'Karigar Salim',
    samMinutesLogged: 35,
    samTotalEstimate: 240,
    priority: 'Urgent',
    dueDate: 'Aug 14',
    progress: 15,
    stage: 'Fabric Inspection',
    fabricDetails: 'Pure Raw Silk (Crimson Red) - 6.5 meters',
    notes: 'Verify zari thread count and silk weight before cutting.',
  },
  {
    id: 'JC-9038',
    orderId: 'JC-9038',
    client: 'Kabir Roy',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 20,
    samTotalEstimate: 180,
    priority: 'Normal',
    dueDate: 'Aug 18',
    progress: 10,
    stage: 'Fabric Inspection',
    fabricDetails: 'Ivory Italian Brocade - 4.5 meters',
    notes: 'Check woven pattern motif alignment.',
  },

  // --- COLUMN 2: Master Cutting (3 Cards) ---
  {
    id: 'JC-9021',
    orderId: 'JC-9021',
    client: 'Rajeshwar Malhotra',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 65,
    samTotalEstimate: 180,
    priority: 'Urgent',
    dueDate: 'Aug 12',
    progress: 35,
    stage: 'Master Cutting',
    fabricDetails: 'Royal Velvet & Gold Silk Lining',
    notes: 'Angrakha style overlap cuts, chest ease +2.5 inches.',
  },
  {
    id: 'JC-9025',
    orderId: 'JC-9025',
    client: 'Vikram Singh',
    garment: 'Bandhgala',
    karigar: 'Karigar Ahmed',
    samMinutesLogged: 45,
    samTotalEstimate: 150,
    priority: 'Normal',
    dueDate: 'Aug 15',
    progress: 30,
    stage: 'Master Cutting',
    fabricDetails: 'Midnight Navy Wool-Silk Blend',
    notes: 'Mandarin collar pattern drafted with curved shoulder line.',
  },
  {
    id: 'JC-9028',
    orderId: 'JC-9028',
    client: 'Rohan Kapoor',
    garment: 'Suit',
    karigar: 'Karigar Ahmed',
    samMinutesLogged: 50,
    samTotalEstimate: 140,
    priority: 'Normal',
    dueDate: 'Aug 16',
    progress: 40,
    stage: 'Master Cutting',
    fabricDetails: 'Charcoal Super 130s Merino Wool',
    notes: 'Double breasted jacket pattern cut.',
  },

  // --- COLUMN 3: Zardozi/Aari Embroidery (2 Cards) ---
  {
    id: 'JC-9018',
    orderId: 'JC-9018',
    client: 'Ananya Sharma',
    garment: 'Lehenga Choli',
    karigar: 'Karigar Salim',
    samMinutesLogged: 240,
    samTotalEstimate: 360,
    priority: 'Urgent',
    dueDate: 'Aug 13',
    progress: 65,
    stage: 'Zardozi/Aari Embroidery',
    fabricDetails: 'Heritage Maroon Velvet',
    notes: 'Heavy Dabka, Nakshi, and French Knots embroidery on skirt panels.',
  },
  {
    id: 'JC-9022',
    orderId: 'JC-9022',
    client: 'Sanya Mirza',
    garment: 'Sari Blouse',
    karigar: 'Karigar Usman',
    samMinutesLogged: 180,
    samTotalEstimate: 220,
    priority: 'Normal',
    dueDate: 'Aug 17',
    progress: 55,
    stage: 'Zardozi/Aari Embroidery',
    fabricDetails: 'Emerald Green Organza',
    notes: 'Aari embroidery with pearl & sequins work on back cutout.',
  },

  // --- COLUMN 4: Stitching Assembly (4 Cards) ---
  {
    id: 'JC-8994',
    orderId: 'JC-8994',
    client: 'Priya Patel',
    garment: 'Sari Blouse',
    karigar: 'Karigar Usman',
    samMinutesLogged: 85,
    samTotalEstimate: 120,
    priority: 'Normal',
    dueDate: 'Aug 10',
    progress: 75,
    stage: 'Stitching Assembly',
    fabricDetails: 'Deep Rose Silk & Padded Cups',
    notes: 'Princess cut bodice assembly, back latkan attachment.',
  },
  {
    id: 'JC-9030',
    orderId: 'JC-9030',
    client: 'Deepika Nair',
    garment: 'Anarkali',
    karigar: 'Karigar Rafi',
    samMinutesLogged: 110,
    samTotalEstimate: 160,
    priority: 'Normal',
    dueDate: 'Aug 11',
    progress: 70,
    stage: 'Stitching Assembly',
    fabricDetails: 'Dusty Pink Georgette - 24 Kalis',
    notes: 'Kali join assembly and Gota patti hemline finishing.',
  },
  {
    id: 'JC-8988',
    orderId: 'JC-8988',
    client: 'Amitabh Sen',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 145,
    samTotalEstimate: 180,
    priority: 'Urgent',
    dueDate: 'Aug 09',
    progress: 80,
    stage: 'Stitching Assembly',
    fabricDetails: 'Champagne Gold Jacquard',
    notes: 'Canvas chest piece canvas pad & sleeve setting.',
  },
  {
    id: 'JC-8975',
    orderId: 'JC-8975',
    client: 'Karan Johar',
    garment: 'Suit',
    karigar: 'Karigar Ahmed',
    samMinutesLogged: 95,
    samTotalEstimate: 130,
    priority: 'Normal',
    dueDate: 'Aug 12',
    progress: 72,
    stage: 'Stitching Assembly',
    fabricDetails: 'Pinstripe Charcoal Wool',
    notes: 'Trousers waistband attachment and jacket lining installation.',
  },

  // --- COLUMN 5: QC & Ready for Delivery (3 Cards) ---
  {
    id: 'JC-8960',
    orderId: 'JC-8960',
    client: 'Meera Iyer',
    garment: 'Anarkali',
    karigar: 'Karigar Rafi',
    samMinutesLogged: 160,
    samTotalEstimate: 160,
    priority: 'Normal',
    dueDate: 'Aug 08',
    progress: 95,
    stage: 'QC & Ready for Delivery',
    fabricDetails: 'Royal Purple Silk Chiffon',
    notes: 'Final thread trim complete. Pressing and garment bag hanger ready.',
  },
  {
    id: 'JC-8955',
    orderId: 'JC-8955',
    client: 'Arjun Rampal',
    garment: 'Suit',
    karigar: 'Karigar Ahmed',
    samMinutesLogged: 140,
    samTotalEstimate: 140,
    priority: 'Normal',
    dueDate: 'Aug 07',
    progress: 100,
    stage: 'QC & Ready for Delivery',
    fabricDetails: 'Jet Black Tuxedo with Satin Lapel',
    notes: 'Passed 18-point inspection. Tagged for VIP trial appointment.',
  },
  {
    id: 'JC-8940',
    orderId: 'JC-8940',
    client: 'Kavitha Reddy',
    garment: 'Sari Blouse',
    karigar: 'Karigar Usman',
    samMinutesLogged: 110,
    samTotalEstimate: 110,
    priority: 'Normal',
    dueDate: 'Aug 06',
    progress: 100,
    stage: 'QC & Ready for Delivery',
    fabricDetails: 'Gold Zari Tissue Silk',
    notes: 'Dhook/eye fastenings verified. Packaged in yellow signature box.',
  },
];

const KARIGAR_LIST = [
  'All Karigars',
  'Karigar Latif',
  'Karigar Salim',
  'Karigar Usman',
  'Karigar Ahmed',
  'Karigar Rafi',
];

const GARMENT_TYPES = [
  'All Garments',
  'Sherwani',
  'Lehenga Choli',
  'Sari Blouse',
  'Bandhgala',
  'Anarkali',
  'Suit',
];

export default function ProductionKanbanPage() {
  const [jobs, setJobs] = useState<JobCardItem[]>(INITIAL_JOB_CARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKarigar, setSelectedKarigar] = useState('All Karigars');
  const [selectedGarment, setSelectedGarment] = useState('All Garments');
  const [selectedPriority, setSelectedPriority] = useState<'All' | 'Urgent' | 'Normal'>('All');
  const [selectedCardModal, setSelectedCardModal] = useState<JobCardItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<JobCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNote, setDeleteNote] = useState('');
  const [showDeliveryNote, setShowDeliveryNote] = useState<JobCardItem | null>(null);

  const handleStartEdit = (job: JobCardItem) => {
    setEditForm({ ...job });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    const updatedJobs = jobs.map((j) => (j.id === editForm.id ? editForm : j));
    setJobs(updatedJobs);
    localStorage.setItem('yh_production_jobs', JSON.stringify(updatedJobs));
    setSelectedCardModal(editForm);
    setIsEditing(false);
  };

  const handleDeleteJob = (jobId: string) => {
    if (!deleteNote.trim()) return;
    const jobToDelete = jobs.find((j) => j.id === jobId);
    const updatedJobs = jobs.filter((j) => j.id !== jobId);
    setJobs(updatedJobs);
    localStorage.setItem('yh_production_jobs', JSON.stringify(updatedJobs));

    const logEntry = {
      jobId,
      client: jobToDelete?.client,
      garment: jobToDelete?.garment,
      reason: deleteNote,
      deletedAt: new Date().toISOString(),
    };
    const currentLogs = JSON.parse(localStorage.getItem('yh_deleted_jobs_log') || '[]');
    currentLogs.push(logEntry);
    localStorage.setItem('yh_deleted_jobs_log', JSON.stringify(currentLogs));

    setIsDeleting(false);
    setDeleteNote('');
    setSelectedCardModal(null);
  };

  const stages: KanbanStage[] = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery',
  ];

  // Sync with localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedJobs = localStorage.getItem('yh_production_jobs');
      if (storedJobs) {
        try {
          setJobs(JSON.parse(storedJobs));
        } catch (e) {}
      } else {
        localStorage.setItem('yh_production_jobs', JSON.stringify(INITIAL_JOB_CARDS));
      }
    }
  }, []);

  // Filtering logic
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.garment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.karigar.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKarigar =
      selectedKarigar === 'All Karigars' || j.karigar === selectedKarigar;

    const matchesGarment =
      selectedGarment === 'All Garments' ||
      j.garment.toLowerCase().includes(selectedGarment.toLowerCase());

    const matchesPriority =
      selectedPriority === 'All' || j.priority === selectedPriority;

    return matchesSearch && matchesKarigar && matchesGarment && matchesPriority;
  });

  // Calculate Metrics
  const totalJobsCount = jobs.length;
  const urgentCount = jobs.filter((j) => j.priority === 'Urgent').length;
  const totalSamLogged = jobs.reduce((acc, j) => acc + j.samMinutesLogged, 0);
  const readyCount = jobs.filter((j) => j.stage === 'QC & Ready for Delivery').length;

  // Move card to next or previous stage
  const moveStage = (jobId: string, direction: 'next' | 'prev') => {
    setJobs((prevJobs) => {
      const updated = prevJobs.map((j) => {
        if (j.id !== jobId) return j;

        const currentIndex = stages.indexOf(j.stage);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= stages.length) nextIndex = stages.length - 1;

        const newStage = stages[nextIndex];
        let newProgress = j.progress;
        if (direction === 'next') {
          newProgress = Math.min(100, j.progress + 20);
          if (newStage === 'QC & Ready for Delivery') newProgress = 100;
        } else {
          newProgress = Math.max(10, j.progress - 20);
        }

        return { ...j, stage: newStage, progress: newProgress };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('yh_production_jobs', JSON.stringify(updated));

        // Bidirectional update back to yh_orders
        const targetJob = updated.find(x => x.id === jobId);
        if (targetJob) {
          const storedOrders = localStorage.getItem('yh_orders');
          if (storedOrders) {
            try {
              const ordersList = JSON.parse(storedOrders);
              const mappedStatus = 
                targetJob.stage === 'Fabric Inspection' ? 'CONFIRMED' :
                targetJob.stage === 'Master Cutting' ? 'CUTTING' :
                targetJob.stage === 'Zardozi/Aari Embroidery' ? 'IN_PRODUCTION' :
                targetJob.stage === 'Stitching Assembly' ? 'IN_PRODUCTION' :
                targetJob.stage === 'QC & Ready for Delivery' ? 'READY_FOR_DELIVERY' : 'CONFIRMED';
                
              const updatedOrders = ordersList.map((o: any) => {
                if (o.id === targetJob.orderId) {
                  return { ...o, status: mappedStatus };
                }
                return o;
              });
              localStorage.setItem('yh_orders', JSON.stringify(updatedOrders));
            } catch (e) {}
          }
        }
      }
      return updated;
    });

    if (selectedCardModal && selectedCardModal.id === jobId) {
      const currentIndex = stages.indexOf(selectedCardModal.stage);
      let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= 0 && nextIndex < stages.length) {
        setSelectedCardModal((prev) =>
          prev ? { ...prev, stage: stages[nextIndex] } : null
        );
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ---------------------------------------------------- */}
      {/* PAGE HEADER & CONTROLS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Karigar Workshop Board</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-mono">
                  LIVE PIPELINE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of bespoke job cards from Fabric Inspection through Master Cutting, Zardozi, Assembly & QC
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const newId = `JC-${Math.floor(9040 + Math.random() * 50)}`;
              const newCard: JobCardItem = {
                id: newId,
                orderId: newId,
                client: 'New Atelier Client',
                garment: 'Sherwani',
                karigar: 'Karigar Latif',
                samMinutesLogged: 15,
                samTotalEstimate: 180,
                priority: 'Normal',
                dueDate: 'Aug 20',
                progress: 10,
                stage: 'Fabric Inspection',
                notes: 'Newly dispatched fabric from inventory store.',
              };
              setJobs([newCard, ...jobs]);
            }}
            className="btn-gold flex items-center space-x-2 cursor-pointer shadow-lg shadow-yellow-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Card</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* METRIC SUMMARY BAR */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Job Cards</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{totalJobsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Across 5 workshop stages</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300">
            <Package className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Urgent Rush Jobs</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{urgentCount}</p>
            <p className="text-[10px] text-rose-400/80 mt-0.5">High priority wedding orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">SAM Logged (Minutes)</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{totalSamLogged} <span className="text-xs text-slate-400 font-sans">mins</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">Standard Allowed Minutes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">QC Passed & Ready</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{readyCount}</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">Ready for client dispatch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTERS TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search JC #, Client, Karigar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark pl-9 py-2 text-xs"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Karigar Filter */}
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedKarigar}
                onChange={(e) => setSelectedKarigar(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
              >
                {KARIGAR_LIST.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Garment Filter */}
            <div className="relative">
              <Scissors className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedGarment}
                onChange={(e) => setSelectedGarment(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
              >
                {GARMENT_TYPES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              {(['All', 'Urgent', 'Normal'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedPriority === p
                      ? p === 'Urgent'
                        ? 'bg-rose-500 text-white'
                        : 'bg-yellow-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 5-COLUMN KANBAN BOARD */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {stages.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const stageJobs = filteredJobs.filter((j) => j.stage === stage);
          const stageSamTotal = stageJobs.reduce((sum, j) => sum + j.samMinutesLogged, 0);

          return (
            <div
              key={stage}
              className={`kanban-column border-t-4 ${config.accentBorder} flex flex-col min-h-[580px]`}
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotColor}`} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider truncate ${config.headerTextColor}`}>
                      {stage}
                    </h3>
                  </div>

                  {/* Column Count Badge */}
                  <span className="ml-2 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-800/90 text-slate-300 border border-slate-700/60 shadow-sm flex-shrink-0">
                    {stageJobs.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>SAM Logged:</span>
                  <span className="text-yellow-400/90 font-bold">{stageSamTotal} mins</span>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 pt-3 overflow-y-auto max-h-[750px] pr-0.5">
                {stageJobs.map((job) => {
                  const garmentBadgeClass = getGarmentBadgeClass(job.garment);

                  return (
                    <div
                      key={job.id}
                      className="kanban-card group cursor-pointer relative hover:border-slate-700 transition-all duration-200"
                      onClick={() => setSelectedCardModal(job)}
                    >
                      {/* Top Row: Job Card # and Garment Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          <span className="font-mono font-bold text-xs text-yellow-400 tracking-wide">
                            {job.orderId}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {job.priority === 'Urgent' && (
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded uppercase tracking-wider animate-pulse flex items-center space-x-1"
                              title="Urgent Order"
                            >
                              <span>URGENT</span>
                            </span>
                          )}
                          <span className={`badge ${garmentBadgeClass}`}>
                            {job.garment}
                          </span>
                        </div>
                      </div>

                      {/* Client Name */}
                      <p className="text-xs font-bold text-slate-100 group-hover:text-yellow-400 transition-colors pt-0.5">
                        {job.client}
                      </p>

                      {/* Assigned Karigar & SAM Minutes */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[110px]">{job.karigar}</span>
                        </div>
                        <div className="flex items-center space-x-1 font-mono text-yellow-400/90 text-[10px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{job.samMinutesLogged}m SAM</span>
                        </div>
                      </div>

                      {/* Progress Bar (colored per stage) */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">Stage Progress</span>
                          <span className="text-slate-300 font-mono font-bold">{job.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${config.progressGradient}`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Due Date & Action controls */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/40">
                        <span className="flex items-center space-x-1 text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Due: <strong className="text-slate-300">{job.dueDate}</strong></span>
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStage(job.id, 'prev');
                            }}
                            disabled={stages.indexOf(job.stage) === 0}
                            className="p-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800/60 transition-colors"
                            title="Move back a stage"
                          >
                            &larr;
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStage(job.id, 'next');
                            }}
                            disabled={stages.indexOf(job.stage) === stages.length - 1}
                            className="p-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800/60 transition-colors"
                            title="Move forward to next stage"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-800 text-slate-600 space-y-2">
                    <Package className="w-6 h-6 opacity-40" />
                    <p className="text-xs">No active jobs in {stage}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* JOB CARD DETAIL MODAL */}
      {/* ---------------------------------------------------- */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card-gold rounded-2xl border border-yellow-500/30 max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-slate-100">
            {/* Modal Close Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono font-extrabold text-yellow-400 text-base">
                    {selectedCardModal.orderId}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedCardModal.client} — {selectedCardModal.garment}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCardModal(null);
                  setIsEditing(false);
                  setIsDeleting(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DELETE MODE PANEL */}
            {isDeleting ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Confirm Job Deletion
                  </h4>
                  <p className="text-slate-300">
                    Deleting this card will remove it permanently from the production pipeline. A reason is required to log this deletion in your atelier audit history.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-400 font-semibold uppercase block text-[10px]">Reason for Deletion *</label>
                  <textarea
                    placeholder="Enter reason (e.g. Order canceled by client, fabric out of stock, measurement revision...)"
                    value={deleteNote}
                    onChange={(e) => setDeleteNote(e.target.value)}
                    className="input-dark w-full h-24 text-xs p-3 focus:border-rose-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsDeleting(false);
                      setDeleteNote('');
                    }}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteJob(selectedCardModal.id)}
                    disabled={!deleteNote.trim()}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Deletion
                  </button>
                </div>
              </div>
            ) : isEditing && editForm ? (
              /* EDITING MODE FORM */
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Client Name</label>
                    <input
                      type="text"
                      value={editForm.client}
                      onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Garment Type</label>
                    <input
                      type="text"
                      value={editForm.garment}
                      onChange={(e) => setEditForm({ ...editForm, garment: e.target.value })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Assigned Karigar</label>
                    <input
                      type="text"
                      value={editForm.karigar}
                      onChange={(e) => setEditForm({ ...editForm, karigar: e.target.value })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Target Due Date</label>
                    <input
                      type="text"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Total SAM (Est.)</label>
                    <input
                      type="number"
                      value={editForm.samTotalEstimate}
                      onChange={(e) => setEditForm({ ...editForm, samTotalEstimate: parseInt(e.target.value) || 0 })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase text-[9px]">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Fabric Specification</label>
                  <input
                    type="text"
                    value={editForm.fabricDetails || ''}
                    onChange={(e) => setEditForm({ ...editForm, fabricDetails: e.target.value })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Tailoring Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="input-dark w-full h-16 p-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-gold px-4 py-2 text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD DETAIL VIEW */
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Assigned Karigar</span>
                    <p className="font-bold text-white flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{selectedCardModal.karigar}</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">SAM Minutes Logged</span>
                    <p className="font-mono font-bold text-amber-400 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedCardModal.samMinutesLogged} / {selectedCardModal.samTotalEstimate} mins</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Current Stage</span>
                    <span className="text-xs font-bold text-yellow-400">{selectedCardModal.stage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveStage(selectedCardModal.id, 'prev')}
                      disabled={stages.indexOf(selectedCardModal.stage) === 0}
                      className="btn-ghost text-[11px] py-1 px-3 disabled:opacity-40"
                    >
                      &larr; Previous Stage
                    </button>
                    <button
                      onClick={() => moveStage(selectedCardModal.id, 'next')}
                      disabled={stages.indexOf(selectedCardModal.stage) === stages.length - 1}
                      className="btn-gold text-[11px] py-1 px-3 disabled:opacity-40"
                    >
                      Next Stage &rarr;
                    </button>
                  </div>
                </div>

                {selectedCardModal.fabricDetails && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Fabric Specification</span>
                    <p className="text-slate-200">{selectedCardModal.fabricDetails}</p>
                  </div>
                )}

                {selectedCardModal.notes && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Tailoring Notes</span>
                    <p className="text-slate-300 italic">{selectedCardModal.notes}</p>
                  </div>
                )}

                {/* INTERACTIVE ACTIONS ROW */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(selectedCardModal)}
                      className="btn-ghost py-1.5 px-3 flex items-center space-x-1 hover:border-yellow-500/40 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => setIsDeleting(true)}
                      className="btn-ghost py-1.5 px-3 flex items-center space-x-1 hover:border-rose-500/40 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Job</span>
                    </button>
                  </div>

                  {selectedCardModal.stage === 'QC & Ready for Delivery' && (
                    <button
                      onClick={() => setShowDeliveryNote(selectedCardModal)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-xl flex items-center space-x-1 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Delivery Note</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            {!isEditing && !isDeleting && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Target Delivery Date: <strong className="text-slate-200">{selectedCardModal.dueDate}</strong></span>
                <button
                  onClick={() => setSelectedCardModal(null)}
                  className="btn-ghost text-xs py-1.5 px-4"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELIVERY NOTE MODAL */}
      {/* ---------------------------------------------------- */}
      {showDeliveryNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative font-sans">
            <button
              onClick={() => setShowDeliveryNote(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Delivery Note Brand Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-200 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Scissors className="w-5 h-5 text-yellow-600" />
                  YellowHouse Atelier
                </h2>
                <p className="text-[10px] text-slate-500 leading-tight">
                  12 Savile Row, London / Flagship Boutique New Delhi<br />
                  Support: billing@yellowhouse.app | +91 98765 43210
                </p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-[10px] uppercase">
                  Ready for Delivery
                </span>
                <p className="font-mono text-xs text-slate-500 mt-2 font-bold">{showDeliveryNote.orderId}</p>
              </div>
            </div>

            {/* Delivery Note Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <p className="text-slate-500">CLIENT DETAILS</p>
                <div className="font-bold text-slate-900 space-y-0.5">
                  <p>{showDeliveryNote.client}</p>
                  <p className="font-normal text-slate-500">Premium Bespoke Client</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-500">ORDER INFORMATION</p>
                <div className="font-mono text-slate-900 space-y-0.5">
                  <p>Garment: <strong>{showDeliveryNote.garment}</strong></p>
                  <p>Ready Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></p>
                </div>
              </div>
            </div>

            {/* Fabric Specs & Tailoring Specifications */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase text-[9px] mb-1">Fabric Specifications</h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {showDeliveryNote.fabricDetails || 'Selected high-grade raw boutique wool - matching client selections'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase text-[9px] mb-1">Pattern & Fitments Details</h4>
                <p className="text-slate-600 italic">
                  {showDeliveryNote.notes || 'Handmade custom lapels, bespoke patterns seeded in workshop. Standard sleeve adjustments.'}
                </p>
              </div>
            </div>

            {/* Delivery Receipt Layout Footer */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-slate-200">
              <div className="space-y-1">
                {/* Visual Barcode representation for custom delivery scanning */}
                <div className="bg-slate-900 text-white font-mono text-[9px] px-3 py-1 tracking-[0.3em] font-black rounded select-none flex items-center justify-center">
                  ||| | | ||| || ||| | |||
                </div>
                <p className="text-[8px] text-center text-slate-400 font-mono">SCANNABLE ORDER TOKEN</p>
              </div>
              <div className="text-right text-[10px] text-slate-500 space-y-1">
                <p>Tailor Signature: __________________</p>
                <p className="text-[9px]">Verified by {showDeliveryNote.karigar}</p>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeliveryNote(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
              >
                Close Receipt
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Delivery Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
