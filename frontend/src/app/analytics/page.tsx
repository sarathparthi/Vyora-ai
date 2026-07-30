'use client';

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
  Line 
} from 'recharts';

const CATEGORY_DATA = [
  { name: 'Rent & Housing', value: 1850, color: '#EF4444' },
  { name: 'Food & Dining', value: 445, color: '#F59E0B' },
  { name: 'Groceries', value: 320, color: '#EC4899' },
  { name: 'Fuel & Transport', value: 195, color: '#6366F1' },
  { name: 'Subscriptions', value: 150, color: '#A855F7' },
  { name: 'Shopping & Tech', value: 280, color: '#F97316' },
];

const COMPARISON_DATA = [
  { month: 'Oct', income: 5800, expense: 2200 },
  { month: 'Nov', income: 6100, expense: 2400 },
  { month: 'Dec', income: 7200, expense: 3100 },
  { month: 'Jan', income: 6400, expense: 2150 },
  { month: 'Feb', income: 6500, expense: 2000 },
  { month: 'Mar', income: 6600, expense: 2090 },
];

const DAILY_TREND = [
  { day: 'Day 1', amount: 120 },
  { day: 'Day 5', amount: 85 },
  { day: 'Day 10', amount: 1850 },
  { day: 'Day 15', amount: 45 },
  { day: 'Day 20', amount: 230 },
  { day: 'Day 25', amount: 145 },
  { day: 'Day 30', amount: 95 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Analytics & Insights</h1>
        <p className="text-xs text-slate-400 mt-1">Deep visual breakdown of category allocations, spending velocity, and income trajectory.</p>
      </div>

      {/* Grid Row 1: Pie & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm text-white">Expense Distribution by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {CATEGORY_DATA.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-400 truncate">{c.name}:</span>
                <span className="font-semibold text-white">${c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-sm text-white">Income vs Expense Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Daily Velocity Line Chart */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-semibold text-sm text-white">Daily Spending Velocity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DAILY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
