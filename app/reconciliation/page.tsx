'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, CheckCircle2, Play, History, Download, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatDate, downloadCSV } from '@/lib/utils';
import { reconciliationApi } from '@/lib/api/reconciliation';

export default function ReconciliationPage() {
  const { reconciliationRuns, runReconciliation } = useAppStore();

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [latestRun, setLatestRun] = useState<any>(null);

  useEffect(() => {
    // Fetch latest detailed run result from API on mount
    reconciliationApi.getLatestResults().then((res) => {
      if (res.success && res.data) {
        setLatestRun(res.data);
      } else if (reconciliationRuns.length > 0) {
        setLatestRun(reconciliationRuns[0]);
      }
    });
  }, [reconciliationRuns]);

  const steps = [
    'Fetching Guidewire BillingCenter ledger data...',
    'Validating invoice expectations...',
    'Matching incoming payment transactions...',
    'Detecting discrepancies & underpayments...',
    'Generating operational exception tickets...',
    'Reconciliation Completed!',
  ];

  const handleStartReconciliation = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise((res) => setTimeout(res, 400));
    }

    const run = await runReconciliation();
    if (run) {
      setLatestRun(run);
    }
    setIsRunning(false);
  };

  const resultsList: any[] = latestRun?.records || latestRun?.results || [];

  const filteredResults = resultsList.filter((res: any) => {
    if (statusFilter === 'ALL') return true;
    return res.status === statusFilter;
  });

  const handleExportCSV = () => {
    if (!latestRun) return;
    const exportData = resultsList.map((r: any) => ({
      InvoiceNumber: r.invoiceNumber || r.invoice?.invoiceNumber || 'N/A',
      PolicyNumber: r.policyNumber || r.policy?.policyNumber || 'N/A',
      Customer: r.customerName || r.policy?.policyholder?.name || 'N/A',
      Expected: Number(r.expected ?? r.expectedAmount ?? 0),
      Received: Number(r.received ?? r.actualAmount ?? 0),
      Difference: Number(r.difference ?? 0),
      Status: r.status,
    }));
    downloadCSV(`Reconciliation_Run_${latestRun.runNumber}`, exportData);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-500" /> Premium Reconciliation Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic matching of expected premiums against received payment transactions
          </p>
        </div>

        <button
          onClick={handleStartReconciliation}
          disabled={isRunning}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Processing...' : 'Run Reconciliation'}
        </button>
      </div>

      {/* Interactive Running Workflow Bar */}
      {isRunning && (
        <div className="p-6 rounded-xl border border-blue-500/40 bg-blue-950/20 text-blue-200 space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Reconciliation In Progress
            </span>
            <span className="text-xs font-semibold text-white">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{steps[currentStep]}</span>
          </div>
        </div>
      )}

      {/* Latest Run Summary Metrics */}
      {latestRun && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Reconciliation Completed
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                Run Reference: {latestRun.runNumber} ({formatDate(latestRun.startedAt || latestRun.timestamp || latestRun.createdAt)})
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Results
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Records Processed</span>
              <span className="text-2xl font-extrabold text-slate-100">{latestRun.recordsProcessed ?? 0}</span>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 block mb-1">Matched Invoices</span>
              <span className="text-2xl font-extrabold text-emerald-500">{latestRun.matchedRecords ?? latestRun.matchedCount ?? 0}</span>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 block mb-1">Exceptions Flagged</span>
              <span className="text-2xl font-extrabold text-red-500">{latestRun.exceptionRecords ?? latestRun.exceptionCount ?? 0}</span>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 block mb-1">Total Difference</span>
              <span className="text-2xl font-extrabold text-amber-500">{formatINR(Number(latestRun.totalDifference || 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Filter & Data Table */}
      {latestRun && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Reconciliation Results Ledger
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                'ALL',
                'MATCHED',
                'UNDERPAYMENT',
                'OVERPAYMENT',
                'MISSING_PAYMENT',
                'DUPLICATE_PAYMENT',
                'LATE_PAYMENT',
                'PAYMENT_FAILED',
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Policy / Customer</th>
                  <th className="p-3">Expected</th>
                  <th className="p-3">Received</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3">Match Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredResults.map((r: any, idx: number) => {
                  const invNum = r.invoiceNumber || r.invoice?.invoiceNumber || 'N/A';
                  const polNum = r.policyNumber || r.policy?.policyNumber || 'N/A';
                  const custName = r.customerName || r.policy?.policyholder?.name || 'N/A';
                  const expAmt = Number(r.expected ?? r.expectedAmount ?? 0);
                  const recAmt = Number(r.received ?? r.actualAmount ?? 0);
                  const diffAmt = Number(r.difference ?? 0);
                  const excId = r.exceptionId || r.exception?.id;

                  return (
                    <tr key={r.id || r.invoiceId || idx} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-3 font-bold text-blue-400">{invNum}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{custName}</div>
                        <div className="text-[11px] text-slate-500">{polNum}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-200">{formatINR(expAmt)}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatINR(recAmt)}</td>
                      <td className="p-3 font-bold text-red-400">{formatINR(diffAmt)}</td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                      <td className="p-3 text-right">
                        {excId ? (
                          <Link
                            href={`/exceptions/${excId}`}
                            className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 inline-flex items-center gap-1"
                          >
                            Investigate <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-emerald-500 font-semibold">Matched ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reconciliation History Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-purple-500" /> Historical Reconciliation Runs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Run ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Records</th>
                <th className="p-3">Matched</th>
                <th className="p-3">Exceptions</th>
                <th className="p-3">Total Difference</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reconciliationRuns.map((run: any) => {
                const rProcessed = run.recordsProcessed ?? 0;
                const mCount = run.matchedRecords ?? run.matchedCount ?? 0;
                const eCount = run.exceptionRecords ?? run.exceptionCount ?? 0;
                const tDiff = Number(run.totalDifference ?? 0);
                const runTime = run.startedAt || run.timestamp || run.createdAt;

                return (
                  <tr key={run.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-blue-400">{run.runNumber}</td>
                    <td className="p-3 text-slate-300">{formatDate(runTime)}</td>
                    <td className="p-3 font-semibold text-slate-200">{rProcessed}</td>
                    <td className="p-3 font-bold text-emerald-400">{mCount}</td>
                    <td className="p-3 font-bold text-red-400">{eCount}</td>
                    <td className="p-3 font-bold text-amber-400">{formatINR(tDiff)}</td>
                    <td className="p-3"><StatusBadge status={run.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
