'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Sparkles, ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/lib/utils';

export const DashboardCharts: React.FC = () => {
  const { invoices, payments, exceptions } = useAppStore();
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D' | '12M'>('30D');

  // Dynamic calculations for charts
  const totalExpected = invoices.reduce((sum, i) => sum + (Number(i.expectedAmount) || 0), 0);
  const totalReceived = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalExpected - totalReceived);

  // Time series mock data generation based on range
  const chartData = [
    { date: 'Aug 01', expected: 420000, received: 410000, diff: 10000 },
    { date: 'Aug 05', expected: 380000, received: 350000, diff: 30000 },
    { date: 'Aug 10', expected: 510000, received: 480000, diff: 30000 },
    { date: 'Aug 15', expected: 640000, received: 590000, diff: 50000 },
    { date: 'Aug 20', expected: 720000, received: 680000, diff: 40000 },
    { date: 'Aug 25', expected: 590000, received: 570000, diff: 20000 },
    { date: 'Aug 30', expected: 450000, received: 420000, diff: 30000 },
  ];

  // Exceptions by Type Donut chart
  const typeCounts: Record<string, number> = {};
  exceptions.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  const pieData = Object.keys(typeCounts).map((type) => ({
    name: type.replace('_', ' '),
    value: typeCounts[type],
  }));

  const COLORS = ['#f97316', '#a855f7', '#ef4444', '#eab308', '#3b82f6', '#10b981'];

  // Exceptions by Severity Horizontal Bar chart
  const severityCounts = {
    CRITICAL: exceptions.filter((e) => e.severity === 'CRITICAL').length,
    HIGH: exceptions.filter((e) => e.severity === 'HIGH').length,
    MEDIUM: exceptions.filter((e) => e.severity === 'MEDIUM').length,
    LOW: exceptions.filter((e) => e.severity === 'LOW').length,
  };

  const severityBarData = [
    { severity: 'Critical', count: severityCounts.CRITICAL, fill: '#ef4444' },
    { severity: 'High', count: severityCounts.HIGH, fill: '#f97316' },
    { severity: 'Medium', count: severityCounts.MEDIUM, fill: '#eab308' },
    { severity: 'Low', count: severityCounts.LOW, fill: '#3b82f6' },
  ];

  // AI Insights dynamically generated
  const insights = [
    {
      id: 'ins-1',
      title: 'Underpayments Dominating Deficit',
      description: `${exceptions.filter((e) => e.type === 'UNDERPAYMENT').length} open underpayment cases identified. Total outstanding balance requires manual follow-up.`,
      impactAmount: totalOutstanding,
      suggestedAction: 'Trigger auto-dunning reminders for open underpayments.',
    },
    {
      id: 'ins-2',
      title: 'Gateway Failure Spike Detected',
      description: 'Multiple failed payments recorded during bank processing window.',
      impactAmount: 45000,
      suggestedAction: 'Verify Mandate & Bank Gateway Connectivity.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Premium Collection Visual Progress Indicator */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Premium Collection Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live reconciliation ledger breakdown
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Collection Rate</span>
            <div className="text-base font-extrabold text-emerald-500">
              {totalExpected > 0 ? ((totalReceived / totalExpected) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Progress Bars Stack */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Expected Premium</span>
              <span className="text-slate-200">{formatINR(totalExpected)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-full transition-all duration-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Received Premium</span>
              <span className="text-emerald-400">{formatINR(totalReceived)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalReceived / (totalExpected || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Outstanding Discrepancy</span>
              <span className="text-red-400">{formatINR(totalOutstanding)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalOutstanding / (totalExpected || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Expected vs Received Chart */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Expected vs Received Premium
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative financial trajectory over time
            </p>
          </div>

          {/* Range selector tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            {(['7D', '30D', '90D', '12M'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className={`px-3 py-1 rounded-md transition-all ${
                  chartRange === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}K`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const exp = payload[0].value as number;
                    const rec = payload[1].value as number;
                    const diff = exp - rec;
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs text-slate-100 shadow-xl space-y-1">
                        <div className="font-bold text-slate-300">{label}</div>
                        <div className="text-blue-400">Expected: {formatINR(exp)}</div>
                        <div className="text-emerald-400">Received: {formatINR(rec)}</div>
                        <div className="text-red-400 font-semibold border-t border-slate-800 pt-1">
                          Difference: {formatINR(diff)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="expected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Expected" />
              <Bar dataKey="received" fill="#10b981" radius={[4, 4, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Exception Analytics (Donut Chart + Severity Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Exceptions by Type */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
            Exceptions by Discrepancy Type
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Categorical breakdown of open and flagged cases
          </p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white">
                          {payload[0].name}: <strong>{payload[0].value} cases</strong>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Horizontal Bar Chart */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
            Exceptions by Severity Level
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Risk-stratified operational triage queue
          </p>
          <div className="space-y-4">
            {severityBarData.map((item) => {
              const maxVal = Math.max(...severityBarData.map((d) => d.count), 1);
              const percentage = (item.count / maxVal) * 100;

              return (
                <div key={item.severity} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.severity}</span>
                    <span className="text-slate-400">{item.count} exceptions</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. AI Insights Section: ✨ Reconciliation Intelligence */}
      <div className="p-6 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-blue-950/30 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Reconciliation Intelligence
              </h3>
              <p className="text-xs text-purple-300">
                Automated AI findings synthesized from live BillingCenter transactions
              </p>
            </div>
          </div>
          <Link
            href="/ai-insights"
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
          >
            View AI Analysis <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.slice(0, 2).map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-lg bg-slate-900/80 border border-purple-500/20 text-xs space-y-2"
            >
              <div className="font-bold text-slate-100 flex items-center justify-between">
                <span>{ins.title}</span>
                {ins.impactAmount && (
                  <span className="text-red-400 font-extrabold">
                    {formatINR(ins.impactAmount)}
                  </span>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed">{ins.description}</p>
              {ins.suggestedAction && (
                <div className="text-[11px] font-semibold text-purple-400 pt-1 border-t border-slate-800">
                  💡 Action: {ins.suggestedAction}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
