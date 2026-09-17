'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building2,
  Briefcase,
  Check,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Lock,
  X,
  Edit2,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Printer,
  Sparkles,
  Zap,
  DollarSign,
  TrendingUp,
  Cpu,
  Power,
  RotateCcw,
} from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { ScheduleListPrint } from '@/components/print-layouts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Input } from '@/components/ui/input';
import {
  PlatformRole,
  StaffRole,
  StaffStatus,
  StaffMember,
  StaffFormDraft,
  SkillSpecialization,
  WorkStation,
  PLATFORM_ROLES,
  ROLE_CONFIGS,
  SKILL_SPECIALIZATIONS,
  WORK_STATIONS,
  INITIAL_STAFF,
  getRoleBadgeClass,
  getRoleBadgeVariant,
  getStatusBadgeVariant,
  isValidPlatformRole,
} from '@/lib/staff-utils';
import { formatInrCurrency } from '@/lib/production-utils';

export default function StaffPage() {
  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [activeTab, setActiveTab] = useState<'directory' | 'timesheets'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals & Details
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Timesheet Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 1)); // Sept 2026

  // In-flight form draft state
  const [newStaffForm, setNewStaffForm] = useState<StaffFormDraft>({
    name: '',
    email: '',
    phone: '',
    role: 'KARIGAR',
    branch: 'Main Flagship',
    skills: ['Pattern Drafting & CAD'],
    assignedStation: 'Cutting Table A',
    weeklyCapacityHours: 48,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // Persistence & Draft Restoration
  // --------------------------------------------------------------------------
  useEffect(() => {
    const stored = getLocalStorage<StaffMember[]>('yh_staff', INITIAL_STAFF);
    setStaffList(stored);

    // Restore draft if any
    const savedDraft = getLocalStorage<StaffFormDraft | null>('yh_staff_draft', null);
    if (savedDraft) {
      setNewStaffForm(savedDraft);
    }
  }, []);

  const persistStaffList = (updated: StaffMember[]) => {
    setStaffList(updated);
    setLocalStorage('yh_staff', updated);
  };

  const handleDraftChange = (field: keyof StaffFormDraft, value: any) => {
    const updated = { ...newStaffForm, [field]: value };
    setNewStaffForm(updated);
    setLocalStorage('yh_staff_draft', updated);
  };

  // --------------------------------------------------------------------------
  // Operational Status Toggle (Active ↔ Inactive)
  // --------------------------------------------------------------------------
  const handleToggleOperationalStatus = (staffId: string) => {
    const updated = staffList.map((m) => {
      if (m.id === staffId) {
        const nextStatus: StaffStatus = m.status === 'Active' ? 'Inactive' : 'Active';
        return {
          ...m,
          status: nextStatus,
        };
      }
      return m;
    });

    persistStaffList(updated);
    const target = updated.find((m) => m.id === staffId);
    showToast(`${target?.name} is now ${target?.status}`);
  };

  // --------------------------------------------------------------------------
  // Recruitment & Management Actions
  // --------------------------------------------------------------------------
  const handleRecruitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email) {
      showToast('Name and email are required.');
      return;
    }

    const nextId = `st-${String(staffList.length + 1).padStart(2, '0')}`;
    const newMember: StaffMember = {
      id: nextId,
      name: newStaffForm.name,
      email: newStaffForm.email,
      phone: newStaffForm.phone || '+91 98765 00000',
      role: newStaffForm.role,
      branch: newStaffForm.branch,
      status: 'Active',
      hiredAt: new Date().toISOString().split('T')[0],
      skills: newStaffForm.skills,
      assignedStation: newStaffForm.assignedStation,
      specialization: newStaffForm.skills.join(', '),
      workstation: newStaffForm.assignedStation,
      weeklyCapacityHours: newStaffForm.weeklyCapacityHours || 48,
      weeklyHours: newStaffForm.weeklyCapacityHours || 48,
      telemetry: {
        samEfficiencyPercent: 100,
        activeJobsCount: 0,
        completedOrdersThisMonth: 0,
        weeklyHoursLogged: 0,
        weeklyHoursCapacity: newStaffForm.weeklyCapacityHours || 48,
        pieceRateEarnedThisMonth: 0,
        qualityPassRatePercent: 100,
      },
      notes: 'New atelier specialist enrolled.',
    };

    const updated = [...staffList, newMember];
    persistStaffList(updated);
    removeLocalStorage('yh_staff_draft');

    setShowRecruitModal(false);
    setNewStaffForm({
      name: '',
      email: '',
      phone: '',
      role: 'KARIGAR',
      branch: 'Main Flagship',
      skills: ['Zardozi Embroidery'],
      assignedStation: 'Embroidery Frame #1',
      weeklyCapacityHours: 48,
    });
    showToast(`Specialist ${newMember.name} recruited as ${newMember.role}`);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff || !editForm) return;

    const updated = staffList.map((m) => {
      if (m.id === selectedStaff.id) {
        return {
          ...m,
          ...editForm,
        };
      }
      return m;
    });

    persistStaffList(updated);
    const updatedSelected = updated.find((m) => m.id === selectedStaff.id) || null;
    setSelectedStaff(updatedSelected);
    setIsEditing(false);
    showToast(`Updated details for ${selectedStaff.name}`);
  };

  const handleDeleteStaff = (staffId: string) => {
    const updated = staffList.filter((m) => m.id !== staffId);
    persistStaffList(updated);
    setSelectedStaff(null);
    showToast(`Staff member archived from atelier directory.`);
  };

  // --------------------------------------------------------------------------
  // Filtering & Computed Metrics
  // --------------------------------------------------------------------------
  const filteredStaff = useMemo(() => {
    return staffList.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.specialization && m.specialization.toLowerCase().includes(q)) ||
        (m.skills && m.skills.some((s) => s.toLowerCase().includes(q)));

      const matchesRole = selectedRole === 'ALL' || m.role === selectedRole;
      const matchesBranch = selectedBranch === 'ALL' || m.branch === selectedBranch;
      const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [staffList, searchQuery, selectedRole, selectedBranch, selectedStatus]);

  const branches = useMemo(() => {
    return Array.from(new Set(staffList.map((m) => m.branch)));
  }, [staffList]);

  // Statistics
  const activeCount = staffList.filter((m) => m.status === 'Active').length;
  const karigarCount = staffList.filter((m) => m.role === 'KARIGAR').length;
  const totalPayrollAccrued = staffList.reduce(
    (acc, m) => acc + (m.telemetry?.pieceRateEarnedThisMonth || 0),
    0
  );

  // --------------------------------------------------------------------------
  // Calendar Days Calculation for Timesheets
  // --------------------------------------------------------------------------
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth]);

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

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-display">Staff & Roster Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                7 Platform Roles • Operational Status Switches • Skill Specializations • Artisan Capacity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: 'directory', label: 'Team Directory', icon: <Users className="w-3.5 h-3.5 mr-1" /> },
              { value: 'timesheets', label: 'Attendance & Calendar', icon: <Calendar className="w-3.5 h-3.5 mr-1" /> },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'directory' | 'timesheets')}
            size="sm"
          />

          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowRecruitModal(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Recruit Specialist
          </Button>
        </div>
      </div>

      {/* KPI STAT TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Total Staff Roster</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums font-display">{staffList.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {activeCount} Active Specialists • {staffList.length - activeCount} Inactive
          </div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Workshop Karigars</div>
          <div className="text-2xl font-bold text-amber-300 mt-1 tabular-nums font-display">{karigarCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Embroidery, Cutting & Assembly</div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Platform Roles Covered</div>
          <div className="text-2xl font-bold text-blue-400 mt-1 tabular-nums font-display">
            {new Set(staffList.map((s) => s.role)).size} / 7
          </div>
          <div className="text-[10px] text-blue-300/80 mt-0.5">All 7 platform roles supported</div>
        </Card>

        <Card variant="glass" padding="sm">
          <div className="text-[11px] font-medium text-slate-400">Monthly Piece-Rate Accrual</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums font-display">
            {formatInrCurrency(totalPayrollAccrued)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Calculated strictly at ₹42/minute</div>
        </Card>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: TEAM DIRECTORY VIEW */}
      {/* ==================================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <Card variant="glass" padding="sm" className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <Input
                placeholder="Search staff by name, email, role, or craft skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                inputSize="sm"
                shape="squircle"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Role filter with all 7 roles */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                <option value="ALL" className="bg-slate-900">All 7 Platform Roles</option>
                {ROLE_CONFIGS.map((r) => (
                  <option key={r.role} value={r.role} className="bg-slate-900">
                    {r.label} ({r.role})
                  </option>
                ))}
              </select>

              {/* Branch filter */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                <option value="ALL" className="bg-slate-900">All Atelier Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-slate-900">
                    {b}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              >
                <option value="ALL" className="bg-slate-900">All Operational Statuses</option>
                <option value="Active" className="bg-slate-900">Active Only</option>
                <option value="Inactive" className="bg-slate-900">Inactive Only</option>
                <option value="On Leave" className="bg-slate-900">On Leave</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
              </select>
            </div>
          </Card>

          {/* STAFF CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStaff.map((member) => {
              const roleVariant = getRoleBadgeVariant(member.role);
              const statusVariant = getStatusBadgeVariant(member.status);
              const isActive = member.status === 'Active';
              const capacityHours = member.weeklyCapacityHours || 48;
              const loggedHours = member.telemetry?.weeklyHoursLogged || 0;
              const loadPercent = Math.min(100, (loggedHours / capacityHours) * 100);

              return (
                <Card
                  key={member.id}
                  variant="glass"
                  padding="sm"
                  onClick={() => {
                    setSelectedStaff(member);
                    setIsEditing(false);
                  }}
                  hoverable
                  className={`relative transition-all duration-300 border-l-4 ${
                    isActive ? 'border-l-emerald-500' : 'border-l-slate-600 opacity-75'
                  }`}
                >
                  {/* Header: Member Info & Operational Toggle */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">{member.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={roleVariant as any} size="sm">
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Operational Status Switch Pill */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-white/5 my-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-slate-300">
                        Operational: <strong className={isActive ? 'text-emerald-300' : 'text-slate-400'}>{member.status}</strong>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOperationalStatus(member.id);
                      }}
                      title="Toggle Operational Status"
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Station & Branch Details */}
                  <div className="space-y-1 text-[11px] text-slate-300 my-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Branch:</span>
                      <span className="text-slate-200 font-medium">{member.branch}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Workstation:</span>
                      <span className="text-amber-300 font-medium">
                        {member.assignedStation || member.workstation || 'Floor General'}
                      </span>
                    </div>
                    {member.telemetry?.pieceRateEarnedThisMonth ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Piece-Rate MTD:</span>
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {formatInrCurrency(member.telemetry.pieceRateEarnedThisMonth)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Weekly Hours Capacity Utilization Progress Bar */}
                  <div className="mt-2.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Weekly Capacity Load</span>
                      <span className="tabular-nums font-semibold text-slate-200">
                        {loggedHours} / {capacityHours} hrs ({Math.round(loadPercent)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          loadPercent > 90
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Craft Skills Tags */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-white/5">
                      {member.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="text-[9px] text-slate-500 self-center">
                          +{member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredStaff.length === 0 && (
            <Card variant="glass" padding="lg" className="text-center py-16 space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No matching staff members found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adjust your search or filter settings to view specialists.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ATTENDANCE & TIMESHEET CALENDAR VIEW */}
      {/* ==================================================================== */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          <Card variant="glass" padding="md" className="space-y-4">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-display">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Attendance Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Present & Clocked (Full Shift)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Half Shift</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Absent / Unscheduled</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1 text-slate-500 font-bold uppercase text-[10px]">
                  {d}
                </div>
              ))}

              {calendarDays.map((dayNum, idx) => {
                if (!dayNum) {
                  return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-900/20" />;
                }

                const isSunday = (idx % 7) === 0;
                const isPast = dayNum <= 15;

                return (
                  <div
                    key={`day-${dayNum}`}
                    className="h-20 p-1.5 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col justify-between text-left hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{dayNum}</span>
                      {isPast && !isSunday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>

                    {!isSunday && isPast ? (
                      <div className="text-[10px] text-amber-300 font-mono">
                        {(dayNum % 2 === 0 ? 8 : 7.5)} hrs
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-600 italic">
                        {isSunday ? 'Rest Day' : 'Upcoming'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: SPECIALIST DETAIL & EDIT PROFILE */}
      {/* ==================================================================== */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <Card variant="elevated" padding="none" className="w-full max-w-xl bg-slate-900/95 border-white/15">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">{selectedStaff.name}</h2>
                  <Badge variant={getRoleBadgeVariant(selectedStaff.role) as any} size="sm">
                    {selectedStaff.role}
                  </Badge>
                  <Badge variant={selectedStaff.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {selectedStaff.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedStaff.email} • ID: {selectedStaff.id}</p>
              </div>

              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedStaff(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    label="Full Name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    inputSize="sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Phone"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      inputSize="sm"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Role</label>
                      <select
                        value={editForm.role || 'KARIGAR'}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        {ROLE_CONFIGS.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Workstation</label>
                      <select
                        value={editForm.assignedStation || 'Cutting Table A'}
                        onChange={(e) => setEditForm({ ...editForm, assignedStation: e.target.value as any })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        {WORK_STATIONS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Weekly Hours Capacity"
                      type="number"
                      value={String(editForm.weeklyCapacityHours || 48)}
                      onChange={(e) =>
                        setEditForm({ ...editForm, weeklyCapacityHours: Number(e.target.value) || 48 })
                      }
                      inputSize="sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="gold" size="sm" onClick={handleSaveEdit}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Telemetry Tile Summary */}
                  {selectedStaff.telemetry && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                        <div className="text-[10px] text-slate-400">SAM Efficiency</div>
                        <div className="text-base font-bold text-amber-300 mt-1 tabular-nums">
                          {selectedStaff.telemetry.samEfficiencyPercent}%
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                        <div className="text-[10px] text-slate-400">Active Jobs</div>
                        <div className="text-base font-bold text-white mt-1 tabular-nums">
                          {selectedStaff.telemetry.activeJobsCount}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-800/40 border border-white/5">
                        <div className="text-[10px] text-slate-400">Pass Rate</div>
                        <div className="text-base font-bold text-emerald-400 mt-1 tabular-nums">
                          {selectedStaff.telemetry.qualityPassRatePercent}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Demographics */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/30 border border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Phone</span>
                      <span className="text-slate-200 font-mono">{selectedStaff.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Branch</span>
                      <span className="text-slate-200">{selectedStaff.branch}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Assigned Workstation</span>
                      <span className="text-amber-300">{selectedStaff.assignedStation || 'Floor'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Hired Date</span>
                      <span className="text-slate-200">{selectedStaff.hiredAt}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Artisan Craft Specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStaff.skills?.map((s) => (
                        <Badge key={s} variant="neutral" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedStaff.notes && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Specialist Notes
                      </span>
                      <p className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-slate-300 text-xs">
                        {selectedStaff.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteStaff(selectedStaff.id)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Archive Member
              </Button>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditForm(selectedStaff);
                      setIsEditing(true);
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: RECRUIT SPECIALIST MODAL */}
      {/* ==================================================================== */}
      {showRecruitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <Card variant="elevated" padding="none" className="w-full max-w-lg bg-slate-900/95 border-white/15">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display">Enroll Atelier Specialist</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowRecruitModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleRecruitSubmit} className="p-6 space-y-4 text-xs">
              <Input
                label="Full Name"
                placeholder="e.g. Master Ustad Latif"
                value={newStaffForm.name}
                onChange={(e) => handleDraftChange('name', e.target.value)}
                required
                inputSize="sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email (Login ID)"
                  type="email"
                  placeholder="specialist@yellowhouse.com"
                  value={newStaffForm.email}
                  onChange={(e) => handleDraftChange('email', e.target.value)}
                  required
                  inputSize="sm"
                />
                <Input
                  label="Contact Phone"
                  placeholder="+91 98765 11000"
                  value={newStaffForm.phone}
                  onChange={(e) => handleDraftChange('phone', e.target.value)}
                  inputSize="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform Role</label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => handleDraftChange('role', e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    {ROLE_CONFIGS.map((r) => (
                      <option key={r.role} value={r.role} className="bg-slate-900">
                        {r.label} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Workstation</label>
                  <select
                    value={newStaffForm.assignedStation}
                    onChange={(e) => handleDraftChange('assignedStation', e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    {WORK_STATIONS.map((w) => (
                      <option key={w} value={w} className="bg-slate-900">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Atelier Branch"
                  value={newStaffForm.branch}
                  onChange={(e) => handleDraftChange('branch', e.target.value)}
                  inputSize="sm"
                />
                <Input
                  label="Weekly Hours Capacity"
                  type="number"
                  value={String(newStaffForm.weeklyCapacityHours)}
                  onChange={(e) => handleDraftChange('weeklyCapacityHours', Number(e.target.value) || 48)}
                  inputSize="sm"
                />
              </div>

              {/* Skills Multi-Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Artisan Craft Specialties</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-800/40 border border-white/5 max-h-36 overflow-y-auto">
                  {SKILL_SPECIALIZATIONS.map((skill) => {
                    const isChecked = newStaffForm.skills?.includes(skill);
                    return (
                      <label key={skill} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = newStaffForm.skills || [];
                            const updated = e.target.checked
                              ? [...cur, skill]
                              : cur.filter((s) => s !== skill);
                            handleDraftChange('skills', updated);
                          }}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                        />
                        <span>{skill}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowRecruitModal(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Recruit Specialist
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
