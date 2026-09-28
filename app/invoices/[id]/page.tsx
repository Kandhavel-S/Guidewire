'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, ShieldCheck, User as UserIcon, CreditCard, Building2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatINR, formatDate } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, policies, payments } = useAppStore();

  const invoiceId = params?.id as string;
  const invoice = invoices.find(
    (i) => i.id === invoiceId || i.invoiceNumber.toLowerCase() === invoiceId?.toLowerCase()
  );

  if (!invoice) {
    return (
      <ErrorState
        title="Invoice Not Found"
        description={`No invoice record found matching ID '${invoiceId}'.`}
        onRetry={() => router.push('/invoices')}
      />
    );
  }

  const policy = policies.find((p) => p.id === invoice.policyId);
  const relatedPayments = payments.filter((p) => p.invoiceId === invoice.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/invoices')}
        className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
      </button>

      {/* Financial Document Card Container */}
      <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-8 relative overflow-hidden">
        {/* Top Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  {invoice.invoiceNumber}
                </h1>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Issued: {formatDate(invoice.issueDate)} • Due Date: {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">
              Guidewire BillingCenter
            </div>
            <div className="text-xs font-mono text-blue-400 mt-0.5">Ref: {invoice.id}</div>
          </div>
        </div>

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase">Expected Amount</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {formatINR(invoice.expectedAmount)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs font-semibold text-emerald-400 uppercase">Paid Amount</span>
            <div className="text-2xl font-extrabold text-emerald-500 mt-1">
              {formatINR(invoice.paidAmount)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <span className="text-xs font-semibold text-red-400 uppercase">Remaining Balance</span>
            <div className="text-2xl font-extrabold text-red-500 mt-1">
              {formatINR(invoice.outstandingAmount)}
            </div>
          </div>
        </div>

        {/* Policy & Customer Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Policy Info */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Policy Details
            </h3>
            <div>
              <span className="text-slate-400">Policy Number:</span>
              <span
                onClick={() => router.push(`/policies/${policy?.id || invoice.policyId}`)}
                className="font-bold text-blue-400 ml-2 hover:underline cursor-pointer"
              >
                {invoice.policyNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Product Line:</span>
              <span className="font-semibold text-slate-200 ml-2">{invoice.productType}</span>
            </div>
            <div>
              <span className="text-slate-400">Policy Status:</span>
              <span className="ml-2 font-semibold text-emerald-400">{policy?.status || 'ACTIVE'}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-purple-500" /> Customer Details
            </h3>
            <div>
              <span className="text-slate-400">Full Name:</span>
              <span className="font-bold text-slate-100 ml-2">{invoice.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-blue-400 ml-2">{policy?.customer.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span>
              <span className="font-semibold text-slate-200 ml-2">{policy?.customer.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-500" /> Payment Remittances
          </h3>
          {relatedPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Transaction ID</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Gateway Status</th>
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
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
              No payments logged for this invoice yet.
            </div>
          )}
        </div>

        {/* Reconciliation Status */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Engine Reconciliation Status:</span>
          <StatusBadge status={invoice.reconciliationStatus} />
        </div>
      </div>
    </div>
  );
}
