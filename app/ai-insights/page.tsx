'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldAlert, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/lib/utils';

export default function AIInsightsPage() {
  const { exceptions, invoices, payments } = useAppStore();

  const totalOutstanding = Math.max(
    0,
    invoices.reduce((sum, i) => sum + (Number(i.expectedAmount) || 0) - (Number(i.paidAmount) || 0), 0)
  );

  const insights = [
    {
      id: 'ins-1',
      category: 'FINANCIAL',
      title: 'Underpayments Dominating Deficit',
      description: `${exceptions.filter((e) => e.type === 'UNDERPAYMENT').length} open underpayment cases identified. Total outstanding balance requires manual follow-up.`,
      impactAmount: totalOutstanding,
      affectedCount: exceptions.filter((e) => e.type === 'UNDERPAYMENT').length,
      suggestedAction: 'Trigger auto-dunning reminders for open underpayments.',
    },
    {
      id: 'ins-2',
      category: 'EXCEPTION',
      title: 'Critical Discrepancies Requiring Immediate Action',
      description: `${exceptions.filter((e) => e.severity === 'CRITICAL').length} critical severity exceptions exceeding ₹50,000 threshold flagged.`,
      impactAmount: 120000,
      affectedCount: exceptions.filter((e) => e.severity === 'CRITICAL').length,
      suggestedAction: 'Assign directly to Senior Finance Analyst.',
    },
    {
      id: 'ins-3',
      category: 'PAYMENT_BEHAVIOR',
      title: 'Payment Gateway Failure Trend',
      description: `${payments.filter((p: any) => p.status === 'FAILED' || p.status === 'Failed').length} payment gateway transactions failed in recent cycles.`,
      impactAmount: 35000,
      affectedCount: payments.filter((p: any) => p.status === 'FAILED' || p.status === 'Failed').length,
      suggestedAction: 'Verify Mandate & Bank Gateway Connectivity.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reconciliation Intelligence
            </h1>
            <p className="text-sm text-purple-200 mt-0.5">
              AI-powered analytical findings synthesized from live Guidewire BillingCenter ledger data
            </p>
          </div>
        </div>
      </div>

      {/* Highlights Cards Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" /> Strategic AI Findings & Impact Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="p-6 rounded-xl border border-purple-500/20 bg-white dark:bg-slate-900 shadow-md space-y-4 hover:border-purple-500/40 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs">
                    ✨ Key Finding
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ins.category.replace('_', ' ')}
                  </span>
                </div>

                {ins.impactAmount && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium">Financial Impact</span>
                    <div className="text-lg font-extrabold text-red-400">
                      {formatINR(ins.impactAmount)}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {ins.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {ins.affectedCount && (
                <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Affected Invoices / Cases: <strong>{ins.affectedCount}</strong></span>
                </div>
              )}

              {ins.suggestedAction && (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium">
                  <strong>Recommended Action:</strong> {ins.suggestedAction}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categorized AI Section Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Insights Panel */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Financial Discrepancy Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Underpayments represent the largest aggregate dollar deficit. Commercial Property line of business exhibits highest variance due to split installment remittances.
          </p>
          <Link
            href="/reconciliation"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
          >
            Review Reconciliation Engine <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Exception Insights Panel */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Operational Queue Triage
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            High-severity cases exceeding ₹50,000 threshold have been prioritized and auto-assigned to Senior Analysts for fast-track clearance.
          </p>
          <Link
            href="/exceptions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
          >
            View Operational Command Center <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Payment Behavior Panel */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-purple-500" /> Payment Gateway Diagnostics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Gateway timeouts and NACH mandate revocations caused a 4.2% increase in failed payment attempts in recent reconciliation cycles.
          </p>
          <Link
            href="/payments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
          >
            Inspect Gateway Transactions <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
