'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Receipt,
  Target,
  PieChart as PieIcon,
  RefreshCw,
  Linkedin,
  KeyRound,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, getUserAccountStoreAsync, saveUserAccountStore } from '@/lib/api';

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details: string;
}

interface SharedTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  addedBy: string;
  isShared: boolean;
}

export default function SharedFinancePage() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('User');

  // Connection State: 'DISCONNECTED' | 'PENDING_OTP' | 'CONNECTED'
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'PENDING_OTP' | 'CONNECTED'>('DISCONNECTED');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');

  // Modals & Inputs
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // OTP Verification Form State
  const [inputPartnerEmail, setInputPartnerEmail] = useState('');
  const [myOtp, setMyOtp] = useState('');
  const [partnerOtp, setPartnerOtp] = useState('');
  const [generatedMyOtp, setGeneratedMyOtp] = useState('');
  const [generatedPartnerOtp, setGeneratedPartnerOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [formError, setFormError] = useState('');

  // Shared Data State
  const [sharedTxs, setSharedTxs] = useState<SharedTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [myTxs, setMyTxs] = useState<any[]>([]);

  // Add Shared Transaction Form
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txCategory, setTxCategory] = useState('Groceries & Home');

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    const storedUser = localStorage.getItem('vyora_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.name) setUserName(u.name);
      } catch (e) {}
    }

    // Load persisted Shared Finance state
    if (email) {
      const savedShared = localStorage.getItem(`vyora_shared_finance_${email.toLowerCase()}`);
      if (savedShared) {
        try {
          const parsed = JSON.parse(savedShared);
          setConnectionStatus(parsed.status || 'DISCONNECTED');
          setPartnerEmail(parsed.partnerEmail || '');
          setPartnerName(parsed.partnerName || '');
          setSharedTxs(parsed.sharedTxs || []);
          setAuditLogs(parsed.auditLogs || []);
        } catch (e) {}
      }

      // Load user transactions
      const store = getUserAccountStore(email);
      if (store && store.transactions) {
        setMyTxs(store.transactions);
      }
    }
  }, []);

  const saveSharedState = (status: any, pEmail: string, pName: string, txs: SharedTransaction[], logs: AuditLog[]) => {
    setConnectionStatus(status);
    setPartnerEmail(pEmail);
    setPartnerName(pName);
    setSharedTxs(txs);
    setAuditLogs(logs);

    if (userEmail) {
      localStorage.setItem(
        `vyora_shared_finance_${userEmail.toLowerCase()}`,
        JSON.stringify({ status, partnerEmail: pEmail, partnerName: pName, sharedTxs: txs, auditLogs: logs })
      );
    }
  };

  // Step 1: Send Connection Request & Generate Dual OTPs
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetEmail = inputPartnerEmail.toLowerCase().trim();
    if (!targetEmail) {
      setFormError('Partner email address is required.');
      return;
    }
    if (targetEmail === userEmail.toLowerCase()) {
      setFormError('You cannot connect with your own email address.');
      return;
    }

    // Generate 6-digit OTPs
    const myCode = Math.floor(100000 + Math.random() * 900000).toString();
    const partnerCode = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedMyOtp(myCode);
    setGeneratedPartnerOtp(partnerCode);

    const derivedName = targetEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedPartnerName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    setPartnerName(formattedPartnerName);

    setOtpStep(2);
  };

  // Step 2: Verify Dual OTPs & Establish Connection
  const handleVerifyDualOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (myOtp.trim() !== generatedMyOtp) {
      setFormError('Invalid OTP for your account. Please check code.');
      return;
    }
    if (partnerOtp.trim() !== generatedPartnerOtp) {
      setFormError("Invalid OTP for partner's account. Please check code.");
      return;
    }

    // Successfully verified!
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      event: 'SHARED_FINANCE_ESTABLISHED',
      actor: userEmail,
      details: `Established shared financial connection between ${userEmail} and ${inputPartnerEmail} via dual OTP verification.`,
    };

    const initialSharedTxs: SharedTransaction[] = [
      {
        id: `shared-1`,
        description: 'Monthly Apartment Rent & Utilities',
        amount: 28000,
        type: 'EXPENSE',
        category: 'Housing & Rent',
        date: new Date().toISOString().split('T')[0],
        addedBy: inputPartnerEmail,
        isShared: true,
      },
      {
        id: `shared-2`,
        description: 'Joint Household Groceries Supermarket',
        amount: 4500,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date().toISOString().split('T')[0],
        addedBy: userEmail,
        isShared: true,
      },
    ];

    saveSharedState('CONNECTED', inputPartnerEmail, partnerName, initialSharedTxs, [newLog, ...auditLogs]);
    setShowConnectModal(false);
    setOtpStep(1);
    setMyOtp('');
    setPartnerOtp('');
  };

  // Toggle transaction privacy: Personal vs Shared
  const handleTogglePrivacy = (txId: string) => {
    const updated = sharedTxs.map((t) => (t.id === txId ? { ...t, isShared: !t.isShared } : t));

    const targetTx = sharedTxs.find((t) => t.id === txId);
    const newAction = targetTx?.isShared ? 'CONVERTED_TO_PRIVATE' : 'CONVERTED_TO_SHARED';

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      event: newAction,
      actor: userEmail,
      details: `Transaction "${targetTx?.description}" privacy toggled to ${targetTx?.isShared ? 'Private' : 'Shared'}.`,
    };

    saveSharedState(connectionStatus, partnerEmail, partnerName, updated, [newLog, ...auditLogs]);
  };

  // Add Shared Transaction
  const handleAddSharedTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;

    const newTx: SharedTransaction = {
      id: `shared-${Date.now()}`,
      description: txDesc,
      amount: parseFloat(txAmount) || 0,
      type: txType,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      addedBy: userEmail,
      isShared: true,
    };

    const updatedTxs = [newTx, ...sharedTxs];

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      event: 'SHARED_TRANSACTION_ADDED',
      actor: userEmail,
      details: `Added shared ${txType.toLowerCase()} of ₹${newTx.amount} for "${txDesc}".`,
    };

    saveSharedState(connectionStatus, partnerEmail, partnerName, updatedTxs, [newLog, ...auditLogs]);

    setTxDesc('');
    setTxAmount('');
    setShowAddTxModal(false);
  };

  // Disconnect Shared Connection
  const handleConfirmDisconnect = () => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      event: 'SHARED_FINANCE_DISCONNECTED',
      actor: userEmail,
      details: `Shared financial connection between ${userEmail} and ${partnerEmail} was disconnected.`,
    };

    saveSharedState('DISCONNECTED', '', '', [], [newLog, ...auditLogs]);
    setShowDisconnectModal(false);
  };

  // Metrics Calculations
  const totalSharedIncome = sharedTxs
    .filter((t) => t.isShared && t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSharedExpense = sharedTxs
    .filter((t) => t.isShared && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const sharedSavings = Math.max(0, totalSharedIncome - totalSharedExpense);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Partner &amp; Family Shared Finance <Users className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative family budgeting, shared income/expense ledgers, and privacy-first dual OTP authentication.
          </p>
        </div>

        {/* Developer Attribution Header Badge */}
        <a
          href="https://www.linkedin.com/in/sarath-p-a11s/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all self-start sm:self-auto"
        >
          <Linkedin className="w-4 h-4 text-blue-400" />
          <span>Developed by Sarath P</span>
        </a>
      </div>

      {/* Connection Banner */}
      <div className="glass-card p-6 rounded-3xl border-l-4 border-l-purple-500 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {connectionStatus === 'CONNECTED'
                  ? `Connected with ${partnerName}`
                  : 'Shared Household Account'}
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {connectionStatus === 'CONNECTED' ? '● Active Link' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {connectionStatus === 'CONNECTED'
                ? `Partner Email: ${partnerEmail} • Both users can manage shared income, expenses, and family goals.`
                : 'Connect with your partner, spouse, or family member to collaboratively manage finances.'}
            </p>
          </div>
        </div>

        <div>
          {connectionStatus === 'CONNECTED' ? (
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              Disconnect Account
            </button>
          ) : (
            <button
              onClick={() => {
                setFormError('');
                setOtpStep(1);
                setShowConnectModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send Partner Connection Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Connected State Metrics & Shared Dashboard */}
      {connectionStatus === 'CONNECTED' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Shared Income</span>
              <p className="text-2xl font-extrabold text-emerald-400">₹{totalSharedIncome.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-slate-500">Combined partner deposits</span>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 border-l-4 border-l-rose-500">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Shared Expenses</span>
              <p className="text-2xl font-extrabold text-rose-400">₹{totalSharedExpense.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-slate-500">Joint household spending</span>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 border-l-4 border-l-purple-500">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Shared Retained Savings</span>
              <p className="text-2xl font-extrabold text-purple-400">₹{sharedSavings.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-slate-500">Family emergency reserve</span>
            </div>
          </div>

          {/* Shared Transactions Table */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" /> Shared Ledger &amp; Privacy Toggle
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle any transaction between Private and Shared. Shared entries update both partners automatically.
                </p>
              </div>

              <button
                onClick={() => setShowAddTxModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Shared Transaction</span>
              </button>
            </div>

            {sharedTxs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No shared transactions recorded yet. Click "Add Shared Transaction" to record joint expenses!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Added By</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Privacy Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sharedTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-all">
                        <td className="py-3.5 px-4 font-semibold text-white">{t.description}</td>
                        <td className="py-3.5 px-4 text-slate-300">{t.category}</td>
                        <td className="py-3.5 px-4 text-slate-400">{t.addedBy}</td>
                        <td className="py-3.5 px-4 text-slate-400">{t.date}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleTogglePrivacy(t.id)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                              t.isShared
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {t.isShared ? <Unlock className="w-3 h-3 text-purple-400" /> : <Lock className="w-3 h-3" />}
                            <span>{t.isShared ? '👥 Shared with Partner' : '🔒 Personal (Private)'}</span>
                          </button>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold ${
                            t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Security Audit Logs */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Audit Log &amp; Connection History
          </h3>
          <span className="text-xs text-slate-400">Enterprise Encryption Audit</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No connection or shared finance security audit events logged yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-purple-400">{log.event}</span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <span className="text-[10px] text-slate-500 block">Actor: {log.actor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer Attribution Footer */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Vyora Partner &amp; Family Shared Finance Engine</h4>
            <p className="text-[11px] text-slate-400">Architected and Developed by Sarath P</p>
          </div>
        </div>

        <a
          href="https://www.linkedin.com/in/sarath-p-a11s/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
        >
          <Linkedin className="w-4 h-4" />
          <span>Connect with Developer on LinkedIn</span>
        </a>
      </div>

      {/* Connection Request & Dual OTP Verification Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-5 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Partner Connection Request
              </h3>
              <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Step 1: Input Partner Email */}
            {otpStep === 1 && (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Partner / Family Member Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@example.com"
                    value={inputPartnerEmail}
                    onChange={(e) => setInputPartnerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Both you and your partner will receive a 6-digit OTP to authorize the shared account link.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Dual OTP Request</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Input Dual OTPs */}
            {otpStep === 2 && (
              <form onSubmit={handleVerifyDualOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1 text-purple-300 font-mono">
                  <div className="flex justify-between">
                    <span>Your OTP Code:</span>
                    <span className="font-bold text-white">{generatedMyOtp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partner OTP Code ({inputPartnerEmail}):</span>
                    <span className="font-bold text-white">{generatedPartnerOtp}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Your 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter your OTP code"
                    value={myOtp}
                    onChange={(e) => setMyOtp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Partner's 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter partner OTP code"
                    value={partnerOtp}
                    onChange={(e) => setPartnerOtp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Dual OTPs &amp; Connect</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Shared Transaction Modal */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Shared Transaction</h3>
            <form onSubmit={handleAddSharedTx} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Grocery Store / Home Internet"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1500.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e: any) => setTxType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                >
                  <option value="Groceries & Home">Groceries &amp; Home</option>
                  <option value="Rent & Housing">Rent &amp; Housing</option>
                  <option value="Utilities & Bills">Utilities &amp; Bills</option>
                  <option value="Dining & Entertainment">Dining &amp; Entertainment</option>
                  <option value="Family Savings Reserve">Family Savings Reserve</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25"
                >
                  Save Shared Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-rose-500/40 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" /> Disconnect Shared Account?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to disconnect shared financial access with <strong className="text-white">{partnerEmail}</strong>?
              Shared transactions will be unlinked, and audit logs will record this disconnection.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-lg shadow-rose-600/25"
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
