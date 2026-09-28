'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatDate, downloadCSV } from '@/lib/utils';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'invoiceNumber' | 'expectedAmount'>('invoiceNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === 'expectedAmount') {
      return sortOrder === 'asc'
        ? a.expectedAmount - b.expectedAmount
        : b.expectedAmount - a.expectedAmount;
    }
    return sortOrder === 'asc'
      ? a.invoiceNumber.localeCompare(b.invoiceNumber)
      : b.invoiceNumber.localeCompare(a.invoiceNumber);
  });

  const totalPages = Math.ceil(sortedInvoices.length / pageSize) || 1;
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const exportData = sortedInvoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      PolicyNumber: inv.policyNumber,
      Customer: inv.customerName,
      ProductType: inv.productType,
      DueDate: inv.dueDate,
      ExpectedAmount: inv.expectedAmount,
      PaidAmount: inv.paidAmount,
      OutstandingAmount: inv.outstandingAmount,
      Status: inv.status,
      ReconciliationStatus: inv.reconciliationStatus,
    }));
    downloadCSV('InsureFlow_Invoices_Export', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" /> Premium Invoices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Guidewire BillingCenter generated premium invoice schedules
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 border border-slate-700 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Invoices CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Invoice #, Policy, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overpaid">Overpaid</option>
          </select>

          <button
            onClick={() => {
              setSortField('expectedAmount');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort Expected ({sortOrder})
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Policy / Customer</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Expected</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-blue-400">{inv.invoiceNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {inv.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500">{inv.policyNumber}</div>
                  </td>
                  <td className="p-3 text-slate-400">{formatDate(inv.dueDate)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(inv.expectedAmount)}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    {formatINR(inv.paidAmount)}
                  </td>
                  <td className="p-3 font-bold text-red-400">
                    {formatINR(inv.outstandingAmount)}
                  </td>
                  <td className="p-3"><StatusBadge status={inv.status} /></td>
                  <td className="p-3"><StatusBadge status={inv.reconciliationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedInvoices.length)} of {sortedInvoices.length}{' '}
            invoices
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
