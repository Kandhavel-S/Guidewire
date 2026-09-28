'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, ArrowUpDown, ShieldCheck, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatDate, downloadCSV } from '@/lib/utils';

export default function PoliciesPage() {
  const router = useRouter();
  const { policies } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'policyNumber' | 'annualPremium'>('policyNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredPolicies = policies.filter((pol) => {
    const matchesSearch =
      pol.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pol.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pol.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = productFilter === 'ALL' || pol.productType === productFilter;
    const matchesStatus = statusFilter === 'ALL' || pol.status === statusFilter;

    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Sort logic
  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    if (sortField === 'annualPremium') {
      return sortOrder === 'asc'
        ? a.annualPremium - b.annualPremium
        : b.annualPremium - a.annualPremium;
    }
    return sortOrder === 'asc'
      ? a.policyNumber.localeCompare(b.policyNumber)
      : b.policyNumber.localeCompare(a.policyNumber);
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPolicies.length / pageSize) || 1;
  const paginatedPolicies = sortedPolicies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const exportData = sortedPolicies.map((p) => ({
      PolicyNumber: p.policyNumber,
      Customer: p.customer.name,
      Email: p.customer.email,
      ProductType: p.productType,
      AnnualPremium: p.annualPremium,
      MonthlyPremium: p.monthlyPremium,
      Frequency: p.billingFrequency,
      EffectiveDate: p.effectiveDate,
      ExpirationDate: p.expirationDate,
      Status: p.status,
    }));
    downloadCSV('InsureFlow_Policies_Export', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" /> Policy Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active Guidewire BillingCenter customer policies & coverage terms
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 self-start sm:self-auto border border-slate-700"
        >
          <Download className="w-4 h-4" /> Export Policies CSV
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Policy #, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Products</option>
            <option value="Health Insurance">Health Insurance</option>
            <option value="Motor Insurance">Motor Insurance</option>
            <option value="Term Life Insurance">Term Life Insurance</option>
            <option value="Commercial Property">Commercial Property</option>
            <option value="Home Insurance">Home Insurance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button
            onClick={() => {
              setSortField('annualPremium');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort Premium ({sortOrder})
          </button>
        </div>
      </div>

      {/* Policies Data Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Policy Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product Type</th>
                <th className="p-3">Annual Premium</th>
                <th className="p-3">Billing Freq</th>
                <th className="p-3">Effective Date</th>
                <th className="p-3">Expiration Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPolicies.map((pol) => (
                <tr
                  key={pol.id}
                  onClick={() => router.push(`/policies/${pol.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-blue-400">{pol.policyNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {pol.customer.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{pol.customer.email}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-300">{pol.productType}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(pol.annualPremium)}
                  </td>
                  <td className="p-3 text-slate-400">{pol.billingFrequency}</td>
                  <td className="p-3 text-slate-400">{formatDate(pol.effectiveDate)}</td>
                  <td className="p-3 text-slate-400">{formatDate(pol.expirationDate)}</td>
                  <td className="p-3">
                    <StatusBadge status={pol.status} />
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-blue-500 font-semibold hover:underline">View</span>
                  </td>
                </tr>
              ))}

              {paginatedPolicies.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No matching policies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedPolicies.length)} of {sortedPolicies.length}{' '}
            policies
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
