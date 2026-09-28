'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, User as UserIcon, FileText, CreditCard, History, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatINR, formatDate } from '@/lib/utils';

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { policies, invoices, payments, exceptions } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'invoices' | 'payments' | 'history'>('overview');

  const policyId = params?.id as string;
  const policy = policies.find(
    (p) => p.id === policyId || p.policyNumber.toLowerCase() === policyId?.toLowerCase()
  );

  if (!policy) {
    return (
      <ErrorState
        title="Policy Not Found"
        description={`No policy record found matching ID '${policyId}'.`}
        onRetry={() => router.push('/policies')}
      />
    );
  }

  // Related data
  const relatedInvoices = invoices.filter((i) => i.policyId === policy.id);
  const relatedPayments = payments.filter((p) => p.policyId === policy.id);
  const relatedExceptions = exceptions.filter((e) => e.policyId === policy.id);

  const totalInvoiced = relatedInvoices.reduce((sum, i) => sum + i.expectedAmount, 0);
  const totalPaid = relatedInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/policies')}
        className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Policies
      </button>

      {/* Header Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {policy.policyNumber}
              </h1>
              <StatusBadge status={policy.status} />
            </div>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              {policy.customer.name} • {policy.productType}
            </p>
          </div>
        </div>

        {/* Financial Summary Quick Badges */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Total Invoiced</span>
            <div className="font-bold text-slate-100">{formatINR(totalInvoiced)}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Total Paid</span>
            <div className="font-bold text-emerald-400">{formatINR(totalPaid)}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Outstanding</span>
            <div className="font-bold text-red-400">{formatINR(outstanding)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { key: 'overview', label: 'Overview & Financials', icon: ShieldCheck },
          { key: 'customer', label: 'Customer Details', icon: UserIcon },
          { key: 'invoices', label: `Invoices (${relatedInvoices.length})`, icon: FileText },
          { key: 'payments', label: `Payments (${relatedPayments.length})`, icon: CreditCard },
          { key: 'history', label: `Reconciliation (${relatedExceptions.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Policy Configuration & Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Annual Premium</span>
                <span className="text-lg font-bold text-slate-100">{formatINR(policy.annualPremium)}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Monthly Installment</span>
                <span className="text-lg font-bold text-slate-100">{formatINR(policy.monthlyPremium)}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Billing Frequency</span>
                <span className="text-lg font-bold text-slate-100">{policy.billingFrequency}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Effective Coverage Date</span>
                <span className="text-sm font-semibold text-slate-200">{formatDate(policy.effectiveDate)}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Expiration Date</span>
                <span className="text-sm font-semibold text-slate-200">{formatDate(policy.expirationDate)}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">BillingCenter Policy ID</span>
                <span className="text-sm font-mono font-semibold text-blue-400">{policy.id}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customer' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Policyholder Information
            </h3>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800 space-y-3 max-w-lg">
              <div>
                <span className="text-slate-400 font-medium">Full Name:</span>
                <span className="font-bold text-slate-100 ml-2">{policy.customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email Address:</span>
                <span className="font-bold text-blue-400 ml-2">{policy.customer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Phone Number:</span>
                <span className="font-bold text-slate-200 ml-2">{policy.customer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Billing Address:</span>
                <p className="text-slate-300 mt-1 font-medium">{policy.customer.address}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Invoices Issued
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Expected</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reconciliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {relatedInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="hover:bg-slate-800/60 cursor-pointer"
                    >
                      <td className="p-3 font-bold text-blue-400">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-300">{formatDate(inv.dueDate)}</td>
                      <td className="p-3 font-bold">{formatINR(inv.expectedAmount)}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatINR(inv.paidAmount)}</td>
                      <td className="p-3"><StatusBadge status={inv.status} /></td>
                      <td className="p-3"><StatusBadge status={inv.reconciliationStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Payment Transaction History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Transaction ID</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {relatedPayments.map((pay) => (
                    <tr
                      key={pay.id}
                      onClick={() => router.push(`/payments/${pay.id}`)}
                      className="hover:bg-slate-800/60 cursor-pointer"
                    >
                      <td className="p-3 font-bold text-blue-400">{pay.transactionId}</td>
                      <td className="p-3 text-slate-300">{pay.paymentMethod}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatINR(pay.amount)}</td>
                      <td className="p-3 text-slate-400">{formatDate(pay.paymentDate)}</td>
                      <td className="p-3 font-mono text-slate-400">{pay.reference}</td>
                      <td className="p-3"><StatusBadge status={pay.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Reconciliation Discrepancy Log
            </h3>
            {relatedExceptions.length > 0 ? (
              <div className="space-y-2">
                {relatedExceptions.map((exc) => (
                  <div
                    key={exc.id}
                    onClick={() => router.push(`/exceptions/${exc.id}`)}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-400">
                        {exc.exceptionNumber} ({exc.type})
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Difference: {formatINR(exc.differenceAmount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={exc.severity} isSeverity />
                      <StatusBadge status={exc.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No exceptions detected for this policy. All payments are fully reconciled!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
