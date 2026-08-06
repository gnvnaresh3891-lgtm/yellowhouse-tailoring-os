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
  Lock
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Pending';
  hiredAt: string;
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
      return 'badge-gold';
    case 'BRANCH_MANAGER':
      return 'badge-blue';
    case 'MASTER_TAILOR':
      return 'badge-amber';
    case 'RECEPTIONIST':
      return 'badge-emerald';
    case 'KARIGAR':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md';
    case 'ACCOUNTANT':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md';
    default:
      return 'badge-gold';
  }
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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

  useEffect(() => {
    const stored = localStorage.getItem('yh_auth_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

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

      setStaffList(prev => [newMember, ...prev]);
      
      // Seed to local registration list for mock logins
      const demoAccount = {
        role: newStaffRole,
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        label: newStaffRole.replace('_', ' '),
        color: 'border-slate-500/40 text-slate-300 bg-slate-500/10'
      };
      
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
    if (confirm(`Are you sure you want to terminate ${name}'s association with this boutique?`)) {
      setStaffList(prev => prev.filter(st => st.id !== id));
    }
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Staff Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage, recruit, and assign roles to boutique specialists.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-gold flex items-center justify-center gap-2 self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Hire New Specialist</span>
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20">
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
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
              className="input-dark text-xs py-2 px-3 focus:ring-yellow-500/20"
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/20">
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
                  <tr key={member.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{member.name}</td>
                    <td className="py-4 px-6">
                      <span className={getRoleBadgeClass(member.role)}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{member.branch}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{member.email}</td>
                    <td className="py-4 px-6">
                      <span className={`badge-pill ${
                        member.status === 'Active' ? 'badge-emerald' : 'badge-amber'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleRemoveStaff(member.id, member.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all inline-flex items-center"
                        title="Deactivate Specialist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* Recruitment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white text-base">Hire Tailoring Specialist</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master Rafiq"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Email</label>
                <input
                  type="email"
                  placeholder="specialist@boutique.com"
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  className="input-dark py-2 px-3 text-xs w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Temporary Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newStaffPassword}
                    onChange={e => setNewStaffPassword(e.target.value)}
                    className="input-dark pl-9 pr-3 py-2 text-xs w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Role</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-full"
                  >
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="MASTER_TAILOR">Master Tailor</option>
                    <option value="KARIGAR">Karigar</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Atelier Branch</label>
                  <select
                    value={newStaffBranch}
                    onChange={e => setNewStaffBranch(e.target.value)}
                    className="input-dark py-2 px-3 text-xs w-full"
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
                  className="btn-ghost py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold py-2 text-xs"
                >
                  {loading ? 'Hiring...' : 'Add Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
