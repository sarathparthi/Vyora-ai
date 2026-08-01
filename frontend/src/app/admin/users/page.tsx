'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Trash2,
  KeyRound,
  RefreshCw,
  Globe,
  Monitor,
  Receipt,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminUser {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  deviceInfo: {
    browser: string;
    os: string;
    ip: string;
    location: string;
  };
  financials: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    txCount: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backend/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUsers(json.data.users || []);
        }
      }
    } catch (e) {
      console.warn('Fetch admin users error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Suspend / Reactivate User
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/backend/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, status: nextStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.email === user.email ? { ...u, status: nextStatus } : u)));
      }
    } catch (e) {}
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch('/api/backend/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email }),
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.email !== selectedUser.email));
      }
    } catch (e) {}
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Reset Password
  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResetPasswordModal(false);
    setNewPasswordInput('');
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            User Analytics &amp; Control Management <Users className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time user profiles, device footprints, financial metrics, and account access control.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-4">Role &amp; Status</th>
                <th className="py-3.5 px-4">Financial Ledger</th>
                <th className="py-3.5 px-4">Device &amp; Location</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-6 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.email} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {u.name}
                        {u.isVerified && (
                          <span title="Verified Email">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>

                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-mono">
                    <p className="text-emerald-400">In: ₹{u.financials.totalIncome.toLocaleString('en-IN')}</p>
                    <p className="text-rose-400">Out: ₹{u.financials.totalExpenses.toLocaleString('en-IN')}</p>
                    <p className="text-slate-400 text-[10px]">{u.financials.txCount} transactions logged</p>
                  </td>

                  <td className="py-4 px-4 text-[11px] text-slate-300 space-y-0.5">
                    <p className="flex items-center gap-1 text-slate-400">
                      <Monitor className="w-3 h-3 text-purple-400" /> {u.deviceInfo?.browser || 'Chrome'} ({u.deviceInfo?.os || 'Windows'})
                    </p>
                    <p className="flex items-center gap-1 text-slate-400">
                      <Globe className="w-3 h-3 text-blue-400" /> {u.deviceInfo?.location || 'India'} ({u.deviceInfo?.ip || '103.24.12.91'})
                    </p>
                  </td>

                  <td className="py-4 px-4 text-[11px] text-slate-400">
                    <p>{new Date(u.lastLogin).toLocaleDateString('en-IN')}</p>
                    <span className="text-[10px] text-slate-500">{u.loginCount} total logins</span>
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
                    {u.email !== 'admin@vyoraai.in' && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            u.status === 'ACTIVE'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Suspend User' : 'Reactivate User'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-rose-500/40 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" /> Confirm User Deletion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{selectedUser.name} ({selectedUser.email})</strong>?
              All stored financial transactions, budgets, goals, and wallets will be removed.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-lg shadow-rose-600/25"
              >
                Permanently Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-blue-500/40 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-400" /> Reset User Password
            </h3>
            <p className="text-xs text-slate-300">
              Reset password for <strong className="text-white">{selectedUser.email}</strong>:
            </p>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Temp Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
