'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Scissors,
  Sparkles,
  Package,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Search,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Flame,
  Trash2,
  Edit2,
  FileText,
  Printer,
  Download,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Tag,
  Zap,
} from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { syncJobToOrdersStorage } from '@/lib/state-sync-utils';
import { JobCardPrint, ScheduleListPrint } from '@/components/print-layouts';
import { QRCodeSVG, BarcodeSVG } from '@/components/id-codes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Input } from '@/components/ui/input';
import {
  KanbanStage,
  Priority,
  JobCardItem,
  ActiveGarmentTimer,
  TimesheetLog,
  WeeklyArtisanRollup,
  KANBAN_STAGES,
  STAGE_CONFIG,
  STAGE_RACK_MAPPING,
  PIECE_RATE_PER_MINUTE,
  DEFAULT_KARIGAR_LIST,
  DEFAULT_GARMENT_FILTER_LIST,
  INITIAL_JOB_CARDS,
  INITIAL_TIMESHEET_LOGS,
  isTransitionAllowed,
  getNextStage,
  getPrevStage,
  getStageIndex,
  computeKanbanProgress,
  getDefaultRackForStage,
  executeStageTransition,
  calculatePieceRateEarnings,
  calculateTimesheetEarnings,
  formatTimerDuration,
  formatLaborTime,
  formatInrCurrency,
  getGarmentBadgeClass,
  aggregateDailyTimesheet,
  aggregateWeeklyTimesheet,
  generateTimesheetCsv,
} from '@/lib/production-utils';
import { calculateGarmentSam } from '@/lib/sam-calculator';
import type { GarmentCategory } from '@/types/measurement';

function resolveGarmentCategory(name: string): GarmentCategory {
  const n = (name || '').toLowerCase();
  if (n.includes('sherwani')) return 'mens-sherwani';
  if (n.includes('lehenga')) return 'womens-lehenga';
  if (n.includes('anarkali')) return 'womens-anarkali';
  if (n.includes('blouse')) return 'womens-blouse';
  if (n.includes('corset')) return 'womens-corset';
  if (n.includes('gown')) return 'womens-gown';
  if (n.includes('shirt')) return 'mens-shirt';
  if (n.includes('trouser')) return 'mens-trouser';
  return 'mens-suit';
}

export default function ProductionKanbanPage() {
  // --------------------------------------------------------------------------
  // Core State
  // --------------------------------------------------------------------------
  const [jobs, setJobs] = useState<JobCardItem[]>(INITIAL_JOB_CARDS);
  const [timesheets, setTimesheets] = useState<TimesheetLog[]>(INITIAL_TIMESHEET_LOGS);
  const [activeTab, setActiveTab] = useState<'board' | 'timesheets'>('board');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKarigar, setSelectedKarigar] = useState<string>('All Karigars');
  const [selectedGarment, setSelectedGarment] = useState<string>('All Garments');
  const [selectedPriority, setSelectedPriority] = useState<'All' | 'Urgent' | 'Normal'>('All');

  // Active Stopwatch Timer State
  const [activeTimer, setActiveTimer] = useState<ActiveGarmentTimer | null>(null);

  // Modals and Drawers
  const [selectedCardModal, setSelectedCardModal] = useState<JobCardItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<JobCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNote, setDeleteNote] = useState('');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState<JobCardItem | null>(null);

  // Timesheets ledger mode
  const [timesheetViewMode, setTimesheetViewMode] = useState<'table' | 'weekly' | 'daily'>('table');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Drag and Drop
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<KanbanStage | null>(null);

  // Form for New Job Card
  const [newJobForm, setNewJobForm] = useState<Partial<JobCardItem>>({
    client: '',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samTotalEstimate: 210,
    priority: 'Normal',
    dueDate: '',
    fabricDetails: '',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // Persistence & Initialization
  // --------------------------------------------------------------------------
  useEffect(() => {
    const storedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', INITIAL_JOB_CARDS);
    setJobs(storedJobs);
    const storedTimesheets = getLocalStorage<TimesheetLog[]>('yh_artisan_timesheets', INITIAL_TIMESHEET_LOGS);
    setTimesheets(storedTimesheets);
  }, []);

  const persistJobs = (updatedJobs: JobCardItem[]) => {
    setJobs(updatedJobs);
    setLocalStorage('yh_production_jobs', updatedJobs);
  };

  const persistTimesheets = (updatedLogs: TimesheetLog[]) => {
    setTimesheets(updatedLogs);
    setLocalStorage('yh_artisan_timesheets', updatedLogs);
  };

  // --------------------------------------------------------------------------
  // Active Garment Timer Interval
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;
        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const handleStartTimerForJob = (job: JobCardItem) => {
    if (activeTimer && activeTimer.jobId === job.id) {
      // Toggle run state
      setActiveTimer((prev) => prev ? { ...prev, isRunning: !prev.isRunning } : null);
      return;
    }

    setActiveTimer({
      jobId: job.id,
      orderId: job.orderId,
      client: job.client,
      garment: job.garment,
      karigar: job.karigar,
      stage: job.stage,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
    });
    showToast(`Active timer started for ${job.id} (${job.karigar})`);
  };

  const handleToggleTimer = () => {
    if (!activeTimer) return;
    setActiveTimer((prev) => prev ? { ...prev, isRunning: !prev.isRunning } : null);
  };

  const handleResetTimer = () => {
    if (!activeTimer) return;
    setActiveTimer((prev) => prev ? { ...prev, elapsedSeconds: 0, isRunning: false } : null);
  };

  const handleCommitTimerToLedger = () => {
    if (!activeTimer) return;
    const loggedMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));
    const targetJobId = activeTimer.jobId;

    // 1. Update Job samMinutesLogged
    const updatedJobs = jobs.map((j) => {
      if (j.id === targetJobId) {
        const updated = {
          ...j,
          samMinutesLogged: (j.samMinutesLogged || 0) + loggedMinutes,
        };
        syncJobToOrdersStorage(updated);
        return updated;
      }
      return j;
    });
    persistJobs(updatedJobs);

    // 2. Create Timesheet Log
    const newLog: TimesheetLog = {
      id: `TS-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      karigar: activeTimer.karigar,
      jobId: activeTimer.jobId,
      orderId: activeTimer.orderId,
      garment: activeTimer.garment,
      stage: activeTimer.stage,
      task: `${activeTimer.stage} production session`,
      sam: loggedMinutes,
      minutesLogged: loggedMinutes,
      rate: PIECE_RATE_PER_MINUTE,
      status: 'Logged',
    };
    persistTimesheets([newLog, ...timesheets]);

    const earned = loggedMinutes * PIECE_RATE_PER_MINUTE;
    showToast(`Logged ${loggedMinutes}m (${formatInrCurrency(earned)}) for ${activeTimer.karigar}`);
    setActiveTimer(null);
  };

  // --------------------------------------------------------------------------
  // Stage Transitions (Buttons & Drag-and-Drop)
  // --------------------------------------------------------------------------
  const handleTransition = (jobId: string, toStage: KanbanStage) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const result = executeStageTransition(job, toStage);
    if (!result.success || !result.job) {
      showToast(result.error || 'Stage transition not allowed.');
      return;
    }

    const updatedJob = result.job;
    const updatedList = jobs.map((j) => (j.id === jobId ? updatedJob : j));
    persistJobs(updatedList);
    syncJobToOrdersStorage(updatedJob);

    if (selectedCardModal?.id === jobId) {
      setSelectedCardModal(updatedJob);
    }
    showToast(`Moved ${job.id} to ${toStage}`);
  };

  const handleDragStart = (jobId: string) => {
    setDraggedJobId(jobId);
  };

  const handleDragOver = (e: React.DragEvent, stage: KanbanStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (stage: KanbanStage) => {
    if (!draggedJobId) return;
    const job = jobs.find((j) => j.id === draggedJobId);
    if (!job) {
      setDraggedJobId(null);
      setDragOverStage(null);
      return;
    }

    if (job.stage === stage) {
      setDraggedJobId(null);
      setDragOverStage(null);
      return;
    }

    if (!isTransitionAllowed(job.stage, stage)) {
      showToast(`Cannot jump from '${job.stage}' to '${stage}'. Only single-step transitions allowed.`);
    } else {
      handleTransition(draggedJobId, stage);
    }
    setDraggedJobId(null);
    setDragOverStage(null);
  };

  // --------------------------------------------------------------------------
  // Job Card CRUD
  // --------------------------------------------------------------------------
  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JC-${Math.floor(9050 + Math.random() * 50)}`;
    const garment = newJobForm.garment || 'Sherwani';

    // Auto-calculate SAM total estimate if not set
    let estimatedSam = newJobForm.samTotalEstimate || 0;
    if (estimatedSam <= 0) {
      const samCalc = calculateGarmentSam({ garmentCategory: resolveGarmentCategory(garment) });
      estimatedSam = samCalc.totalSamMinutes;
    }

    const newCard: JobCardItem = {
      id: newId,
      orderId: newId,
      client: newJobForm.client || 'Valued Atelier Patron',
      garment,
      karigar: newJobForm.karigar || 'Karigar Latif',
      samMinutesLogged: 0,
      samTotalEstimate: estimatedSam,
      priority: (newJobForm.priority as Priority) || 'Normal',
      dueDate: newJobForm.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      progress: 20,
      stage: 'Fabric Inspection',
      fabricDetails: newJobForm.fabricDetails || 'Client-supplied bespoke fabric',
      notes: newJobForm.notes || '',
      rack: getDefaultRackForStage('Fabric Inspection'),
      barcodeEnabled: true,
      qrCodeEnabled: true,
      history: [
        {
          action: 'Job ticket initialized',
          timestamp: new Date().toISOString(),
          stage: 'Fabric Inspection',
        },
      ],
    };

    const updated = [newCard, ...jobs];
    persistJobs(updated);
    syncJobToOrdersStorage(newCard);
    setShowCreateJobModal(false);
    setNewJobForm({
      client: '',
      garment: 'Sherwani',
      karigar: 'Karigar Latif',
      samTotalEstimate: 210,
      priority: 'Normal',
      dueDate: '',
      fabricDetails: '',
      notes: '',
    });
    showToast(`Created Job Card ${newId}`);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    const historyEntry = { action: 'Ticket details updated', timestamp: new Date().toISOString() };
    const history = editForm.history ? [...editForm.history, historyEntry] : [historyEntry];
    const finalForm: JobCardItem = { ...editForm, history };

    const updated = jobs.map((j) => (j.id === finalForm.id ? finalForm : j));
    persistJobs(updated);
    syncJobToOrdersStorage(finalForm);
    setSelectedCardModal(finalForm);
    setIsEditing(false);
    showToast(`Updated ${finalForm.id}`);
  };

  const handleDeleteJob = (jobId: string) => {
    if (!deleteNote.trim()) {
      showToast('Please specify an audit reason for job deletion.');
      return;
    }
    const jobToDelete = jobs.find((j) => j.id === jobId);
    const updated = jobs.filter((j) => j.id !== jobId);
    persistJobs(updated);

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
    showToast(`Deleted ${jobId}`);
  };

  const handleDisburseLog = (logId: string) => {
    const updated = timesheets.map((l) => (l.id === logId ? { ...l, status: 'Disbursed' as const } : l));
    persistTimesheets(updated);
    showToast(`Payout disbursed for log ${logId}`);
  };

  const handleExportTimesheetCsv = () => {
    const csvContent = generateTimesheetCsv(timesheets);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `yellowhouse_timesheets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Timesheet ledger exported to CSV.');
  };

  // --------------------------------------------------------------------------
  // Filtering & Computed Metrics
  // --------------------------------------------------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        j.id.toLowerCase().includes(q) ||
        j.orderId.toLowerCase().includes(q) ||
        j.client.toLowerCase().includes(q) ||
        j.garment.toLowerCase().includes(q) ||
        j.karigar.toLowerCase().includes(q);

      const matchesKarigar = selectedKarigar === 'All Karigars' || j.karigar === selectedKarigar;
      const matchesGarment =
        selectedGarment === 'All Garments' || j.garment.toLowerCase().includes(selectedGarment.toLowerCase());
      const matchesPriority = selectedPriority === 'All' || j.priority === selectedPriority;

      return matchesSearch && matchesKarigar && matchesGarment && matchesPriority;
    });
  }, [jobs, searchQuery, selectedKarigar, selectedGarment, selectedPriority]);

  const totalJobsCount = jobs.length;
  const urgentCount = jobs.filter((j) => j.priority === 'Urgent').length;
  const totalSamLogged = jobs.reduce((acc, j) => acc + (j.samMinutesLogged || 0), 0);
  const readyCount = jobs.filter((j) => j.stage === 'QC & Ready for Delivery').length;
  const totalPieceRateAccrued = calculatePieceRateEarnings(totalSamLogged);

  // Weekly Rollup for timesheets
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const weeklyRollup: WeeklyArtisanRollup[] = useMemo(() => {
    return aggregateWeeklyTimesheet(timesheets, weekDates);
  }, [timesheets, weekDates]);

  const dailyRollup = useMemo(() => {
    return aggregateDailyTimesheet(timesheets);
  }, [timesheets]);

  // Drag target validity helper
  const isDropTargetValid = (targetStage: KanbanStage): boolean => {
    if (!draggedJobId) return false;
    const dragged = jobs.find((j) => j.id === draggedJobId);
    if (!dragged) return false;
    return isTransitionAllowed(dragged.stage, targetStage);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="backdrop-blur-2xl bg-slate-900/90 text-amber-300 px-4 py-2.5 rounded-full border border-amber-500/30 shadow-ios-gold text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ACTIVE GARMENT TIMER STICKY TOP HUD */}
      {activeTimer && (
        <div className="sticky top-2 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
          <Card
            variant="gold"
            padding="sm"
            className="flex flex-wrap items-center justify-between gap-3 shadow-ios-gold-lg border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950/90"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Clock className="w-4 h-4 animate-spin [animation-duration:8s]" />
                {activeTimer.isRunning && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 tracking-tight">ACTIVE GARMENT SESSION</span>
                  <Badge variant="gold" size="sm">
                    {activeTimer.stage}
                  </Badge>
                  <span className="text-xs text-slate-400">• {activeTimer.karigar}</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">{activeTimer.jobId}</span> ({activeTimer.garment} for {activeTimer.client})
                </div>
              </div>
            </div>

            {/* Stopwatch Counter & Accrued Payout */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xl font-extrabold tracking-tight font-display text-white tabular-nums">
                  {formatTimerDuration(activeTimer.elapsedSeconds)}
                </div>
                <div className="text-[11px] text-amber-300/80 font-medium tabular-nums">
                  Accrued: {formatInrCurrency(calculatePieceRateEarnings(Math.round(activeTimer.elapsedSeconds / 60)))} @ ₹42/min
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTimer.isRunning ? 'secondary' : 'gold'}
                  size="sm"
                  onClick={handleToggleTimer}
                  leftIcon={activeTimer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                >
                  {activeTimer.isRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={handleResetTimer} title="Reset Timer">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleCommitTimerToLedger}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Log & Commit
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setActiveTimer(null)}
                  title="Discard Timer"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                Workshop Production Floor
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                5-Stage Karigar Kanban • SAM Efficiency • Piece-Rate Ledger (₹42/min)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: 'board', label: 'Kanban Floor', icon: <Layers className="w-3.5 h-3.5 mr-1" /> },
              { value: 'timesheets', label: 'Piece-Rate Ledger', icon: <DollarSign className="w-3.5 h-3.5 mr-1" /> },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'board' | 'timesheets')}
            size="sm"
          />

          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowCreateJobModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Job Ticket
          </Button>
        </div>
      </div>

      {/* KPI TELEMETRY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="glass" padding="sm" className="relative">
          <div className="text-[11px] font-medium text-slate-400">Active Workshop Jobs</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums font-display">{totalJobsCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">{urgentCount} marked Urgent priority</div>
        </Card>

        <Card variant="glass" padding="sm" className="relative">
          <div className="text-[11px] font-medium text-slate-400">Standard Allowed Minutes</div>
          <div className="text-2xl font-bold text-amber-300 mt-1 tabular-nums font-display">
            {totalSamLogged} <span className="text-xs font-normal text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{formatLaborTime(totalSamLogged).formatted} logged</div>
        </Card>

        <Card variant="glass" padding="sm" className="relative">
          <div className="text-[11px] font-medium text-slate-400">Piece-Rate Accrual (₹42/min)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums font-display">
            {formatInrCurrency(totalPieceRateAccrued)}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Fixed atelier standard rate</div>
        </Card>

        <Card variant="glass" padding="sm" className="relative">
          <div className="text-[11px] font-medium text-slate-400">Ready for Dispatch</div>
          <div className="text-2xl font-bold text-blue-400 mt-1 tabular-nums font-display">{readyCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Passed final 18-point QC</div>
        </Card>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: 5-STAGE KANBAN BOARD */}
      {/* ==================================================================== */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* SEARCH & FILTER BAR */}
          <Card variant="glass" padding="sm" className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by Job ID, Order, Client or Karigar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                inputSize="sm"
                shape="squircle"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedKarigar}
                onChange={(e) => setSelectedKarigar(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                {DEFAULT_KARIGAR_LIST.map((k) => (
                  <option key={k} value={k} className="bg-slate-900 text-slate-200">
                    {k}
                  </option>
                ))}
              </select>

              <select
                value={selectedGarment}
                onChange={(e) => setSelectedGarment(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                {DEFAULT_GARMENT_FILTER_LIST.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-slate-200">
                    {g}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                <option value="All" className="bg-slate-900">All Priorities</option>
                <option value="Urgent" className="bg-slate-900">Urgent Only</option>
                <option value="Normal" className="bg-slate-900">Normal Only</option>
              </select>
            </div>
          </Card>

          {/* 5-COLUMN WORKSHOP KANBAN FLOOR */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
            {KANBAN_STAGES.map((stageName, stageIdx) => {
              const stageConfig = STAGE_CONFIG[stageName];
              const stageJobs = filteredJobs.filter((j) => j.stage === stageName);
              const isDragTarget = dragOverStage === stageName;
              const isValidTarget = isDropTargetValid(stageName);

              return (
                <div
                  key={stageName}
                  onDragOver={(e) => handleDragOver(e, stageName)}
                  onDrop={() => handleDrop(stageName)}
                  className={`flex flex-col rounded-2.5xl transition-all duration-200 p-2.5 min-h-[550px] ${
                    isDragTarget
                      ? isValidTarget
                        ? 'ring-2 ring-amber-500/60 bg-amber-500/10'
                        : 'ring-2 ring-rose-500/40 bg-rose-500/5'
                      : 'bg-slate-900/40 border border-white/5'
                  }`}
                >
                  {/* Stage Column Header */}
                  <div className="pb-2.5 mb-2 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${stageConfig.dotColor}`} />
                        <h3 className="text-xs font-bold text-slate-200 tracking-tight truncate">
                          {stageName}
                        </h3>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {stageJobs.length}
                      </Badge>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{STAGE_RACK_MAPPING[stageName]}</span>
                    </div>
                  </div>

                  {/* Stage Job Cards List */}
                  <div className="space-y-2.5 flex-1">
                    {stageJobs.map((job) => {
                      const nextStg = getNextStage(job.stage);
                      const prevStg = getPrevStage(job.stage);
                      const isTiming = activeTimer?.jobId === job.id && activeTimer.isRunning;

                      return (
                        <Card
                          key={job.id}
                          variant="glass"
                          padding="sm"
                          draggable
                          onDragStart={() => handleDragStart(job.id)}
                          onClick={() => setSelectedCardModal(job)}
                          hoverable
                          className={`border-l-4 ${
                            job.priority === 'Urgent' ? 'border-l-rose-500' : 'border-l-amber-500/70'
                          } ${isTiming ? 'ring-2 ring-amber-500/50 shadow-ios-gold' : ''}`}
                        >
                          {/* Card Header: Job ID + Priority */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-bold text-white tracking-tight">{job.id}</span>
                            <div className="flex items-center gap-1">
                              {job.priority === 'Urgent' && (
                                <Badge variant="danger" size="sm">
                                  Urgent
                                </Badge>
                              )}
                              <Badge variant="neutral" size="sm">
                                {job.progress}%
                              </Badge>
                            </div>
                          </div>

                          {/* Client & Garment */}
                          <div className="text-xs font-medium text-slate-200 truncate">{job.client}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Tag className="w-3 h-3 text-slate-500" />
                            <span className="text-amber-300 font-medium">{job.garment}</span>
                            <span>• {job.karigar}</span>
                          </div>

                          {/* SAM Progress Bar */}
                          <div className="mt-2.5 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>SAM Minutes</span>
                              <span className="tabular-nums font-semibold text-slate-200">
                                {job.samMinutesLogged} / {job.samTotalEstimate} m
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    job.samTotalEstimate > 0
                                      ? (job.samMinutesLogged / job.samTotalEstimate) * 100
                                      : 0
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Interactive Card Action Bar */}
                          <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-white/5">
                            {/* Step backward (if allowed) */}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={!prevStg}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (prevStg) handleTransition(job.id, prevStg);
                              }}
                              title={prevStg ? `Move to ${prevStg}` : 'First stage'}
                              className="h-6 w-6 text-slate-400 hover:text-white"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </Button>

                            {/* Stopwatch Start/Pause */}
                            <Button
                              variant={isTiming ? 'gold' : 'secondary'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTimerForJob(job);
                              }}
                              className="h-6 px-2 text-[10px] gap-1"
                            >
                              {isTiming ? (
                                <>
                                  <Pause className="w-2.5 h-2.5" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-2.5 h-2.5" />
                                  <span>Timer</span>
                                </>
                              )}
                            </Button>

                            {/* Step forward (if allowed) */}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={!nextStg}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (nextStg) handleTransition(job.id, nextStg);
                              }}
                              title={nextStg ? `Move to ${nextStg}` : 'Final stage'}
                              className="h-6 w-6 text-slate-400 hover:text-white"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}

                    {stageJobs.length === 0 && (
                      <div className="text-center py-10 text-[11px] text-slate-500 border border-dashed border-white/5 rounded-2xl">
                        Drop jobs here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: PIECE-RATE PAYOUT LEDGER & TIMESHEETS */}
      {/* ==================================================================== */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SegmentedControl
              options={[
                { value: 'table', label: 'All Log Entries' },
                { value: 'weekly', label: 'Weekly Artisan Rollup' },
                { value: 'daily', label: 'Daily Atelier Rollup' },
              ]}
              value={timesheetViewMode}
              onChange={(val) => setTimesheetViewMode(val as any)}
              size="sm"
            />

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportTimesheetCsv}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* VIEW 1: FULL TABLE */}
          {timesheetViewMode === 'table' && (
            <Card variant="glass" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Log ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Artisan (Karigar)</th>
                      <th className="py-3 px-4">Job / Garment</th>
                      <th className="py-3 px-4">Stage & Task</th>
                      <th className="py-3 px-4 text-right">SAM Mins</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                      <th className="py-3 px-4 text-right">Gross (₹)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {timesheets.map((log) => {
                      const mins = log.sam || log.minutesLogged || 0;
                      const gross = mins * (log.rate || PIECE_RATE_PER_MINUTE);

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-amber-300">{log.id}</td>
                          <td className="py-3 px-4 text-slate-400">{log.date}</td>
                          <td className="py-3 px-4 font-medium text-white">{log.karigar}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-200">{log.jobId}</span>
                            <span className="text-slate-400 ml-1">({log.garment})</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-300">{log.task}</span>
                            <span className="text-[10px] text-slate-500 block">{log.stage}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold tabular-nums">{mins} m</td>
                          <td className="py-3 px-4 text-right text-slate-400 tabular-nums">₹{log.rate || 42}/m</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums font-display">
                            {formatInrCurrency(gross)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={log.status === 'Disbursed' ? 'success' : 'warning'} size="sm">
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.status !== 'Disbursed' ? (
                              <Button
                                variant="gold"
                                size="sm"
                                onClick={() => handleDisburseLog(log.id)}
                                className="h-7 px-2.5 text-[10px]"
                              >
                                Disburse
                              </Button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-medium">Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW 2: WEEKLY ROLLUP */}
          {timesheetViewMode === 'weekly' && (
            <Card variant="glass" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Artisan</th>
                      {weekDates.map((d) => (
                        <th key={d} className="py-3 px-2 text-center">
                          {d.slice(5)}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right">Total SAM</th>
                      <th className="py-3 px-4 text-right">Total Hours</th>
                      <th className="py-3 px-4 text-right">Gross Piece-Rate (₹)</th>
                      <th className="py-3 px-4 text-right">Disbursed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {weeklyRollup.map((row) => (
                      <tr key={row.karigar} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{row.karigar}</td>
                        {weekDates.map((d) => {
                          const mins = row.dailyMinutes[d] || 0;
                          return (
                            <td key={d} className="py-3 px-2 text-center font-mono tabular-nums">
                              {mins > 0 ? <span className="text-amber-300 font-semibold">{mins}m</span> : <span className="text-slate-600">—</span>}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-right font-bold text-amber-300 tabular-nums">
                          {row.totalSamMinutes} m
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300 tabular-nums">{row.totalLaborHours} h</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums font-display">
                          {formatInrCurrency(row.totalEarningsINR)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-400 tabular-nums">
                          {formatInrCurrency(row.disbursedEarningsINR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW 3: DAILY ROLLUP */}
          {timesheetViewMode === 'daily' && (
            <Card variant="glass" padding="md" className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Daily Atelier Piece-Rate Rollup</h3>
                  <p className="text-xs text-slate-400">Date: {dailyRollup.date}</p>
                </div>
                <Badge variant="gold" size="md">
                  {dailyRollup.logsCount} Recorded Sessions
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Total Minutes</div>
                  <div className="text-xl font-bold text-amber-300 mt-1 tabular-nums font-display">
                    {dailyRollup.totalMinutes}m
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Labor Hours</div>
                  <div className="text-xl font-bold text-white mt-1 tabular-nums font-display">
                    {dailyRollup.totalHours}h
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5">
                  <div className="text-[11px] text-slate-400">Total Payout</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums font-display">
                    {formatInrCurrency(dailyRollup.totalEarningsINR)}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: JOB CARD DETAIL & TICKET PRINT */}
      {/* ==================================================================== */}
      {selectedCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <Card
            variant="elevated"
            padding="none"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border-white/15"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Job Ticket {selectedCardModal.id}</h2>
                  <Badge variant={selectedCardModal.priority === 'Urgent' ? 'danger' : 'neutral'} size="sm">
                    {selectedCardModal.priority}
                  </Badge>
                  <Badge variant="gold" size="sm">
                    {selectedCardModal.stage}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Order Ref: {selectedCardModal.orderId}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Ticket
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setSelectedCardModal(null);
                    setIsEditing(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-300">
              {/* STAGE STEPPER BUTTONS */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Workshop Pipeline Progression</span>
                  <span className="text-xs font-bold text-amber-300">{selectedCardModal.progress}% Complete</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {KANBAN_STAGES.map((stg, idx) => {
                    const currentIdx = getStageIndex(selectedCardModal.stage);
                    const isCurrent = selectedCardModal.stage === stg;
                    const isAdjacent = Math.abs(idx - currentIdx) <= 1;

                    return (
                      <button
                        key={stg}
                        disabled={!isAdjacent || isCurrent}
                        onClick={() => handleTransition(selectedCardModal.id, stg)}
                        className={`flex-1 py-2 px-1 text-center rounded-xl transition-all text-[10px] font-medium ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-ios-gold'
                            : isAdjacent
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer border border-white/10'
                            : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {stg.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METADATA GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-slate-400">Patron Client</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedCardModal.client}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Garment Category</div>
                  <div className="text-sm font-semibold text-amber-300 mt-0.5">{selectedCardModal.garment}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Assigned Karigar</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedCardModal.karigar}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Storage Rack / Bin</div>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">
                    {selectedCardModal.rack || getDefaultRackForStage(selectedCardModal.stage)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Target Due Date</div>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">{selectedCardModal.dueDate || 'Standard'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">SAM Logged / Estimate</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5 tabular-nums">
                    {selectedCardModal.samMinutesLogged} / {selectedCardModal.samTotalEstimate} mins
                  </div>
                </div>
              </div>

              {/* FABRIC & TAILORING NOTES */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fabric & Cutting Details</div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-slate-200">
                  {selectedCardModal.fabricDetails || 'Standard atelier cut instructions.'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Posture & Tailoring Notes</div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-slate-200">
                  {selectedCardModal.notes || 'No specialized posture offsets requested.'}
                </div>
              </div>

              {/* PURE VECTOR SVG BARCODES */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Vector Code 128 Barcode</div>
                  <BarcodeSVG value={selectedCardModal.id} width={140} height={32} />
                </div>

                <div className="space-y-1 text-right">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Offline QR Verification</div>
                  <div className="inline-block p-1 bg-white rounded-lg">
                    <QRCodeSVG value={`https://yellowhouse.atelier/job/${selectedCardModal.id}`} size={42} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleting(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Card
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    handleStartTimerForJob(selectedCardModal);
                    setSelectedCardModal(null);
                  }}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Start Active Timer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCardModal(null)}
                >
                  Close
                </Button>
              </div>
            </div>

            {/* DELETE CONFIRMATION NESTED DIALOG */}
            {isDeleting && (
              <div className="p-4 bg-rose-950/40 border-t border-rose-500/30 space-y-3">
                <div className="text-xs font-semibold text-rose-300">
                  Confirm Deletion of Job Card {selectedCardModal.id}
                </div>
                <Input
                  placeholder="Audit reason (e.g. Order cancelled, duplicate ticket)..."
                  value={deleteNote}
                  onChange={(e) => setDeleteNote(e.target.value)}
                  inputSize="sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteJob(selectedCardModal.id)}>
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CREATE NEW JOB TICKET */}
      {/* ==================================================================== */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <Card
            variant="elevated"
            padding="none"
            className="w-full max-w-lg bg-slate-900/95 border-white/15"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display">New Workshop Job Ticket</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowCreateJobModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="p-6 space-y-4 text-xs">
              <Input
                label="Patron Client Full Name"
                placeholder="e.g. Maharaja Vikramaditya"
                value={newJobForm.client}
                onChange={(e) => setNewJobForm({ ...newJobForm, client: e.target.value })}
                required
                inputSize="sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Garment Category</label>
                  <select
                    value={newJobForm.garment}
                    onChange={(e) => {
                      const g = e.target.value;
                      const samCalc = calculateGarmentSam({ garmentCategory: resolveGarmentCategory(g) });
                      setNewJobForm({
                        ...newJobForm,
                        garment: g,
                        samTotalEstimate: samCalc.totalSamMinutes,
                      });
                    }}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    {DEFAULT_GARMENT_FILTER_LIST.filter((g) => g !== 'All Garments').map((g) => (
                      <option key={g} value={g} className="bg-slate-900">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Karigar</label>
                  <select
                    value={newJobForm.karigar}
                    onChange={(e) => setNewJobForm({ ...newJobForm, karigar: e.target.value })}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    {DEFAULT_KARIGAR_LIST.filter((k) => k !== 'All Karigars').map((k) => (
                      <option key={k} value={k} className="bg-slate-900">
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="SAM Total Estimate (Mins)"
                  type="number"
                  value={String(newJobForm.samTotalEstimate || '')}
                  onChange={(e) =>
                    setNewJobForm({ ...newJobForm, samTotalEstimate: Number(e.target.value) || 0 })
                  }
                  required
                  inputSize="sm"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={newJobForm.priority}
                    onChange={(e) => setNewJobForm({ ...newJobForm, priority: e.target.value as any })}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Normal" className="bg-slate-900">Normal Priority</option>
                    <option value="Urgent" className="bg-slate-900">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <Input
                label="Target Due Date"
                type="date"
                value={newJobForm.dueDate}
                onChange={(e) => setNewJobForm({ ...newJobForm, dueDate: e.target.value })}
                inputSize="sm"
              />

              <Input
                label="Fabric Details / SKU"
                placeholder="e.g. CUST-FAB-7718 Pure Banarasi Zari Brocade"
                value={newJobForm.fabricDetails}
                onChange={(e) => setNewJobForm({ ...newJobForm, fabricDetails: e.target.value })}
                inputSize="sm"
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateJobModal(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Create Job Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* PRINT-ONLY ISOLATED SECTION */}
      {selectedCardModal && (
        <div className="print-only hidden print:block">
          <JobCardPrint job={selectedCardModal} />
        </div>
      )}
    </div>
  );
}
