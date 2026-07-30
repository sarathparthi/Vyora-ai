'use client';

import { FileText, Download, Calendar, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Reports & Exports</h1>
        <p className="text-xs text-slate-400 mt-1">Generate comprehensive monthly profit/loss statements, tax reports, and category breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Monthly Summary Report Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Monthly Cash Flow Statement</h3>
            <p className="text-xs text-slate-400 mt-1">Full statement of all income streams, fixed expenses, and net savings for July 2026.</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Tax Export Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Tax Expense Summary</h3>
            <p className="text-xs text-slate-400 mt-1">Export tax-deductible business & freelance expenses for Schedule C reporting.</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700">
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>

        {/* Category Spending Audit */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Yearly Category Audit</h3>
            <p className="text-xs text-slate-400 mt-1">Annual breakdown of category totals and comparison with previous year trajectory.</p>
          </div>
          <button className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700">
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
