'use client';

import React from 'react';
import { BarChart3, Download, Calendar, DollarSign, AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { formatINR, downloadCSV } from '@/lib/utils';

export default function ReportsPage() {
  const { invoices, payments, exceptions } = useAppStore();

  const totalExpected = invoices.reduce((sum, i) => sum + i.expectedAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalExpected - totalPaid);
  const matchedInvoices = invoices.filter((i) => i.reconciliationStatus === 'MATCHED').length;

  // Premium Reconciliation Report Data
  const reconReportData = [
    { category: 'Expected', amount: totalExpected, fill: '#3b82f6' },
    { category: 'Received', amount: totalPaid, fill: '#10b981' },
    { category: 'Outstanding', amount: totalOutstanding, fill: '#ef4444' },
  ];

  // Exception Status Breakdown
  const exceptionStatusData = [
    { status: 'Open', count: exceptions.filter((e) => e.status === 'OPEN').length, fill: '#ef4444' },
    { status: 'Investigating', count: exceptions.filter((e) => e.status === 'INVESTIGATING').length, fill: '#f97316' },
    { status: 'Resolved', count: exceptions.filter((e) => e.status === 'RESOLVED').length, fill: '#10b981' },
    { status: 'Escalated', count: exceptions.filter((e) => e.status === 'ESCALATED').length, fill: '#a855f7' },
  ];

  // Payment Status Breakdown
  const paymentStatusData = [
    { status: 'Success', count: payments.filter((p) => p.status === 'Success').length, fill: '#10b981' },
    { status: 'Pending', count: payments.filter((p) => p.status === 'Pending').length, fill: '#eab308' },
    { status: 'Failed', count: payments.filter((p) => p.status === 'Failed').length, fill: '#ef4444' },
    { status: 'Refunded', count: payments.filter((p) => p.status === 'Refunded').length, fill: '#a855f7' },
  ];

  const handleExportFullReport = () => {
    const reportRows = invoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      PolicyNumber: inv.policyNumber,
      Customer: inv.customerName,
      ExpectedAmount: inv.expectedAmount,
      PaidAmount: inv.paidAmount,
      Balance: inv.outstandingAmount,
      ReconciliationStatus: inv.reconciliationStatus,
    }));
    downloadCSV('InsureFlow_Reconciliation_Executive_Report', reportRows);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" /> Executive Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Financial reconciliation metrics, payment collection trends & exception audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date Range: Last 30 Days
          </div>

          <button
            onClick={handleExportFullReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Report 1: Premium Reconciliation Financial Summary */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Premium Reconciliation Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated ledger stats across all active policy invoices
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Match Accuracy</span>
            <div className="text-base font-extrabold text-emerald-400">
              {((matchedInvoices / (invoices.length || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Expected Premium</span>
            <div className="text-xl font-extrabold text-slate-100 mt-1">{formatINR(totalExpected)}</div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400">Received Premium</span>
            <div className="text-xl font-extrabold text-emerald-500 mt-1">{formatINR(totalPaid)}</div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-red-400">Outstanding Shortfall</span>
            <div className="text-xl font-extrabold text-red-500 mt-1">{formatINR(totalOutstanding)}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Matched Invoices</span>
            <div className="text-xl font-extrabold text-blue-400 mt-1">{matchedInvoices} / {invoices.length}</div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reconReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}K`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white">
                        {payload[0].name}: {formatINR(payload[0].value as number)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {reconReportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Grid: Exception Report + Payment Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exception Operational Report */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Exception Case Audit Report
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Case status distribution across open, investigating, and resolved queues
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exceptionStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white">
                          {payload[0].payload.status}: {payload[0].value} cases
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {exceptionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Remittance Report */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-500" /> Payment Transaction Status Report
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gateway transaction outcome distribution
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-white">
                          {payload[0].name}: {payload[0].value} transactions
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
