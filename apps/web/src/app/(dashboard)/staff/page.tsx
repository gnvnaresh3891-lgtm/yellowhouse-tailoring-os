'use client';

import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Pending';
  hiredAt: string;
}

interface StaffFormDraft {
  name: string;
  email: string;
  role: string;
  branch: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 'st-01', name: 'Master Latif Khan', email: 'master@yellowhouse.com', role: 'MASTER_TAILOR', branch: 'Main Flagship', status: 'Active', hiredAt: '2026-01-15' },
  { id: 'st-02', name: 'Sarah Jenkins', email: 'manager@yellowhouse.com', role: 'BRANCH_MANAGER', branch: 'Main Flagship', status: 'Active', hiredAt: '2026-02-10' },
  { id: 'st-03', name: 'Rafi Craftsman', email: 'karigar@yellowhouse.com', role: 'KARIGAR', branch: 'Main Flagship', status: 'Active', hiredAt: '2026-03-01' },
  { id: 'st-04', name: 'Anik Dev', email: 'receptionist@yellowhouse.com', role: 'RECEPTIONIST', branch: 'West End Salon', status: 'Active', hiredAt: '2026-04-12' },
  { id: 'st-05', name: 'Priya Mehta', email: 'billing@yellowhouse.com', role: 'ACCOUNTANT', branch: 'Main Flagship', status: 'Pending', hiredAt: '2026-08-01' },
];

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'TENANT_OWNER':
      return 'badge badge-gold';
    case 'BRANCH_MANAGER':
      return 'badge badge-blue';
    case 'MASTER_TAILOR':
      return 'badge badge-amber';
    case 'RECEPTIONIST':
      return 'badge badge-emerald';
    case 'KARIGAR':
      return 'badge badge-rose';
    case 'ACCOUNTANT':
      return 'badge badge-blue';
    default:
      return 'badge badge-gold';
  }
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'timesheets'>('directory');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun (0-6)
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const attendanceData = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    
    const activeStaff = staffList.filter(s => s.status === 'Active');
    const data: Record<string, Record<number, string>> = {};
    
    activeStaff.forEach(staff => {
      data[staff.id] = {};
      for (let i = 1; i <= daysInMonth; i++) {
        const seed = staff.id.charCodeAt(staff.id.length-1) + i + month + year;
        const rand = seed % 10;
        if (rand < 7) data[staff.id][i] = 'present';
        else if (rand < 9) data[staff.id][i] = 'half-day';
        else data[staff.id][i] = 'absent';
      }
    });
    return data;
  }, [currentMonth, staffList]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('MASTER_TAILOR');
  const [newStaffBranch, setNewStaffBranch] = useState('Main Flagship');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Staff State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStaffData, setEditStaffData] = useState<StaffMember | null>(null);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  useEffect(() => {
    const stored = getLocalStorage<any>('yh_auth_user', null);
    if (stored) {
      setCurrentUser(stored);
    }

    const storedStaff = getLocalStorage<StaffMember[]>('yh_staff', INITIAL_STAFF);
    if (Array.isArray(storedStaff) && storedStaff.length > 0) {
      setStaffList(storedStaff);
    } else {
      setStaffList(INITIAL_STAFF);
      setLocalStorage('yh_staff', INITIAL_STAFF);
    }

    const draft = getLocalStorage<StaffFormDraft | null>('yh_staff_draft', null);
    if (draft && typeof draft === 'object') {
      if (draft.name) setNewStaffName(draft.name);
      if (draft.email) setNewStaffEmail(draft.email);
      if (draft.role) setNewStaffRole(draft.role);
      if (draft.branch) setNewStaffBranch(draft.branch);
    }
  }, []);

  // Staff form draft autosave
  useEffect(() => {
    if (newStaffName || newStaffEmail) {
      setLocalStorage('yh_staff_draft', {
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        branch: newStaffBranch
      });
    }
  }, [newStaffName, newStaffEmail, newStaffRole, newStaffBranch]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!newStaffEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (newStaffPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newMember: StaffMember = {
        id: `st-${Date.now().toString().slice(-4)}`,
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        role: newStaffRole,
        branch: newStaffBranch,
        status: 'Active',
        hiredAt: new Date().toISOString().split('T')[0]
      };

      setStaffList(prev => {
        const updated = [newMember, ...prev];
        setLocalStorage('yh_staff', updated);
        return updated;
      });
      removeLocalStorage('yh_staff_draft');
      
      setSuccessMsg(`Successfully hired ${newStaffName}! A login profile is active.`);
      setLoading(false);
      
      // Reset form
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffRole('MASTER_TAILOR');
      setNewStaffBranch('Main Flagship');
      
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg('');
      }, 1500);
    }, 800);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  const confirmDeleteStaff = () => {
    if (deleteConfirmId) {
      setStaffList(prev => {
        const updated = prev.filter(st => st.id !== deleteConfirmId);
        setLocalStorage('yh_staff', updated);
        return updated;
      });
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    }
  };

  const openEditModal = (staff: StaffMember) => {
    setEditStaffData({ ...staff });
    setEditModalOpen(true);
  };

  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffData) return;
    setStaffList(prev => {
      const updated = prev.map(st => st.id === editStaffData.id ? editStaffData : st);
      setLocalStorage('yh_staff', updated);
      return updated;
    });
    setEditModalOpen(false);
    setEditStaffData(null);
  };

  // Filtered List
  const filteredStaff = staffList.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || st.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = staffList.filter(st => st.status === 'Active').length;
  const pendingCount = staffList.filter(st => st.status === 'Pending').length;

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Staff Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage, recruit, and assign roles to boutique specialists.</p>
            </div>
          </div>
        </div>

        <Tooltip content="Recruit new atelier artisan, manager, or tailor profile">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-gold flex items-center justify-center gap-2 self-start cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Hire New Specialist</span>
          </button>
        </Tooltip>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'directory' 
              ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Directory
        </button>
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'timesheets' 
              ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Timesheets
        </button>
      </div>

      {activeTab === 'directory' && (
        <>
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Headcount</p>
            <p className="text-2xl font-bold text-white mt-0.5">{staffList.length}</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Staff</p>
            <p className="text-2xl font-bold text-white mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending Seed Offers</p>
            <p className="text-2xl font-bold text-white mt-0.5">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Directory Table Workspace */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specialists..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark pl-9 pr-4 py-2 w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="input-dark text-xs py-2 px-3 focus:ring-gold-500/20 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="BRANCH_MANAGER">Branch Manager</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="MASTER_TAILOR">Master Tailor</option>
              <option value="KARIGAR">Karigar</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Role / Level</th>
                <th className="py-4 px-6">Assigned Branch</th>
                <th className="py-4 px-6">Active Email</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredStaff.length > 0 ? (
                filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{member.name}</td>
                    <td className="py-4 px-6">
                      <span className={getRoleBadgeClass(member.role)}>
                        {member.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{member.branch}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{member.email}</td>
                    <td className="py-4 px-6">
                      <span className={`badge ${
                        member.status === 'Active' ? 'badge-emerald' : 'badge-amber'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip content="Edit specialist details">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 border border-transparent hover:border-gold-500/20 transition-all inline-flex items-center cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Revoke access & remove specialist">
                          <button
                            onClick={() => handleRemoveStaff(member.id, member.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all inline-flex items-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No tailoring specialists found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {activeTab === 'timesheets' && (
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800/80">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-400" />
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid & Summary (per active staff) */}
          {staffList.filter(s => s.status === 'Active').map(staff => {
            const attendance = attendanceData[staff.id] || {};
            let presentCount = 0;
            let absentCount = 0;
            let halfDayCount = 0;
            
            Object.values(attendance).forEach(status => {
              if (status === 'present') presentCount++;
              if (status === 'absent') absentCount++;
              if (status === 'half-day') halfDayCount++;
            });
            
            const totalHours = (presentCount * 8) + (halfDayCount * 4);
            const daysInMonth = getDaysInMonth(currentMonth);
            const firstDay = getFirstDayOfMonth(currentMonth);
            
            const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="p-2 min-h-[60px] bg-slate-900/20 rounded-lg border border-slate-800/30"></div>);
            
            const days = Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = attendance[day];
              let dotColor = 'bg-slate-500';
              if (status === 'present') dotColor = 'bg-emerald-500';
              if (status === 'absent') dotColor = 'bg-rose-500';
              if (status === 'half-day') dotColor = 'bg-amber-500';
              
              return (
                <div key={day} className="p-2 min-h-[60px] bg-slate-800/40 rounded-lg border border-slate-700/50 flex flex-col justify-between hover:bg-slate-700/40 transition-colors">
                  <span className="text-xs font-medium text-slate-400">{day}</span>
                  <div className="flex justify-center mt-1">
                    <div className={`w-3 h-3 rounded-full ${dotColor} shadow-sm shadow-black/50`} title={status}></div>
                  </div>
                </div>
              );
            });

            return (
              <div key={staff.id} className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20 font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{staff.name}</h3>
                      <p className="text-xs text-slate-400">{staff.role.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-300">Present: {presentCount}</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-slate-300">Half: {halfDayCount}</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-slate-300">Absent: {absentCount}</span></div>
                    <div className="flex items-center gap-1.5 ml-2 pl-4 border-l border-slate-700 text-gold-400"><Clock className="w-3.5 h-3.5" /><span>{totalHours} hrs</span></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">{d}</div>
                  ))}
                  {blanks}
                  {days}
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* Recruitment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card-gold max-w-md w-full border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-400" />
                <h3 className="font-bold text-white text-base">Hire Tailoring Specialist</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialist Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Master Rafiq"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Email *</label>
                <input
                  type="email"
                  placeholder="specialist@boutique.com"
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Temporary Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newStaffPassword}
                    onChange={e => setNewStaffPassword(e.target.value)}
                    className="input-dark pl-9 pr-3 py-2 text-xs w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role *</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-full cursor-pointer"
                  >
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="MASTER_TAILOR">Master Tailor</option>
                    <option value="KARIGAR">Karigar</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Atelier Branch *</label>
                  <select
                    value={newStaffBranch}
                    onChange={e => setNewStaffBranch(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-full cursor-pointer"
                  >
                    <option value="Main Flagship">Main Flagship</option>
                    <option value="West End Salon">West End Salon</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold py-2 text-xs cursor-pointer"
                >
                  {loading ? 'Hiring...' : 'Add Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editModalOpen && editStaffData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card-gold max-w-md w-full border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-gold-400" />
                <h3 className="font-bold text-white text-base">Edit Specialist Details</h3>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialist Name *</label>
                <input
                  type="text"
                  required
                  value={editStaffData.name}
                  onChange={e => setEditStaffData({ ...editStaffData, name: e.target.value })}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Email *</label>
                <input
                  type="email"
                  required
                  value={editStaffData.email}
                  onChange={e => setEditStaffData({ ...editStaffData, email: e.target.value })}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role *</label>
                  <select
                    value={editStaffData.role}
                    onChange={e => setEditStaffData({ ...editStaffData, role: e.target.value })}
                    className="input-dark py-2 px-3 text-xs w-full cursor-pointer"
                  >
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="MASTER_TAILOR">Master Tailor</option>
                    <option value="KARIGAR">Karigar</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Branch *</label>
                  <select
                    value={editStaffData.branch}
                    onChange={e => setEditStaffData({ ...editStaffData, branch: e.target.value })}
                    className="input-dark py-2 px-3 text-xs w-full cursor-pointer"
                  >
                    <option value="Main Flagship">Main Flagship</option>
                    <option value="West End Salon">West End Salon</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-ghost py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold py-2 text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Terminate Specialist</h3>
              <p className="text-sm text-slate-400 mt-2">
                Are you sure you want to terminate <strong className="text-white">{deleteConfirmName}</strong>'s association with this boutique? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="btn-ghost py-2 px-6 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

