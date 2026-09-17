/**
 * apps/web/src/lib/production-utils.ts
 * Centralized Domain Logic, Types, and Calculation Engine for YellowHouse Production Floor
 *
 * Authoritative Invariants:
 * - 5 Kanban Stages: Fabric Inspection -> Master Cutting -> Zardozi/Aari Embroidery -> Stitching Assembly -> QC & Ready for Delivery
 * - Single-step transitions: Math.abs(fromIndex - toIndex) <= 1
 * - Piece-rate earnings: strictly ₹42/minute (PIECE_RATE_PER_MINUTE = 42)
 * - Automatic stage-linked storage bin/rack locations
 */

// ============================================================
// 1. DOMAIN TYPES & INTERFACES
// ============================================================

export type KanbanStage =
  | 'Fabric Inspection'
  | 'Master Cutting'
  | 'Zardozi/Aari Embroidery'
  | 'Stitching Assembly'
  | 'QC & Ready for Delivery';

export type Priority = 'Urgent' | 'Normal';

export interface JobCardHistoryEntry {
  action: string;
  timestamp: string;
  stage?: string;
  user?: string;
  notes?: string;
}

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
  history?: JobCardHistoryEntry[];
}

export interface ActiveGarmentTimer {
  jobId: string;
  orderId: string;
  client: string;
  garment: string;
  karigar: string;
  stage: KanbanStage;
  startedAt: number;        // Epoch ms timestamp
  elapsedSeconds: number;   // Accumulated elapsed seconds
  isRunning: boolean;
}

export interface TimesheetLog {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  karigar: string;
  jobId: string;
  orderId?: string;
  garment: string;
  stage: KanbanStage;
  task: string;
  sam: number;             // SAM minutes logged
  minutesLogged?: number;  // Alias for sam
  rate: number;            // strictly 42
  status: 'Logged' | 'Disbursed';
}

export type ArtisanTimesheetEntry = TimesheetLog;

export type StageRackMapping = Record<KanbanStage, string>;

export interface DailyArtisanRollup {
  date: string;
  totalMinutes: number;
  totalHours: number;
  totalEarningsINR: number;
  logsCount: number;
}

export interface WeeklyArtisanRollup {
  karigar: string;
  dailyMinutes: Record<string, number>; // 'YYYY-MM-DD' -> minutes
  totalSamMinutes: number;
  totalLaborHours: number;
  totalEarningsINR: number;
  loggedEarningsINR: number;
  disbursedEarningsINR: number;
}

export interface StageStyleConfig {
  label: KanbanStage;
  defaultRack: string;
  headerBadgeColor: string;
  headerTextColor: string;
  accentBorder: string;
  dotColor: string;
  progressGradient: string;
  targetProgress: number;
}

// ============================================================
// 2. CONSTANTS
// ============================================================

export const PIECE_RATE_PER_MINUTE = 42;
export const PIECE_RATE_PER_MINUTE_INR = 42;

export const KANBAN_STAGES: readonly KanbanStage[] = [
  'Fabric Inspection',
  'Master Cutting',
  'Zardozi/Aari Embroidery',
  'Stitching Assembly',
  'QC & Ready for Delivery',
] as const;

export const STAGE_RACK_MAPPING: Record<KanbanStage, string> = {
  'Fabric Inspection': 'Bin A-01 (Fabric Inspection)',
  'Master Cutting': 'Rack C-04 (Pattern & Cut Pieces)',
  'Zardozi/Aari Embroidery': 'Embroidery Frame E-02',
  'Stitching Assembly': 'Bay S-08 (Assembly Workstation)',
  'QC & Ready for Delivery': 'Dispatch Rack D-12 (Ready for Delivery)',
};

export const STAGE_PROGRESS_MAP: Record<KanbanStage, number> = {
  'Fabric Inspection': 20,
  'Master Cutting': 40,
  'Zardozi/Aari Embroidery': 60,
  'Stitching Assembly': 80,
  'QC & Ready for Delivery': 100,
};

export const GARMENT_BASE_SAM_MAP: Record<string, number> = {
  'Shirt': 60,
  'mens-shirt': 60,
  'Trouser': 90,
  'mens-trouser': 90,
  'Kurta': 90,
  'mens-kurta': 90,
  'Blouse': 120,
  'Sari Blouse': 120,
  'womens-blouse': 120,
  'Bandhgala': 180,
  'mens-bandhgala': 180,
  'Corset': 180,
  'womens-corset': 180,
  'Sherwani': 210,
  'mens-sherwani': 210,
  'Suit': 240,
  '2-Piece Suit': 240,
  'mens-suit': 240,
  'Gown': 240,
  'womens-gown': 240,
  'Anarkali': 270,
  'womens-anarkali': 270,
  'Lehenga': 300,
  'Lehenga Choli': 300,
  'womens-lehenga': 300,
  '3-Piece Suit': 300,
  'mens-suit-3pc': 300,
};

export const STAGE_CONFIG: Record<KanbanStage, StageStyleConfig> = {
  'Fabric Inspection': {
    label: 'Fabric Inspection',
    defaultRack: 'Bin A-01 (Fabric Inspection)',
    headerBadgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    headerTextColor: 'text-slate-300',
    accentBorder: 'border-t-slate-500',
    dotColor: 'bg-slate-400',
    progressGradient: 'bg-slate-400',
    targetProgress: 20,
  },
  'Master Cutting': {
    label: 'Master Cutting',
    defaultRack: 'Rack C-04 (Pattern & Cut Pieces)',
    headerBadgeColor: 'bg-gold-500/10 text-gold-400 border border-gold-500/30',
    headerTextColor: 'text-gold-400',
    accentBorder: 'border-t-gold-500',
    dotColor: 'bg-gold-400',
    progressGradient: 'bg-gradient-to-r from-gold-600 to-gold-400',
    targetProgress: 40,
  },
  'Zardozi/Aari Embroidery': {
    label: 'Zardozi/Aari Embroidery',
    defaultRack: 'Embroidery Frame E-02',
    headerBadgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    headerTextColor: 'text-amber-400',
    accentBorder: 'border-t-amber-500',
    dotColor: 'bg-amber-400',
    progressGradient: 'bg-gradient-to-r from-amber-600 to-amber-400',
    targetProgress: 60,
  },
  'Stitching Assembly': {
    label: 'Stitching Assembly',
    defaultRack: 'Bay S-08 (Assembly Workstation)',
    headerBadgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    headerTextColor: 'text-blue-400',
    accentBorder: 'border-t-blue-500',
    dotColor: 'bg-blue-400',
    progressGradient: 'bg-gradient-to-r from-blue-600 to-blue-400',
    targetProgress: 80,
  },
  'QC & Ready for Delivery': {
    label: 'QC & Ready for Delivery',
    defaultRack: 'Dispatch Rack D-12 (Ready for Delivery)',
    headerBadgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    headerTextColor: 'text-emerald-400',
    accentBorder: 'border-t-emerald-500',
    dotColor: 'bg-emerald-400',
    progressGradient: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    targetProgress: 100,
  },
};

export const DEFAULT_KARIGAR_LIST = [
  'All Karigars',
  'Karigar Latif',
  'Karigar Salim',
  'Karigar Usman',
  'Karigar Ahmed',
  'Karigar Rafi',
] as const;

export const DEFAULT_GARMENT_FILTER_LIST = [
  'All Garments',
  'Sherwani',
  'Lehenga Choli',
  'Sari Blouse',
  'Bandhgala',
  'Anarkali',
  'Suit',
  'Kurta',
] as const;

export const INITIAL_JOB_CARDS: JobCardItem[] = [
  {
    id: 'JC-9035',
    orderId: 'YH-ORD-1042',
    client: 'Aditya Birla',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 85,
    samTotalEstimate: 210,
    priority: 'Urgent',
    dueDate: '2026-09-20',
    progress: 40,
    stage: 'Master Cutting',
    fabricDetails: 'Pure Silk Brocade / Raw Silk Lining',
    notes: 'Sloped shoulder profile offset applied. Gold zardozi cuffs require adda frame #2.',
    rack: 'Rack C-04 (Pattern & Cut Pieces)',
    barcodeEnabled: true,
    qrCodeEnabled: true,
    history: [
      { action: 'Job created from Order YH-ORD-1042', timestamp: '2026-09-10T10:00:00Z', stage: 'Fabric Inspection' },
      { action: 'Stage moved to Master Cutting', timestamp: '2026-09-12T14:30:00Z', stage: 'Master Cutting' },
    ],
  },
  {
    id: 'JC-9038',
    orderId: 'YH-ORD-1039',
    client: 'Kavita Singhania',
    garment: 'Lehenga Choli',
    karigar: 'Karigar Salim',
    samMinutesLogged: 160,
    samTotalEstimate: 300,
    priority: 'Urgent',
    dueDate: '2026-09-18',
    progress: 60,
    stage: 'Zardozi/Aari Embroidery',
    fabricDetails: 'Raw Silk, Zari Embroidery Thread, Organza Dupatta',
    notes: '24-kali flare construction with heavy adda embroidery. Master trial scheduled Sept 17.',
    rack: 'Embroidery Frame E-02',
    barcodeEnabled: true,
    qrCodeEnabled: true,
    history: [
      { action: 'Job created from Order YH-ORD-1039', timestamp: '2026-09-08T09:00:00Z', stage: 'Fabric Inspection' },
      { action: 'Stage moved to Master Cutting', timestamp: '2026-09-09T11:00:00Z', stage: 'Master Cutting' },
      { action: 'Stage moved to Zardozi/Aari Embroidery', timestamp: '2026-09-11T16:00:00Z', stage: 'Zardozi/Aari Embroidery' },
    ],
  },
  {
    id: 'JC-9041',
    orderId: 'YH-ORD-1045',
    client: 'Vikramaditya Oberoi',
    garment: 'Suit',
    karigar: 'Karigar Usman',
    samMinutesLogged: 190,
    samTotalEstimate: 240,
    priority: 'Normal',
    dueDate: '2026-09-24',
    progress: 80,
    stage: 'Stitching Assembly',
    fabricDetails: 'Super 150s Merino Wool (Holland & Sherry Charcoal)',
    notes: 'English cut double-breasted jacket. Hand canvassed chest pad with horsehair.',
    rack: 'Bay S-08 (Assembly Workstation)',
    barcodeEnabled: true,
    qrCodeEnabled: true,
    history: [
      { action: 'Job created', timestamp: '2026-09-05T09:30:00Z', stage: 'Fabric Inspection' },
      { action: 'Stage moved to Master Cutting', timestamp: '2026-09-07T11:00:00Z', stage: 'Master Cutting' },
      { action: 'Stage moved to Zardozi/Aari Embroidery', timestamp: '2026-09-08T15:00:00Z', stage: 'Zardozi/Aari Embroidery' },
      { action: 'Stage moved to Stitching Assembly', timestamp: '2026-09-13T10:00:00Z', stage: 'Stitching Assembly' },
    ],
  },
  {
    id: 'JC-9044',
    orderId: 'YH-ORD-1048',
    client: 'Meera Nambiar',
    garment: 'Sari Blouse',
    karigar: 'Karigar Ahmed',
    samMinutesLogged: 120,
    samTotalEstimate: 120,
    priority: 'Normal',
    dueDate: '2026-09-16',
    progress: 100,
    stage: 'QC & Ready for Delivery',
    fabricDetails: 'Kanjeevaram Silk Border with Pure Crepe Body',
    notes: 'Sweetheart neckline, deep back cut with golden dori latkans. Final QC passed.',
    rack: 'Dispatch Rack D-12 (Ready for Delivery)',
    barcodeEnabled: true,
    qrCodeEnabled: true,
    history: [
      { action: 'Job created', timestamp: '2026-09-11T12:00:00Z', stage: 'Fabric Inspection' },
      { action: 'Stage moved to Master Cutting', timestamp: '2026-09-12T14:00:00Z', stage: 'Master Cutting' },
      { action: 'Stage moved to Stitching Assembly', timestamp: '2026-09-13T16:00:00Z', stage: 'Stitching Assembly' },
      { action: 'Stage moved to QC & Ready for Delivery', timestamp: '2026-09-14T17:30:00Z', stage: 'QC & Ready for Delivery' },
    ],
  },
  {
    id: 'JC-9047',
    orderId: 'YH-ORD-1051',
    client: 'Rahul Khanna',
    garment: 'Bandhgala',
    karigar: 'Karigar Rafi',
    samMinutesLogged: 20,
    samTotalEstimate: 180,
    priority: 'Normal',
    dueDate: '2026-09-28',
    progress: 20,
    stage: 'Fabric Inspection',
    fabricDetails: 'Midnight Blue Italian Velvet',
    notes: 'Mandarin collar closure with bone buttons. Zari count check verified.',
    rack: 'Bin A-01 (Fabric Inspection)',
    barcodeEnabled: true,
    qrCodeEnabled: true,
    history: [
      { action: 'Job created', timestamp: '2026-09-14T09:00:00Z', stage: 'Fabric Inspection' },
    ],
  },
];

export const INITIAL_TIMESHEET_LOGS: TimesheetLog[] = [
  {
    id: 'TS-1001',
    date: '2026-09-14',
    karigar: 'Karigar Latif',
    jobId: 'JC-9035',
    orderId: 'YH-ORD-1042',
    garment: 'Sherwani',
    stage: 'Master Cutting',
    task: 'Pattern Master Drafting & Scissor Cuts',
    sam: 60,
    minutesLogged: 60,
    rate: 42,
    status: 'Disbursed',
  },
  {
    id: 'TS-1002',
    date: '2026-09-14',
    karigar: 'Karigar Salim',
    jobId: 'JC-9038',
    orderId: 'YH-ORD-1039',
    garment: 'Lehenga Choli',
    stage: 'Zardozi/Aari Embroidery',
    task: '24-Kali Adda Frame Zardozi Handwork',
    sam: 120,
    minutesLogged: 120,
    rate: 42,
    status: 'Logged',
  },
  {
    id: 'TS-1003',
    date: '2026-09-13',
    karigar: 'Karigar Usman',
    jobId: 'JC-9041',
    orderId: 'YH-ORD-1045',
    garment: 'Suit',
    stage: 'Stitching Assembly',
    task: 'Full Canvas Chest Pad & Bodice Seams',
    sam: 90,
    minutesLogged: 90,
    rate: 42,
    status: 'Disbursed',
  },
  {
    id: 'TS-1004',
    date: '2026-09-13',
    karigar: 'Karigar Ahmed',
    jobId: 'JC-9044',
    orderId: 'YH-ORD-1048',
    garment: 'Sari Blouse',
    stage: 'QC & Ready for Delivery',
    task: '18-Point QC & Hand Steam Pressing',
    sam: 45,
    minutesLogged: 45,
    rate: 42,
    status: 'Disbursed',
  },
  {
    id: 'TS-1005',
    date: '2026-09-12',
    karigar: 'Karigar Rafi',
    jobId: 'JC-9047',
    orderId: 'YH-ORD-1051',
    garment: 'Bandhgala',
    stage: 'Fabric Inspection',
    task: 'Velvet Bolt Unrolling & Zari Count Verification',
    sam: 20,
    minutesLogged: 20,
    rate: 42,
    status: 'Logged',
  },
];

// ============================================================
// 3. PURE STAGE TRANSITION FUNCTIONS
// ============================================================

export function getStageIndex(stage: KanbanStage): number {
  return KANBAN_STAGES.indexOf(stage);
}

/**
 * Validates single-step stage transitions.
 * Enforces Math.abs(targetIndex - currentIndex) <= 1.
 */
export function isTransitionAllowed(fromStage: KanbanStage, toStage: KanbanStage): boolean {
  const fromIdx = KANBAN_STAGES.indexOf(fromStage);
  const toIdx = KANBAN_STAGES.indexOf(toStage);
  if (fromIdx === -1 || toIdx === -1) return false;
  return Math.abs(fromIdx - toIdx) <= 1;
}

export function canTransitionStage(fromStage: KanbanStage, toStage: KanbanStage): boolean {
  return isTransitionAllowed(fromStage, toStage);
}

export function getNextStage(stage: KanbanStage): KanbanStage | null {
  const idx = KANBAN_STAGES.indexOf(stage);
  if (idx === -1 || idx >= KANBAN_STAGES.length - 1) return null;
  return KANBAN_STAGES[idx + 1];
}

export function getPrevStage(stage: KanbanStage): KanbanStage | null {
  const idx = KANBAN_STAGES.indexOf(stage);
  if (idx <= 0) return null;
  return KANBAN_STAGES[idx - 1];
}

export function computeKanbanProgress(stage: KanbanStage): number {
  if (stage === 'QC & Ready for Delivery') return 100;
  const idx = KANBAN_STAGES.indexOf(stage);
  if (idx === -1) return 0;
  return Math.min(100, Math.max(15, (idx + 1) * 20));
}

export function getProgressForKanbanStage(stage: KanbanStage): number {
  return STAGE_PROGRESS_MAP[stage] ?? computeKanbanProgress(stage);
}

export function getDefaultRackForStage(stage: KanbanStage): string {
  return STAGE_RACK_MAPPING[stage] ?? 'Storage Rack General';
}

/**
 * Evaluates and applies a stage transition to a job card.
 */
export function executeStageTransition(
  job: JobCardItem,
  toStage: KanbanStage
): { success: boolean; job?: JobCardItem; updatedJob?: JobCardItem; error?: string } {
  if (!isTransitionAllowed(job.stage, toStage)) {
    return {
      success: false,
      error: `Invalid transition: Cannot jump from '${job.stage}' to '${toStage}'. Only single-step transitions are allowed.`,
    };
  }

  const newProgress = computeKanbanProgress(toStage);
  const historyEntry: JobCardHistoryEntry = {
    action: `Stage moved from ${job.stage} to ${toStage}`,
    timestamp: new Date().toISOString(),
    stage: toStage,
  };

  const updated: JobCardItem = {
    ...job,
    stage: toStage,
    progress: newProgress,
    rack: getDefaultRackForStage(toStage),
    history: job.history ? [...job.history, historyEntry] : [historyEntry],
  };

  return { success: true, job: updated, updatedJob: updated };
}

// ============================================================
// 4. PIECE-RATE & SAM EFFICIENCY CALCULATIONS
// ============================================================

/**
 * Strictly calculates artisan piece-rate earnings at ₹42/minute rate.
 */
export function calculatePieceRateEarnings(
  minutesLogged: number,
  rate: number = PIECE_RATE_PER_MINUTE
): number {
  if (minutesLogged <= 0 || isNaN(minutesLogged) || !isFinite(minutesLogged)) return 0;
  return Math.round(minutesLogged * rate);
}

export function calculatePieceRatePayout(
  samMinutes: number,
  rate: number = PIECE_RATE_PER_MINUTE
): number {
  return calculatePieceRateEarnings(samMinutes, rate);
}

/**
 * Calculates aggregate earnings for a timesheet log array.
 */
export function calculateTimesheetEarnings(
  logs: { minutesLogged?: number; sam?: number }[],
  rate: number = PIECE_RATE_PER_MINUTE
): { totalMinutes: number; totalEarningsInr: number } {
  const totalMinutes = logs.reduce((acc, l) => {
    const raw = l.minutesLogged ?? l.sam ?? 0;
    const mins = raw > 0 && isFinite(raw) ? raw : 0;
    return acc + mins;
  }, 0);
  const totalEarningsInr = Math.round(totalMinutes * rate);
  return { totalMinutes, totalEarningsInr };
}

/**
 * Computes artisan SAM efficiency yield: (Estimated SAM / Actual Minutes Logged) * 100.
 */
export function calculateSamEfficiency(samEstimated: number, minutesLogged: number): number {
  if (minutesLogged <= 0 || samEstimated <= 0 || !isFinite(minutesLogged) || !isFinite(samEstimated)) return 0;
  return Number(((samEstimated / minutesLogged) * 100).toFixed(1));
}

// ============================================================
// 5. TIME & CURRENCY FORMATTERS
// ============================================================

/**
 * Formats active garment timer seconds into HH:MM:SS or MM:SS.
 */
export function formatTimerDuration(totalSeconds: number): string {
  if (totalSeconds < 0 || isNaN(totalSeconds) || !isFinite(totalSeconds)) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  return formatTimerDuration(seconds);
}

export function formatLaborTime(totalMinutes: number): { hours: number; minutes: number; formatted: string } {
  if (totalMinutes <= 0 || isNaN(totalMinutes) || !isFinite(totalMinutes)) {
    return { hours: 0, minutes: 0, formatted: '0h 0m' };
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`,
  };
}

export function formatInrCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function getGarmentBadgeClass(garment: string): string {
  const g = (garment || '').toLowerCase();
  if (g.includes('sherwani')) return 'badge-gold';
  if (g.includes('lehenga') || g.includes('anarkali')) return 'badge-amber';
  if (g.includes('suit') || g.includes('bandhgala')) return 'badge-blue';
  if (g.includes('blouse') || g.includes('sari')) return 'badge-rose';
  return 'badge-gold';
}

// ============================================================
// 6. TIMESHEET AGGREGATION & CSV EXPORT
// ============================================================

export function aggregateDailyTimesheet(logs: TimesheetLog[], targetDate?: string): DailyArtisanRollup {
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  const dailyLogs = logs.filter((l) => l.date === dateStr);
  const totalMinutes = dailyLogs.reduce((acc, l) => acc + (l.sam || l.minutesLogged || 0), 0);
  return {
    date: dateStr,
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    totalEarningsINR: calculatePieceRateEarnings(totalMinutes),
    logsCount: dailyLogs.length,
  };
}

export function aggregateWeeklyTimesheet(logs: TimesheetLog[], weekDates: string[]): WeeklyArtisanRollup[] {
  const karigars = Array.from(new Set(logs.map((l) => l.karigar)));
  return karigars.map((karigar) => {
    const karigarLogs = logs.filter((l) => l.karigar === karigar && weekDates.includes(l.date));
    const dailyMinutes: Record<string, number> = {};
    for (const d of weekDates) {
      dailyMinutes[d] = 0;
    }
    let totalSamMinutes = 0;
    let loggedEarningsINR = 0;
    let disbursedEarningsINR = 0;

    for (const l of karigarLogs) {
      const mins = l.sam || l.minutesLogged || 0;
      dailyMinutes[l.date] = (dailyMinutes[l.date] || 0) + mins;
      totalSamMinutes += mins;
      const rate = l.rate || PIECE_RATE_PER_MINUTE;
      const amount = mins * rate;
      if (l.status === 'Disbursed') {
        disbursedEarningsINR += amount;
      } else {
        loggedEarningsINR += amount;
      }
    }

    return {
      karigar,
      dailyMinutes,
      totalSamMinutes,
      totalLaborHours: Number((totalSamMinutes / 60).toFixed(1)),
      totalEarningsINR: totalSamMinutes * PIECE_RATE_PER_MINUTE,
      loggedEarningsINR,
      disbursedEarningsINR,
    };
  });
}

export function aggregateWeeklyTimesheets(logs: TimesheetLog[], weekDates: string[]): WeeklyArtisanRollup[] {
  return aggregateWeeklyTimesheet(logs, weekDates);
}

export function generateTimesheetCsv(logs: TimesheetLog[]): string {
  const headers = [
    'Log ID',
    'Date',
    'Artisan',
    'Job Card ID',
    'Garment',
    'Workshop Stage',
    'Task Description',
    'SAM Minutes',
    'Rate (₹/min)',
    'Gross Earned (₹)',
    'Payout Status',
  ];

  const rows = logs.map((log) => {
    const mins = log.sam || log.minutesLogged || 0;
    const rate = log.rate || PIECE_RATE_PER_MINUTE;
    return [
      `"${log.id}"`,
      `"${log.date}"`,
      `"${log.karigar}"`,
      `"${log.jobId}"`,
      `"${log.garment}"`,
      `"${log.stage}"`,
      `"${log.task}"`,
      mins,
      rate,
      mins * rate,
      `"${log.status}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
