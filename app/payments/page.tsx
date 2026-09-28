'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatDate, downloadCSV } from '@/lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const { payments } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'transactionId' | 'amount'>('transactionId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'ALL' || pay.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || pay.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return sortOrder === 'asc'
      ? a.transactionId.localeCompare(b.transactionId)
      : b.transactionId.localeCompare(a.transactionId);
  });

  const totalPages = Math.ceil(sortedPayments.length / pageSize) || 1;
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const exportData = sortedPayments.map((p) => ({
      TransactionID: p.transactionId,
      PolicyNumber: p.policyNumber,
      InvoiceNumber: p.invoiceNumber,
      Customer: p.customerName,
      Amount: p.amount,
      PaymentDate: p.paymentDate,
      PaymentMethod: p.paymentMethod,
      Status: p.status,
      Reference: p.reference,
    }));
    downloadCSV('InsureFlow_Payments_Export', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-500" /> Payment Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Incoming bank transfers, UPI settlements & gateway transaction logs
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 border border-slate-700 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Payments CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search TXN ID, Customer, Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Auto Debit">Auto Debit (NACH)</option>
            <option value="Cheque">Cheque</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Gateway Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button
            onClick={() => {
              setSortField('amount');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort Amount ({sortOrder})
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Policy / Customer</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Method</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPayments.map((pay) => (
                <tr
                  key={pay.id}
                  onClick={() => router.push(`/payments/${pay.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-blue-400">{pay.transactionId}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {pay.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500">{pay.policyNumber}</div>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{pay.invoiceNumber}</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {formatINR(pay.amount)}
                  </td>
                  <td className="p-3 text-slate-400">{formatDate(pay.paymentDate)}</td>
                  <td className="p-3 text-slate-300 font-medium">{pay.paymentMethod}</td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">{pay.reference}</td>
                  <td className="p-3"><StatusBadge status={pay.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedPayments.length)} of {sortedPayments.length}{' '}
            payments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
