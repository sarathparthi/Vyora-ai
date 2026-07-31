'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { getCurrentUserEmail, getUserAccountStore } from '@/lib/api';
import InteractiveSalaryPredictor from '@/components/InteractiveSalaryPredictor';

const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#F97316', '#06B6D4',
  '#6366F1', '#14B8A6',
];

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
        <BarChart2 className="w-6 h-6 text-slate-600" />
      </div>
      <p className="text-xs text-slate-500 max-w-[180px]">{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const email = getCurrentUserEmail();
    const store = getUserAccountStore(email);
    const txs: any[] = store?.transactions || [];

    if (txs.length === 0) {
      setHasData(false);
      return;
    }

    setHasData(true);

    // ── Category breakdown (expenses only, current month) ──────────
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    const monthTxs = txs.filter((t: any) => {
      const d = new Date(t.date);
      return d.getFullYear() === curYear && d.getMonth() + 1 === curMonth;
    });

    const catMap: Record<string, number> = {};
    monthTxs
      .filter((t: any) => t.type === 'EXPENSE')
      .forEach((t: any) => {
        const cat = t.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + Number(t.amount || 0);
      });

    setCategoryData(
      Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], i) => ({
          name,
          value: Math.round(value),
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }))
    );

    // ── Income vs Expense last 6 months ───────────────────────────
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = d.toLocaleString('default', { month: 'short' });

      const mTxs = txs.filter((t: any) => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() + 1 === m;
      });

      const income = mTxs
        .filter((t: any) => t.type === 'INCOME')
        .reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
      const expense = mTxs
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((a: number, b: any) => a + Number(b.amount || 0), 0);

      months.push({ month: label, income: Math.round(income), expense: Math.round(expense) });
    }
    setComparisonData(months);

    // ── Daily spending trend (current month) ──────────────────────
    const dayMap: Record<string, number> = {};
    monthTxs
      .filter((t: any) => t.type === 'EXPENSE')
      .forEach((t: any) => {
        const day = `Day ${new Date(t.date).getDate()}`;
        dayMap[day] = (dayMap[day] || 0) + Number(t.amount || 0);
      });

    setDailyTrend(
      Object.entries(dayMap)
        .sort((a, b) => parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]))
        .map(([day, amount]) => ({ day, amount: Math.round(amount) }))
    );
  }, []);

  const tooltipStyle = {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Analytics &amp; Insights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep visual breakdown of category allocations, spending velocity, and AI expense predictions.
        </p>
      </div>

      {/* Interactive AI Salary & Expense Prediction Studio */}
      <InteractiveSalaryPredictor />

      {!hasData && (
        <div className="glass-card p-10 rounded-2xl flex flex-col items-center justify-center text-center gap-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <PieIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">No Historical Ledger Data Yet</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Add real transactions to unlock actual historical trend charts alongside your AI salary predictions.
            </p>
          </div>
        </div>
      )}

      {hasData && (
        <>
          {/* Row 1: Pie + Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold text-sm text-white">Actual Expense Distribution by Category</h3>
              {categoryData.length === 0 ? (
                <EmptyChart label="No expense transactions this month." />
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {categoryData.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-slate-400 truncate">{c.name}:</span>
                        <span className="font-semibold text-white">₹{c.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Income vs Expense Bar */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold text-sm text-white">Income vs Expense — Last 6 Months</h3>
              {comparisonData.every((d) => d.income === 0 && d.expense === 0) ? (
                <EmptyChart label="No income or expense transactions recorded yet." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Daily Velocity */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Daily Spending Velocity
            </h3>
            {dailyTrend.length === 0 ? (
              <EmptyChart label="No expense transactions this month to show daily trend." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Spent"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
