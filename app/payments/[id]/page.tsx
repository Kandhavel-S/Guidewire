'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatINR, formatDate } from '@/lib/utils';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { payments, policies, invoices, exceptions } = useAppStore();

  const paymentId = params?.id as string;
  const payment = payments.find(
    (p) => p.id === paymentId || p.transactionId.toLowerCase() === paymentId?.toLowerCase()
  );

  if (!payment) {
    return (
      <ErrorState
        title="Payment Record Not Found"
        description={`No payment transaction found matching ID '${paymentId}'.`}
        onRetry={() => router.push('/payments')}
      />
    );
  }

  const policy = policies.find((p) => p.id === payment.policyId);
  const invoice = invoices.find((i) => i.id === payment.invoiceId);
  const relatedException = exceptions.find((e) => e.invoiceId === payment.invoiceId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/payments')}
        className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Payments
      </button>

      {/* Fintech Receipt Card */}
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Status Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Payment {payment.status}
          </span>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            {formatINR(payment.amount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{payment.customerName}</p>
        </div>

        {/* Key Transaction Fields */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-3">
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">Transaction ID</span>
            <span className="font-bold font-mono text-blue-400">{payment.transactionId}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-semibold text-slate-200">{payment.paymentMethod}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">Payment Date</span>
            <span className="font-semibold text-slate-200">{formatDate(payment.paymentDate)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-400">Reference String</span>
            <span className="font-mono text-slate-300">{payment.reference}</span>
          </div>

          {payment.gatewayResponse && (
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Gateway Response</span>
              <span className="text-slate-400 font-medium">{payment.gatewayResponse}</span>
            </div>
          )}
        </div>

        {/* Related Entities Links */}
        <div className="space-y-3 text-xs text-left pt-2">
          <h4 className="font-bold text-slate-400 uppercase tracking-wider">Related Context</h4>

          <div
            onClick={() => router.push(`/policies/${policy?.id || payment.policyId}`)}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{payment.policyNumber}</div>
                <div className="text-[11px] text-slate-500">Related Policy</div>
              </div>
            </div>
            <span className="text-blue-500 font-semibold">View</span>
          </div>

          <div
            onClick={() => router.push(`/invoices/${invoice?.id || payment.invoiceId}`)}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{payment.invoiceNumber}</div>
                <div className="text-[11px] text-slate-500">Related Invoice</div>
              </div>
            </div>
            <span className="text-blue-500 font-semibold">View</span>
          </div>

          {relatedException && (
            <div
              onClick={() => router.push(`/exceptions/${relatedException.id}`)}
              className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-bold text-amber-400">{relatedException.exceptionNumber} ({relatedException.type})</div>
                  <div className="text-[11px] text-amber-300">Flagged Exception</div>
                </div>
              </div>
              <span className="text-amber-400 font-semibold">Investigate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
