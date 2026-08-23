'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers, Scissors, Sparkles, Package, CheckCircle2,
  Clock, User, Search, Plus, X,
  ChevronRight, Calendar, AlertTriangle, Flame,
  Trash2, Edit2, FileText, Printer
} from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { syncJobToOrdersStorage } from '@/lib/state-sync-utils';
import { Tooltip } from '@/components/Tooltip';
import { JobCardPrint, ScheduleListPrint } from '@/components/print-layouts';

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
  rack?: string;
  barcodeEnabled?: boolean;
  qrCodeEnabled?: boolean;
  history?: { action: string; timestamp: string; stage?: string }[];
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
    headerBadgeColor: 'bg-gold-500/10 text-gold-400 border border-gold-500/30',
    headerTextColor: 'text-gold-400',
    accentBorder: 'border-t-gold-500',
    dotColor: 'bg-gold-400',
    progressGradient: 'bg-gradient-to-r from-gold-600 to-gold-400',
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

// Helper for Garment Badges
const getGarmentBadgeClass = (garment: string): string => {
  const g = garment.toLowerCase();
  if (g.includes('sherwani')) return 'badge-gold';
  if (g.includes('lehenga') || g.includes('anarkali')) return 'badge-amber';
  if (g.includes('suit') || g.includes('bandhgala')) return 'badge-blue';
  if (g.includes('blouse') || g.includes('sari')) return 'badge-rose';
  return 'badge-gold';
};

const generateBarcode = (text: string): number[] => {
  const bars: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Simple logic: charCode mapped to widths 1-3. 
    // And add a space (0) or 1 unit gap
    bars.push((charCode % 3) + 1);
    bars.push(1); // gap
    bars.push(((charCode >> 1) % 3) + 1);
    bars.push(1); // gap
  }
  return bars;
};

const INITIAL_JOB_CARDS: JobCardItem[] = [
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
  const [activeTab, setActiveTab] = useState<'board' | 'timesheets'>('board');
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // August (7)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string>('');
  const [timesheetViewMode, setTimesheetViewMode] = useState<'calendar' | 'table'>('calendar');
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<KanbanStage | null>(null);

  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState<Partial<JobCardItem>>({
    client: '',
    garment: '',
    karigar: KARIGAR_LIST[1],
    samTotalEstimate: 0,
    priority: 'Normal',
    dueDate: '',
    fabricDetails: ''
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JC-${Math.floor(9040 + Math.random() * 50)}`;
    const newCard: JobCardItem = {
      id: newId,
      orderId: newId,
      client: newJobForm.client || 'Unknown Client',
      garment: newJobForm.garment || 'Garment',
      karigar: newJobForm.karigar || KARIGAR_LIST[1],
      samMinutesLogged: 0,
      samTotalEstimate: newJobForm.samTotalEstimate || 0,
      priority: (newJobForm.priority as Priority) || 'Normal',
      dueDate: newJobForm.dueDate || '',
      progress: 15,
      stage: 'Fabric Inspection',
      fabricDetails: newJobForm.fabricDetails,
      history: [{ action: 'Job created', timestamp: new Date().toISOString(), stage: 'Fabric Inspection' }]
    };
    const updatedJobs = [newCard, ...jobs];
    setJobs(updatedJobs);
    setLocalStorage('yh_production_jobs', updatedJobs);
    setShowCreateJobModal(false);
    setNewJobForm({
      client: '', garment: '', karigar: KARIGAR_LIST[1], samTotalEstimate: 0, priority: 'Normal', dueDate: '', fabricDetails: ''
    });
    showToast('New Job Card created successfully.');
  };

  const handleStartEdit = (job: JobCardItem) => {
    setEditForm({ ...job });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    const historyEntry = { action: 'Details edited', timestamp: new Date().toISOString() };
    const history = editForm.history ? [...editForm.history, historyEntry] : [historyEntry];
    const finalEditForm = { ...editForm, history };
    const updatedJobs = jobs.map((j) => (j.id === finalEditForm.id ? finalEditForm : j));
    setJobs(updatedJobs);
    setLocalStorage('yh_production_jobs', updatedJobs);
    setSelectedCardModal(editForm);
    setIsEditing(false);
  };

  const handleDeleteJob = (jobId: string) => {
    if (!deleteNote.trim()) return;
    const jobToDelete = jobs.find((j) => j.id === jobId);
    const updatedJobs = jobs.filter((j) => j.id !== jobId);
    setJobs(updatedJobs);
    setLocalStorage('yh_production_jobs', updatedJobs);

    const logEntry = {
      jobId,
      client: jobToDelete?.client,
      garment: jobToDelete?.garment,
      reason: deleteNote,
      deletedAt: new Date().toISOString(),
    };
    const currentLogs = getLocalStorage<any[]>('yh_deleted_jobs_log', []);
    currentLogs.push(logEntry);
    setLocalStorage('yh_deleted_jobs_log', currentLogs);

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
    const storedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', INITIAL_JOB_CARDS);
    setJobs(storedJobs);
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

  const mockTimesheetLogs = [
    { date: '2026-08-01', karigar: 'Karigar Latif', jobId: 'JC-9038', garment: 'Sherwani', task: 'Pattern Master Drafting', sam: 60, rate: 42, status: 'Disbursed' },
    { date: '2026-08-02', karigar: 'Karigar Salim', jobId: 'JC-9035', garment: 'Lehenga Choli', task: 'Fabric Align Inspection', sam: 35, rate: 42, status: 'Disbursed' },
    { date: '2026-08-03', karigar: 'Karigar Latif', jobId: 'JC-9021', garment: 'Sherwani', task: 'Jacket Bodice Cutting', sam: 65, rate: 42, status: 'Disbursed' },
    { date: '2026-08-03', karigar: 'Karigar Salim', jobId: 'JC-9018', garment: 'Lehenga Choli', task: 'Maroon Velvet Dabka embroidery', sam: 180, rate: 42, status: 'Disbursed' },
    { date: '2026-08-04', karigar: 'Karigar Ahmed', jobId: 'JC-9025', garment: 'Bandhgala', task: 'Collar Pattern Cut', sam: 45, rate: 42, status: 'Disbursed' },
    { date: '2026-08-04', karigar: 'Karigar Usman', jobId: 'JC-8994', garment: 'Sari Blouse', task: 'Princess bodice assembly', sam: 85, rate: 42, status: 'Disbursed' },
    { date: '2026-08-05', karigar: 'Karigar Salim', jobId: 'JC-9018', garment: 'Lehenga Choli', task: 'French Knot panel extensions', sam: 60, rate: 42, status: 'Logged' },
    { date: '2026-08-05', karigar: 'Karigar Rafi', jobId: 'JC-9030', garment: 'Anarkali', task: 'Kalis seam stitching', sam: 110, rate: 42, status: 'Logged' },
    { date: '2026-08-06', karigar: 'Karigar Usman', jobId: 'JC-9022', garment: 'Sari Blouse', task: 'Sequins work backend collar', sam: 120, rate: 42, status: 'Logged' },
    { date: '2026-08-06', karigar: 'Karigar Ahmed', jobId: 'JC-9028', garment: 'Suit', task: 'Double breasted collar cuts', sam: 50, rate: 42, status: 'Logged' },
    { date: '2026-08-07', karigar: 'Karigar Rafi', jobId: 'JC-8965', garment: 'Anarkali', task: 'Final flare hem stitching', sam: 90, rate: 42, status: 'Logged' },
  ];

  const filteredTimesheets = mockTimesheetLogs.filter((log) => {
    const dateObj = new Date(log.date);
    const logMonth = dateObj.getMonth();
    const logYear = dateObj.getFullYear();

    const matchesMonth = selectedMonth === -1 || logMonth === selectedMonth;
    const matchesYear = logYear === selectedYear;
    const matchesSpecificDate = !selectedSpecificDate || log.date === selectedSpecificDate;
    const matchesKarigar = selectedKarigar === 'All Karigars' || log.karigar === selectedKarigar;

    return matchesMonth && matchesYear && matchesSpecificDate && matchesKarigar;
  });

  const timesheetTotalSam = filteredTimesheets.reduce((acc, curr) => acc + curr.sam, 0);
  const timesheetTotalPayout = filteredTimesheets.reduce((acc, curr) => acc + (curr.sam * curr.rate), 0);
  const timesheetCompletedCount = filteredTimesheets.length;

  const getCalendarDays = () => {
    const activeMonth = selectedMonth === -1 ? 7 : selectedMonth;
    const firstDayIndex = new Date(selectedYear, activeMonth, 1).getDay();
    const numDays = new Date(selectedYear, activeMonth + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevMonthYear = activeMonth === 0 ? selectedYear - 1 : selectedYear;
    const prevMonthVal = activeMonth === 0 ? 11 : activeMonth - 1;
    const prevNumDays = new Date(prevMonthYear, prevMonthVal + 1, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevNumDays - i;
      const mStr = String(prevMonthVal + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        dateStr: `${prevMonthYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= numDays; i++) {
      const mStr = String(activeMonth + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      days.push({
        dateStr: `${selectedYear}-${mStr}-${dStr}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }

    const nextMonthYear = activeMonth === 11 ? selectedYear + 1 : selectedYear;
    const nextMonthVal = activeMonth === 11 ? 0 : activeMonth + 1;
    let nextPaddingCount = 1;
    while (days.length < 42) {
      const mStr = String(nextMonthVal + 1).padStart(2, '0');
      const dStr = String(nextPaddingCount).padStart(2, '0');
      days.push({
        dateStr: `${nextMonthYear}-${mStr}-${dStr}`,
        dayNum: nextPaddingCount,
        isCurrentMonth: false
      });
      nextPaddingCount++;
    }

    return days;
  };

  const moveJobToStage = (jobId: string, newStage: KanbanStage) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const currentIndex = stages.indexOf(job.stage);
    const newIndex = stages.indexOf(newStage);
    if (Math.abs(currentIndex - newIndex) > 1) {
      showToast("You can only move a job one stage at a time.");
      return;
    }

    setJobs((prevJobs) => {
      let updatedJob: JobCardItem | null = null;
      const updated = prevJobs.map((j) => {
        if (j.id !== jobId) return j;

        let newProgress = j.progress;
        if (newStage === 'QC & Ready for Delivery') {
          newProgress = 100;
        } else {
          const stageIndex = stages.indexOf(newStage);
          newProgress = Math.min(100, Math.max(15, (stageIndex + 1) * 20));
        }

        const historyEntry = { action: 'Stage moved', timestamp: new Date().toISOString(), stage: newStage };
        const history = j.history ? [...j.history, historyEntry] : [historyEntry];

        updatedJob = { ...j, stage: newStage, progress: newProgress, history };
        return updatedJob;
      });

      setLocalStorage('yh_production_jobs', updated);
      if (updatedJob) {
        syncJobToOrdersStorage(updatedJob);
      }
      return updated;
    });

    if (selectedCardModal && selectedCardModal.id === jobId) {
      setSelectedCardModal((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  const moveStage = (jobId: string, direction: 'next' | 'prev') => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const currentIndex = stages.indexOf(job.stage);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= stages.length) nextIndex = stages.length - 1;
    moveJobToStage(jobId, stages[nextIndex]);
  };

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-6 animate-fade-in pb-12">
      {/* ---------------------------------------------------- */}
      {/* PAGE HEADER & CONTROLS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Karigar Workshop Board</span>
                <span className="badge badge-gold font-mono">
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
          <Tooltip content="Print current workshop job cards & production schedule">
            <button
              onClick={() => window.print()}
              className="btn-ghost flex items-center space-x-2 py-2 px-3 text-xs cursor-pointer border-slate-700 text-slate-300 hover:text-white"
            >
              <Printer className="w-4 h-4 text-yellow-400" />
              <span>Print Schedule & Jobs</span>
            </button>
          </Tooltip>

          <Tooltip content="Dispatch new workshop job card for active client order">
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="btn-gold flex items-center space-x-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Card</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-0">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
            activeTab === 'board'
              ? 'border-gold-500 text-gold-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Workshop Kanban Board
        </button>
        <button
          onClick={() => {
            setActiveTab('timesheets');
            setSelectedKarigar('All Karigars');
          }}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
            activeTab === 'timesheets'
              ? 'border-gold-500 text-gold-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Artisan Timesheets & Logs
        </button>
      </div>

      {activeTab === 'board' ? (
        <>
          {/* METRIC SUMMARY BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Job Cards</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">{totalJobsCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Across 5 workshop stages</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300">
                <Package className="w-5 h-5 text-gold-400" />
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

          {/* FILTERS TOOLBAR */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3 animate-fade-in">
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
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedKarigar}
                    onChange={(e) => setSelectedKarigar(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer"
                  >
                    {KARIGAR_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>

                <div className="relative">
                  <Scissors className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedGarment}
                    onChange={(e) => setSelectedGarment(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer"
                  >
                    {GARMENT_TYPES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>

                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                  {(['All', 'Urgent', 'Normal'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedPriority === p
                          ? p === 'Urgent'
                            ? 'bg-rose-500 text-white'
                            : 'btn-gold text-slate-950 font-bold'
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

          {/* 5-COLUMN KANBAN BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start animate-fade-in">
            {stages.map((stage) => {
              const config = STAGE_CONFIG[stage];
              const stageJobs = filteredJobs.filter((j) => j.stage === stage);
              const stageSamTotal = stageJobs.reduce((sum, j) => sum + j.samMinutesLogged, 0);

              return (
                <div
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const jobId = e.dataTransfer.getData('text/plain');
                    if (jobId) {
                      moveJobToStage(jobId, stage);
                    }
                    setDragOverStage(null);
                    setDraggedJobId(null);
                  }}
                  className={`kanban-column border-t-4 ${config.accentBorder} flex flex-col min-h-[580px] transition-all duration-200 ${
                    dragOverStage === stage ? 'kanban-column-drag-over bg-gold-500/10 ring-2 ring-gold-500/50 shadow-xl scale-[1.01]' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-3 border-b border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                        <h3 className={`font-bold text-xs truncate ${config.headerTextColor}`}>
                          {config.label}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${config.headerBadgeColor}`}>
                        {stageJobs.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Accrued SAM:</span>
                      <span className="text-slate-300 font-semibold">{stageSamTotal} mins</span>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="flex-1 py-3 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                    {stageJobs.map((job) => {
                      const isUrgent = job.priority === 'Urgent';
                      return (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', job.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedJobId(job.id);
                          }}
                          onDragEnd={() => {
                            setDraggedJobId(null);
                            setDragOverStage(null);
                          }}
                          onClick={() => setSelectedCardModal(job)}
                          className={`glass-card hover:border-gold-500/40 rounded-xl p-4 border transition-all duration-300 cursor-pointer relative group space-y-3 shadow-md ${
                            isUrgent ? 'border-rose-500/20 bg-rose-950/5' : 'border-slate-800/80'
                          } ${draggedJobId === job.id ? 'opacity-40 border-dashed border-gold-500' : ''}`}
                        >
                          {/* Top Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-extrabold text-slate-500 group-hover:text-gold-400 transition-colors">
                              {job.orderId}
                            </span>
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${getGarmentBadgeClass(job.garment)}`}>
                              {job.garment}
                            </span>
                          </div>

                          {/* Client & Karigar */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-white leading-tight">{job.client}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-gold-400" />
                              <span>{job.karigar}</span>
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                              <span>SAM: {job.samMinutesLogged}/{job.samTotalEstimate}m</span>
                              <span className="text-slate-300 font-bold">{job.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${config.progressGradient}`}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer details: Due date & stage arrows */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-[9px] font-mono text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span className={isUrgent ? 'text-rose-400 font-bold' : ''}>{job.dueDate}</span>
                            </span>

                            <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip content="Move back to previous stage">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(job.id, 'prev');
                                  }}
                                  disabled={stages.indexOf(job.stage) === 0}
                                  className="p-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800/60 transition-colors"
                                >
                                  {'←'}
                                </button>
                              </Tooltip>
                              <Tooltip content="Move forward to next stage">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(job.id, 'next');
                                  }}
                                  disabled={stages.indexOf(job.stage) === stages.length - 1}
                                  className="p-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-800/60 transition-colors"
                                >
                                  {'→'}
                                </button>
                              </Tooltip>
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
        </>
      ) : (
        /* ARTISAN TIMESHEETS REPORT VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* TIMESHEET SUMMARY WIDGETS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Selected Month Hours</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                  {Math.floor(timesheetTotalSam / 60)}h {timesheetTotalSam % 60}m
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">({timesheetTotalSam} total SAM minutes)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Accrued Payout (Rate ₹42/m)</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                  ₹{timesheetTotalPayout.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Based on completed tasks logged</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Log Entries Found</p>
                <p className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{timesheetCompletedCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Accrued task log rows</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* DATE & MONTH TIMESHEET CONTROL TOOLBAR */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Timesheet Period Filters</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Select date ranges or monthly cycles to audit Karigar earnings</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast("Timesheet report exported successfully as YellowHouse_Timesheet_Report.csv");
                  }}
                  className="btn-ghost text-xs py-2 px-3 flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-gold-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.print();
                  }}
                  className="btn-gold text-xs py-2 px-4 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block">Fiscal Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-dark w-full py-2 px-3 text-xs"
                >
                  <option value={2026}>2026 Fiscal</option>
                  <option value={2025}>2025 Fiscal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block">Billing Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input-dark w-full py-2 px-3 text-xs"
                >
                  <option value={-1}>All Months</option>
                  <option value={0}>January</option>
                  <option value={1}>February</option>
                  <option value={2}>March</option>
                  <option value={3}>April</option>
                  <option value={4}>May</option>
                  <option value={5}>June</option>
                  <option value={6}>July</option>
                  <option value={7}>August</option>
                  <option value={8}>September</option>
                  <option value={9}>October</option>
                  <option value={10}>November</option>
                  <option value={11}>December</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block">Specific Date Filter</label>
                <input
                  type="date"
                  value={selectedSpecificDate}
                  onChange={(e) => setSelectedSpecificDate(e.target.value)}
                  className="input-dark w-full py-1.5 px-3 text-xs text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block">Karigar Workspace Filter</label>
                <select
                  value={selectedKarigar}
                  onChange={(e) => setSelectedKarigar(e.target.value)}
                  className="input-dark w-full py-2 px-3 text-xs"
                >
                  {KARIGAR_LIST.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TIMESHEET VIEW MODE TOGGLER */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Layout Mode</span>
              <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTimesheetViewMode('calendar')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timesheetViewMode === 'calendar' ? 'btn-gold text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Calendar Month View
                </button>
                <button
                  type="button"
                  onClick={() => setTimesheetViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timesheetViewMode === 'table' ? 'btn-gold text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Audit List Table
                </button>
              </div>
            </div>
          </div>

          {/* CALENDAR OR TABLE */}
          {timesheetViewMode === 'calendar' ? (
            <div className="glass-card rounded-2xl border border-slate-800/80 p-5 space-y-4 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {selectedMonth === -1 ? 'August' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
                </h4>
                <div className="text-[10px] text-slate-500 font-mono">
                  Click a cell to set Specific Date Filter
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800/60">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, idx) => {
                  const dayLogs = mockTimesheetLogs.filter((l) => l.date === day.dateStr && (selectedKarigar === 'All Karigars' || l.karigar === selectedKarigar));
                  const dayTotalSam = dayLogs.reduce((acc, curr) => acc + curr.sam, 0);
                  const isSelected = selectedSpecificDate === day.dateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSpecificDate(isSelected ? '' : day.dateStr);
                      }}
                      className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative select-none ${
                        !day.isCurrentMonth
                          ? 'bg-slate-950/20 border-slate-900/40 opacity-30'
                          : isSelected
                          ? 'bg-gold-500/10 border-gold-500/80 shadow-md'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-xs font-bold font-mono ${day.isCurrentMonth ? (isSelected ? 'text-gold-400' : 'text-slate-300') : 'text-slate-600'}`}>
                          {day.dayNum}
                        </span>
                        {dayTotalSam > 0 && (
                          <span className="text-[8px] bg-gold-500/10 text-gold-400 font-mono px-1 rounded border border-gold-500/20">
                            {dayTotalSam}m
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[50px] pr-0.5 scrollbar-thin">
                        {dayLogs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            title={`${log.karigar}: ${log.task}`}
                            className={`text-[8px] px-1 py-0.5 rounded flex items-center justify-between font-medium leading-none ${
                              log.status === 'Disbursed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            <span className="truncate max-w-[45px] font-bold">{log.karigar.split(' ')[1]}</span>
                            <span className="font-mono opacity-80">{log.sam}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6 text-left">Date</th>
                      <th className="py-4 px-4 text-left">Artisan</th>
                      <th className="py-4 px-4 text-left">Job Card Reference</th>
                      <th className="py-4 px-4 text-left">Garment</th>
                      <th className="py-4 px-4 text-left">Task Done</th>
                      <th className="py-4 px-4 text-center">SAM Minutes</th>
                      <th className="py-4 px-4 text-right">Earned (₹)</th>
                      <th className="py-4 px-6 text-center">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {filteredTimesheets.map((log, index) => {
                      const payout = log.sam * log.rate;
                      return (
                        <tr key={index} className="hover:bg-slate-800/30 transition-colors text-slate-300">
                          <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">
                            {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">{log.karigar}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-gold-400 font-semibold">{log.jobId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getGarmentBadgeClass(log.garment)}`}>
                              {log.garment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{log.task}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold">{log.sam} mins</td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                            ₹{payout.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                log.status === 'Disbursed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTimesheets.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40 animate-pulse" />
                          No timesheet records match the selected date/month filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {timesheetViewMode === 'calendar' && selectedSpecificDate && (
            <div className="glass-card rounded-2xl border border-slate-800/80 p-5 space-y-3 shadow-md animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Daily Contributions: {new Date(selectedSpecificDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setSelectedSpecificDate('')}
                  className="text-[10px] text-gold-400 hover:underline"
                >
                  Show All Month Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 font-semibold border-b border-slate-800/60 pb-1">
                      <th className="pb-2">Artisan</th>
                      <th className="pb-2">Job ID</th>
                      <th className="pb-2">Garment</th>
                      <th className="pb-2">Task Contribution</th>
                      <th className="pb-2 text-center">SAM Min</th>
                      <th className="pb-2 text-right">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredTimesheets.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-slate-200">{log.karigar}</td>
                        <td className="py-2.5 font-mono text-gold-400">{log.jobId}</td>
                        <td className="py-2.5">{log.garment}</td>
                        <td className="py-2.5 text-slate-400">{log.task}</td>
                        <td className="py-2.5 text-center font-mono">{log.sam}m</td>
                        <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">₹{(log.sam * log.rate).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {filteredTimesheets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-500">No logs for this specific date.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JOB CARD DETAIL MODAL */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card-gold rounded-2xl border border-gold-500/30 max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-slate-100">
            {/* Modal Close Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono font-extrabold text-gold-400 text-base">
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
                    <select
                      value={editForm.karigar}
                      onChange={(e) => setEditForm({ ...editForm, karigar: e.target.value })}
                      className="input-dark w-full py-2 px-3 text-xs"
                    >
                      {KARIGAR_LIST.filter(k => k !== 'All Karigars').map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
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
                      <User className="w-3.5 h-3.5 text-gold-400" />
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
                    <select
                      value={selectedCardModal.stage}
                      onChange={(e) => moveJobToStage(selectedCardModal.id, e.target.value as KanbanStage)}
                      className="bg-slate-950 border border-gold-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-gold-400 focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {stages.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 text-slate-200">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveStage(selectedCardModal.id, 'prev')}
                      disabled={stages.indexOf(selectedCardModal.stage) === 0}
                      className="btn-ghost text-[11px] py-1 px-3 disabled:opacity-40"
                    >
                      {'←'} Previous Stage
                    </button>
                    <button
                      onClick={() => moveStage(selectedCardModal.id, 'next')}
                      disabled={stages.indexOf(selectedCardModal.stage) === stages.length - 1}
                      className="btn-gold text-[11px] py-1 px-3 disabled:opacity-40"
                    >
                      Next Stage {'→'}
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

                {/* TRACKING, BARCODES, QR CODES & RACK ASSIGNMENT */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">Storage & Scan Logistics</span>
                    <span className="text-[9px] text-slate-500 font-mono">Optional RFID/Rack tracking</span>
                  </div>

                  {/* Rack Selector & Info */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500 block">Assigned Storage Rack</label>
                      <input
                        type="text"
                        placeholder="e.g. Rack A-12, Hanger 4"
                        value={selectedCardModal.rack || ''}
                        onChange={(e) => {
                          const updatedRack = e.target.value;
                          const updatedJobs = jobs.map(j => j.id === selectedCardModal.id ? { ...j, rack: updatedRack } : j);
                          setJobs(updatedJobs);
                          setLocalStorage('yh_production_jobs', updatedJobs);
                          setSelectedCardModal({ ...selectedCardModal, rack: updatedRack });
                        }}
                        className="input-dark w-full py-1 px-2.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="flex gap-4 items-center justify-end">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selectedCardModal.barcodeEnabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updatedJobs = jobs.map(j => j.id === selectedCardModal.id ? { ...j, barcodeEnabled: val } : j);
                            setJobs(updatedJobs);
                            setLocalStorage('yh_production_jobs', updatedJobs);
                            setSelectedCardModal({ ...selectedCardModal, barcodeEnabled: val });
                          }}
                          className="rounded border-slate-800 bg-slate-900 text-gold-500 focus:ring-0 w-3 h-3 animate-fade-in"
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase select-none">Barcode</span>
                      </label>

                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selectedCardModal.qrCodeEnabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updatedJobs = jobs.map(j => j.id === selectedCardModal.id ? { ...j, qrCodeEnabled: val } : j);
                            setJobs(updatedJobs);
                            setLocalStorage('yh_production_jobs', updatedJobs);
                            setSelectedCardModal({ ...selectedCardModal, qrCodeEnabled: val });
                          }}
                          className="rounded border-slate-800 bg-slate-900 text-gold-500 focus:ring-0 w-3 h-3 animate-fade-in"
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase select-none">QR Code</span>
                      </label>
                    </div>
                  </div>

                  {/* Render Mock Barcode / QR Code if enabled */}
                  <div className="flex items-center justify-around gap-4 pt-2 border-t border-slate-800/40">
                    {selectedCardModal.barcodeEnabled ? (
                      <div className="bg-white p-2 rounded flex flex-col items-center justify-center space-y-1 shadow-md border border-slate-700">
                        <div className="flex items-end space-x-[1px] h-8">
                          {generateBarcode(selectedCardModal.orderId).map((width, idx) => (
                            <div
                              key={idx}
                              style={{ width: `${width}px`, opacity: width === 1 && idx % 2 !== 0 ? 0 : 1 }}
                              className="bg-black h-full"
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[8px] text-slate-900 tracking-widest">{selectedCardModal.orderId}</span>
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-600 italic">Barcode tracking deactivated</div>
                    )}

                    {selectedCardModal.qrCodeEnabled ? (
                      <div className="bg-white p-2 rounded flex flex-col items-center justify-center space-y-1 shadow-md border border-slate-700">
                        <div className="w-10 h-10 border border-black p-0.5 grid grid-cols-5 gap-0.5">
                          <div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                          <div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div>
                          <div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div>
                          <div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div>
                          <div className="bg-black"></div><div className="bg-black"></div><div className="bg-white"></div><div className="bg-black"></div><div className="bg-black"></div>
                        </div>
                        <span className="font-mono text-[8px] text-slate-900 uppercase">Scan Details</span>
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-600 italic">QR tracking deactivated</div>
                    )}
                  </div>
                </div>

                {/* ACTIVITY TIMELINE */}
                {selectedCardModal.history && selectedCardModal.history.length > 0 && (
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1.5">Activity Timeline</span>
                    <div className="space-y-4 pt-2">
                      {selectedCardModal.history.map((entry, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-slate-700/50 pb-2 last:pb-0">
                          <div className="absolute w-2 h-2 rounded-full bg-gold-500 -left-[5px] top-1"></div>
                          <p className="text-xs font-semibold text-slate-200">{entry.action}</p>
                          {entry.stage && <p className="text-[10px] text-gold-400 font-medium">{entry.stage}</p>}
                          <p className="text-[9px] text-slate-500 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INTERACTIVE ACTIONS ROW */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(selectedCardModal)}
                      className="btn-ghost py-1.5 px-3 flex items-center space-x-1 hover:border-gold-500/40 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gold-400" />
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

      {/* DELIVERY NOTE MODAL */}
      {showDeliveryNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #delivery-note-content, #delivery-note-content * {
                visibility: visible;
              }
              #delivery-note-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                box-shadow: none !important;
                background: white !important;
                padding: 2rem !important;
              }
            }
          `}</style>
          <div id="delivery-note-content" className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative font-sans">
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
                  <Scissors className="w-5 h-5 text-gold-600" />
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
                className="btn-gold text-xs py-2.5 px-5 flex items-center gap-1.5 transition-colors font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Delivery Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card-gold rounded-2xl border border-gold-500/30 max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-extrabold text-gold-400 text-base flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create New Job Card
              </h3>
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Client Name</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.client}
                    onChange={(e) => setNewJobForm({ ...newJobForm, client: e.target.value })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Garment Type</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.garment}
                    onChange={(e) => setNewJobForm({ ...newJobForm, garment: e.target.value })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Assigned Karigar</label>
                  <select
                    value={newJobForm.karigar}
                    onChange={(e) => setNewJobForm({ ...newJobForm, karigar: e.target.value })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  >
                    {KARIGAR_LIST.filter(k => k !== 'All Karigars').map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Target Due Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aug 25"
                    value={newJobForm.dueDate}
                    onChange={(e) => setNewJobForm({ ...newJobForm, dueDate: e.target.value })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Total SAM (Est.)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newJobForm.samTotalEstimate || ''}
                    onChange={(e) => setNewJobForm({ ...newJobForm, samTotalEstimate: parseInt(e.target.value) || 0 })}
                    className="input-dark w-full py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase text-[9px]">Priority</label>
                  <select
                    value={newJobForm.priority}
                    onChange={(e) => setNewJobForm({ ...newJobForm, priority: e.target.value as Priority })}
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
                  value={newJobForm.fabricDetails}
                  onChange={(e) => setNewJobForm({ ...newJobForm, fabricDetails: e.target.value })}
                  className="input-dark w-full py-2 px-3 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="btn-ghost px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold px-4 py-2 text-xs">
                  Create Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gold-500 text-slate-950 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Printable Schedule & Workshop Board (Hidden on screen, rendered on Print) */}
      <ScheduleListPrint 
        title="Karigar Workshop Production Schedule & Active Jobs"
        schedules={jobs.map((j) => ({
          id: j.id,
          title: `${j.garment} (${j.orderId})`,
          date: `Due: ${j.dueDate}`,
          clientName: j.client,
          karigar: j.karigar,
          stage: j.stage,
          status: `${j.priority} priority &bull; ${j.progress}%`,
          notes: j.notes || j.fabricDetails || 'Active production card'
        }))} 
      />
    </div>
  );
}
