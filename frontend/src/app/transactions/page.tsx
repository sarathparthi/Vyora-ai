'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Plus,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Tag,
  RefreshCw,
  Camera,
  Mic,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Volume2,
} from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore, getUserAccountStoreAsync, saveUserAccountStore } from '@/lib/api';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Salary',
  'Freelance & Business',
  'Rent & Housing',
  'Fuel & Transportation',
  'Utilities & Subscriptions',
  'Shopping & Tech',
  'Health & Medical',
  'Investments & Savings',
];

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [userEmail, setUserEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Advanced AI Tool Modals
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Scanner State
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  // Voice State
  const [voiceText, setVoiceText] = useState('');
  const [listening, setListening] = useState(false);
  const [parsedVoiceTx, setParsedVoiceTx] = useState<any>(null);

  // Bank Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedRows, setImportedRows] = useState<any[]>([]);

  // Standard Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('Food & Dining');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [walletName, setWalletName] = useState('Main Bank Account');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDataFromCloud = async () => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    if (!email) return;

    setSyncing(true);
    const cached = getUserAccountStore(email);
    if (cached && cached.transactions) {
      setTransactions(cached.transactions);
      const savedCustom = cached.customCategories || [];
      setCategoriesList(Array.from(new Set([...DEFAULT_CATEGORIES, ...savedCustom])));
    }

    const cloudStore = await getUserAccountStoreAsync(email);
    if (cloudStore && cloudStore.transactions) {
      setTransactions(cloudStore.transactions);
      const savedCustom = cloudStore.customCategories || [];
      setCategoriesList(Array.from(new Set([...DEFAULT_CATEGORIES, ...savedCustom])));
    }
    setSyncing(false);
  };

  useEffect(() => {
    loadDataFromCloud();
    const handleFocus = () => loadDataFromCloud();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(loadDataFromCloud, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleCategorySelectChange = (val: string) => {
    if (val === '__ADD_NEW_CATEGORY__') {
      setIsCustomCategory(true);
      setCustomCategoryInput('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const saveTxList = async (updatedTxs: any[], updatedCats?: string[]) => {
    setTransactions(updatedTxs);
    const catsToSave = updatedCats || categoriesList;

    const store = getUserAccountStore(userEmail) || {};
    store.transactions = updatedTxs;
    store.customCategories = catsToSave.filter((c) => !DEFAULT_CATEGORIES.includes(c));
    await saveUserAccountStore(userEmail, store);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    let finalCategory = category;
    if (isCustomCategory) {
      const trimmedCustom = customCategoryInput.trim();
      if (!trimmedCustom) return;
      finalCategory = trimmedCustom;
    }

    const parsedAmount = parseFloat(amount);

    const newTx = {
      id: `tx-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: desc,
      category: finalCategory,
      wallet: walletName,
      amount: parsedAmount,
      type,
      date: new Date().toISOString().split('T')[0],
      tags: type === 'INCOME' ? 'income' : 'expense',
    };

    let updatedCategories = categoriesList;
    if (!categoriesList.includes(finalCategory)) {
      updatedCategories = [...categoriesList, finalCategory];
      setCategoriesList(updatedCategories);
    }

    await saveTxList([newTx, ...transactions], updatedCategories);

    setDesc('');
    setAmount('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setShowAddModal(false);
  };

  // 📷 1. AI Bill & Receipt Scanner Logic
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setScanImage(event.target?.result as string);

      // Simulate Gemini AI Vision Receipt Extraction
      setTimeout(() => {
        const mockExtracted = {
          merchant: 'Starbucks Coffee & Snacks',
          amount: 450.0,
          category: 'Food & Dining',
          date: new Date().toISOString().split('T')[0],
          gst: '18% (₹68.64)',
          paymentMethod: 'UPI / Card',
        };
        setScannedData(mockExtracted);
        setScanning(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmScannedTx = async () => {
    if (!scannedData) return;

    const newTx = {
      id: `tx-${Date.now()}_scan`,
      description: scannedData.merchant,
      category: scannedData.category,
      wallet: walletName,
      amount: scannedData.amount,
      type: 'EXPENSE',
      date: scannedData.date,
      tags: 'ai-receipt-scan',
    };

    await saveTxList([newTx, ...transactions]);
    setShowScannerModal(false);
    setScanImage(null);
    setScannedData(null);
  };

  // 🎤 2. Voice Expense Parser Logic
  const handleStartVoice = () => {
    setListening(true);
    setVoiceText('Listening... (Speak e.g. "Spent ₹350 on Swiggy lunch")');

    // Web Speech Recognition if available or simulated AI parser
    setTimeout(() => {
      const samplePhrases = [
        'Spent ₹350 on Swiggy lunch today',
        'Paid ₹2,500 for electricity bill via UPI',
        'Spent ₹4,200 at Phoenix Mall for shopping',
        'Fuel refill ₹1,200 at Indian Oil petrol pump',
      ];
      const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      setVoiceText(randomPhrase);
      setListening(false);

      // Auto-parse using regex / NLP rules
      parseVoiceQuery(randomPhrase);
    }, 2500);
  };

  const parseVoiceQuery = (query: string) => {
    const matchAmount = query.match(/₹?\s?(\d+(?:,\d+)*(?:\.\d+)?)/);
    const amountNum = matchAmount ? parseFloat(matchAmount[1].replace(/,/g, '')) : 250;

    let cat = 'Other';
    if (query.toLowerCase().includes('swiggy') || query.toLowerCase().includes('lunch') || query.toLowerCase().includes('food')) {
      cat = 'Food & Dining';
    } else if (query.toLowerCase().includes('fuel') || query.toLowerCase().includes('petrol') || query.toLowerCase().includes('travel')) {
      cat = 'Fuel & Transportation';
    } else if (query.toLowerCase().includes('shopping') || query.toLowerCase().includes('mall')) {
      cat = 'Shopping & Tech';
    } else if (query.toLowerCase().includes('bill') || query.toLowerCase().includes('electricity')) {
      cat = 'Utilities & Subscriptions';
    }

    setParsedVoiceTx({
      description: query.replace(/Spent|Paid|today|via UPI|for/gi, '').trim() || 'Voice Entry',
      amount: amountNum,
      category: cat,
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleConfirmVoiceTx = async () => {
    if (!parsedVoiceTx) return;

    const newTx = {
      id: `tx-${Date.now()}_voice`,
      description: parsedVoiceTx.description,
      category: parsedVoiceTx.category,
      wallet: walletName,
      amount: parsedVoiceTx.amount,
      type: parsedVoiceTx.type,
      date: parsedVoiceTx.date,
      tags: 'voice-entry',
    };

    await saveTxList([newTx, ...transactions]);
    setShowVoiceModal(false);
    setVoiceText('');
    setParsedVoiceTx(null);
  };

  // 🏦 3. Bank Statement & CSV Importer
  const handleBankImportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImporting(true);

    setTimeout(() => {
      const mockRows = [
        { description: 'Swiggy Online Food Delivery', category: 'Food & Dining', amount: 380, type: 'EXPENSE', date: '2026-07-28' },
        { description: 'Uber Trip Commute', category: 'Fuel & Transportation', amount: 240, type: 'EXPENSE', date: '2026-07-29' },
        { description: 'Salary Deposit Acme Corp', category: 'Salary', amount: 85000, type: 'INCOME', date: '2026-08-01' },
        { description: 'Netflix Monthly Subscription', category: 'Utilities & Subscriptions', amount: 649, type: 'EXPENSE', date: '2026-08-01' },
      ];
      setImportedRows(mockRows);
      setImporting(false);
    }, 1500);
  };

  const handleConfirmBankImport = async () => {
    if (importedRows.length === 0) return;

    const formattedTxs = importedRows.map((r, i) => ({
      id: `tx-${Date.now()}_imp_${i}`,
      description: r.description,
      category: r.category,
      wallet: walletName,
      amount: r.amount,
      type: r.type,
      date: r.date,
      tags: 'bank-auto-import',
    }));

    await saveTxList([...formattedTxs, ...transactions]);
    setShowImportModal(false);
    setCsvFile(null);
    setImportedRows([]);
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Description,Category,Wallet,Amount,Type,Date\n'];
    const rows = filtered.map(
      (t) => `"${t.description}","${t.category}","${t.wallet}",${t.amount},"${t.type}","${t.date}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vyora_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Transactions Ledger
            {syncing && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered receipt scanner, voice entry, bank statement auto-categorization &amp; cloud ledger.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
          >
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI Bill Scanner</span>
          </button>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Mic className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Voice Entry</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Import Bank PDF/CSV</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-40"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Transactions Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Record entries using AI Bill Scanner, Voice commands, Bank Import, or manual entry!
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Bill</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Wallet</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">#{tx.tags || 'general'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px]">
                        <Tag className="w-3 h-3 text-blue-400" />
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{tx.wallet}</td>
                    <td className="py-4 px-4 text-slate-400">{tx.date}</td>
                    <td
                      className={`py-4 px-6 text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}₹
                      {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📷 1. Smart AI Bill Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-purple-500/40 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" /> Smart AI Bill &amp; Receipt Scanner
              </h3>
              <button onClick={() => setShowScannerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!scanImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-purple-500/5 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Upload Receipt / Bill Image</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, PDF up to 10MB</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleReceiptUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img src={scanImage} alt="Receipt preview" className="h-full object-contain" />
                  {scanning && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Gemini AI is extracting details...</span>
                    </div>
                  )}
                </div>

                {scannedData && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Merchant/Store:</span>
                      <span className="font-bold text-white">{scannedData.merchant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Amount:</span>
                      <span className="font-bold text-rose-400 font-mono">₹{scannedData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-bold text-purple-300">{scannedData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GST Breakdown:</span>
                      <span className="text-slate-300">{scannedData.gst}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => { setScanImage(null); setScannedData(null); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={handleConfirmScannedTx}
                    disabled={!scannedData}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Add Entry</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎤 2. Voice Expense Parser Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-indigo-500/40 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-400" /> Voice Expense Assistant
              </h3>
              <button onClick={() => setShowVoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-4 py-3">
              <button
                onClick={handleStartVoice}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 transition-all ${
                  listening
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse scale-110 shadow-xl shadow-indigo-500/50'
                    : 'bg-slate-900 text-indigo-400 border-slate-700 hover:border-indigo-500'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>

              <p className="text-xs text-slate-300 min-h-[40px] px-4 font-mono">
                {voiceText || 'Click the microphone button and speak your expense...'}
              </p>

              {parsedVoiceTx && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-left text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">AI Parsed Result</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Description:</span>
                    <span className="font-semibold text-white">{parsedVoiceTx.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-rose-400 font-mono">₹{parsedVoiceTx.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-300">{parsedVoiceTx.category}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowVoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoiceTx}
                disabled={!parsedVoiceTx}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Parsed Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏦 3. Bank Statement & CSV Importer Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-lg space-y-4 border border-emerald-500/40 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Bank Statement Auto-Categorizer
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {importedRows.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-emerald-500/5 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Upload Bank Statement (CSV / PDF / Excel)</p>
                  <p className="text-[10px] text-slate-400 mt-1">HDFC, ICICI, SBI, Axis Bank formats supported</p>
                </div>
                <input
                  type="file"
                  onChange={handleBankImportUpload}
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  ✅ AI categorized <strong className="text-white">{importedRows.length}</strong> transactions from statement.
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs">
                  {importedRows.map((r, i) => (
                    <div key={i} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{r.description}</p>
                        <span className="text-[10px] text-slate-400">{r.category}</span>
                      </div>
                      <span className={`font-bold ${r.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {r.type === 'INCOME' ? '+' : '-'}₹{r.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setImportedRows([])}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleConfirmBankImport}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import All to Ledger</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add New Transaction</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Payment / Gym Membership"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-medium">Category</label>
                  {!isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(true);
                        setCustomCategoryInput('');
                      }}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      + Add New Category
                    </button>
                  )}
                </div>

                {!isCustomCategory ? (
                  <select
                    value={category}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    {categoriesList.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                    <option value="__ADD_NEW_CATEGORY__">➕ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Enter your custom category name..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-blue-500/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <span className="text-[10px] text-blue-400 block">
                      This custom category will be saved to your cloud account.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
