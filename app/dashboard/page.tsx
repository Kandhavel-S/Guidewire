'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { formatINR, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { invoices, payments, exceptions, currentUser, runReconciliation } = useAppStore();
  const [isRunningRecon, setIsRunningRecon] = useState(false);

  // Dynamic KPI calculations from store state
  const totalExpected = invoices.reduce((sum, i) => sum + i.expectedAmount, 0);
  const totalReceived = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalExpected - totalReceived);

  const matchedCount = invoices.filter(
    (i) => i.reconciliationStatus === 'MATCHED'
  ).length;
  const openExceptions = exceptions.filter((e) => e.status !== 'RESOLVED');
  const resolvedExceptionsCount = exceptions.filter((e) => e.status === 'RESOLVED').length;
  const failedPaymentsCount = payments.filter((p) => p.status === 'Failed').length;

  const reconRate =
    invoices.length > 0 ? ((matchedCount / invoices.length) * 100).toFixed(1) : 0;

  const handleRunReconciliation = async () => {
    setIsRunningRecon(true);
    await new Promise((res) => setTimeout(res, 1200));
    await runReconciliation();
    setIsRunningRecon(false);
    router.push('/reconciliation');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Here's your premium reconciliation overview.
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-semibold">
              <Building2 className="w-3.5 h-3.5" /> BillingCenter Live
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none">
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>

          <button
            onClick={handleRunReconciliation}
            disabled={isRunningRecon}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningRecon ? 'animate-spin' : ''}`} />
            {isRunningRecon ? 'Reconciling...' : 'Run Reconciliation'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Expected Premium"
          value={formatINR(totalExpected, true)}
          subtitle={`Across ${invoices.length} active invoices`}
          icon={DollarSign}
          variant="primary"
          trend={{ value: '8.4%', isPositive: true }}
        />
        <KpiCard
          title="Received Premium"
          value={formatINR(totalReceived, true)}
          subtitle={`Cleared via Gateway & NACH`}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: '12.1%', isPositive: true }}
        />
        <KpiCard
          title="Matched Payments"
          value={matchedCount.toLocaleString()}
          subtitle={`${reconRate}% Reconciliation Rate`}
          icon={FileCheck2}
          variant="default"
        />
        <KpiCard
          title="Open Exceptions"
          value={openExceptions.length.toLocaleString()}
          subtitle={`${exceptions.filter((e) => e.severity === 'CRITICAL').length} Critical Risk Cases`}
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: '3.2%', isPositive: false }}
        />
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Outstanding Deficit"
          value={formatINR(totalOutstanding)}
          subtitle="Uncollected premium balance"
          variant="warning"
        />
        <KpiCard
          title="Resolved Exceptions"
          value={resolvedExceptionsCount}
          subtitle="Cases closed by operations team"
          variant="default"
        />
        <KpiCard
          title="Reconciliation Accuracy"
          value={`${reconRate}%`}
          subtitle="Automated ledger matching"
          variant="default"
        />
        <KpiCard
          title="Failed Payments"
          value={failedPaymentsCount}
          subtitle="Bank timeouts & bounces"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Main Charts & Visuals */}
      <DashboardCharts />

      {/* Recent Exceptions Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Payment Exceptions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active discrepancy cases requiring investigation
            </p>
          </div>
          <Link
            href="/exceptions"
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            View All Exceptions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Exception ID</th>
                <th className="p-3">Policy / Customer</th>
                <th className="p-3">Discrepancy Issue</th>
                <th className="p-3">Difference</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exceptions.slice(0, 6).map((exc) => (
                <tr
                  key={exc.id}
                  onClick={() => router.push(`/exceptions/${exc.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-blue-400">{exc.exceptionNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {exc.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500">{exc.policyNumber}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-300">
                    {exc.type.replace('_', ' ')}
                  </td>
                  <td className="p-3 font-bold text-red-400">
                    {formatINR(exc.differenceAmount)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={exc.severity} isSeverity />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={exc.status} />
                  </td>
                  <td className="p-3 text-slate-400 font-medium">{exc.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
