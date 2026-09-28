'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X, ShieldCheck, FileText, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { policies, invoices, payments, exceptions, setNLSearchQuery } = useAppStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const qLower = query.toLowerCase().trim();

  // Natural Language Intent Check
  const isNLQuery =
    qLower.includes('unresolved') ||
    qLower.includes('high value') ||
    qLower.includes('above') ||
    qLower.includes('underpayment') ||
    qLower.includes('failed') ||
    qLower.includes('critical');

  const nlFilter = isNLQuery
    ? {
        severity: qLower.includes('critical') ? ['CRITICAL'] : qLower.includes('high') ? ['HIGH'] : null,
        type: qLower.includes('underpayment') ? ['UNDERPAYMENT'] : null,
        productType: qLower.includes('health') ? 'HEALTH' : null,
      }
    : null;

  // Search Results
  const matchingPolicies = query
    ? policies.filter(
        (p) =>
          p.policyNumber.toLowerCase().includes(qLower) ||
          p.customer.name.toLowerCase().includes(qLower) ||
          p.productType.toLowerCase().includes(qLower)
      ).slice(0, 3)
    : [];

  const matchingInvoices = query
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(qLower) ||
          i.customerName.toLowerCase().includes(qLower)
      ).slice(0, 3)
    : [];

  const matchingPayments = query
    ? payments.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(qLower) ||
          p.customerName.toLowerCase().includes(qLower) ||
          p.reference.toLowerCase().includes(qLower)
      ).slice(0, 3)
    : [];

  const matchingExceptions = query
    ? exceptions.filter(
        (e) =>
          e.exceptionNumber.toLowerCase().includes(qLower) ||
          e.customerName.toLowerCase().includes(qLower) ||
          e.policyNumber.toLowerCase().includes(qLower) ||
          e.type.toLowerCase().includes(qLower)
      ).slice(0, 3)
    : [];

  const handleNLSearchRedirect = () => {
    setNLSearchQuery(query);
    router.push('/exceptions');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search policies, invoices, payments, exceptions or ask AI (e.g. 'unresolved high value exceptions')..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-500 uppercase tracking-wider">
                Quick Shortcuts & Natural Language AI Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setQuery('unresolved high value exceptions')}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>"unresolved high value exceptions"</span>
                </button>
                <button
                  onClick={() => setQuery('failed payments above ₹10,000')}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>"failed payments above ₹10,000"</span>
                </button>
                <button
                  onClick={() => setQuery('underpayments for health insurance')}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>"underpayments for health insurance"</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Natural Language Query Interpretation Banner */}
          {isNLQuery && nlFilter && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>
                  AI Filter Detected:{' '}
                  <strong className="text-white font-semibold">
                    {nlFilter.severity ? `Severity: ${nlFilter.severity.join(', ')}` : ''}{' '}
                    {nlFilter.type ? `Type: ${nlFilter.type.join(', ')}` : ''}{' '}
                    {nlFilter.productType ? `Product: ${nlFilter.productType}` : ''}
                  </strong>
                </span>
              </div>
              <button
                onClick={handleNLSearchRedirect}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                Apply AI Filter <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Exceptions */}
          {matchingExceptions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Exceptions
              </div>
              <div className="space-y-1">
                {matchingExceptions.map((exc) => (
                  <button
                    key={exc.id}
                    onClick={() => {
                      router.push(`/exceptions/${exc.id}`);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {exc.exceptionNumber} ({exc.type})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {exc.customerName} • {exc.policyNumber}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-red-400">
                      {formatINR(exc.differenceAmount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Policies */}
          {matchingPolicies.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Policies
              </div>
              <div className="space-y-1">
                {matchingPolicies.map((pol) => (
                  <button
                    key={pol.id}
                    onClick={() => {
                      router.push(`/policies/${pol.id}`);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {pol.policyNumber} - {pol.productType}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {pol.customer.name} ({pol.customer.email})
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-300">
                      {formatINR(pol.monthlyPremium)}/mo
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchingInvoices.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Invoices
              </div>
              <div className="space-y-1">
                {matchingInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      router.push(`/invoices/${inv.id}`);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {inv.customerName} • Due: {inv.dueDate}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {formatINR(inv.expectedAmount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {matchingPayments.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Payments
              </div>
              <div className="space-y-1">
                {matchingPayments.map((pay) => (
                  <button
                    key={pay.id}
                    onClick={() => {
                      router.push(`/payments/${pay.id}`);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {pay.transactionId} ({pay.paymentMethod})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {pay.customerName} • {pay.paymentDate}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-400">
                      {formatINR(pay.amount)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
