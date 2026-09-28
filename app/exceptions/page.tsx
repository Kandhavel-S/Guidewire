'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Search, Filter, Download, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatDate, downloadCSV } from '@/lib/utils';

export default function ExceptionsPage() {
  const router = useRouter();
  const { exceptions, nlSearchQuery, setNLSearchQuery } = useAppStore();

  const [searchTerm, setSearchTerm] = useState(nlSearchQuery || '');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Dynamic summary KPI cards
  const openCount = exceptions.filter((e) => e.status === 'OPEN').length;
  const investigatingCount = exceptions.filter((e) => e.status === 'INVESTIGATING').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'RESOLVED').length;
  const criticalCount = exceptions.filter((e) => e.severity === 'CRITICAL' && e.status !== 'RESOLVED').length;

  // Filter pipeline
  const qLower = searchTerm.toLowerCase().trim();
  const nlFiltered = searchTerm
    ? exceptions.filter(
        (e) =>
          e.exceptionNumber?.toLowerCase().includes(qLower) ||
          (e as any).customerName?.toLowerCase().includes(qLower) ||
          (e as any).policyNumber?.toLowerCase().includes(qLower) ||
          e.type?.toLowerCase().includes(qLower)
      )
    : exceptions;

  const filteredExceptions = nlFiltered.filter((exc) => {
    const matchesSeverity = severityFilter === 'ALL' || exc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || exc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || exc.type === typeFilter;
    const matchesAssignee = assigneeFilter === 'ALL' || exc.assignee === assigneeFilter;

    return matchesSeverity && matchesStatus && matchesType && matchesAssignee;
  });

  const totalPages = Math.ceil(filteredExceptions.length / pageSize) || 1;
  const paginatedExceptions = filteredExceptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const exportData = filteredExceptions.map((e) => ({
      ExceptionNumber: e.exceptionNumber,
      IssueType: e.type,
      PolicyNumber: e.policyNumber,
      Customer: e.customerName,
      ExpectedAmount: e.expectedAmount,
      ActualAmount: e.actualAmount,
      DifferenceAmount: e.differenceAmount,
      Severity: e.severity,
      Assignee: e.assignee,
      Status: e.status,
      CreatedAt: e.createdAt,
    }));
    downloadCSV('InsureFlow_Payment_Exceptions_Export', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" /> Operations Command Center — Payment Exceptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Investigate, assign, and resolve reconciliation discrepancies & gateway failures
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 border border-slate-700 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Exceptions CSV
        </button>
      </div>

      {/* Operational Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Open Exceptions"
          value={openCount}
          subtitle="Awaiting initial triage"
          icon={AlertTriangle}
          variant="danger"
        />
        <KpiCard
          title="Under Investigation"
          value={investigatingCount}
          subtitle="Assigned to analysts"
          icon={UserCheck}
          variant="warning"
        />
        <KpiCard
          title="Resolved Cases"
          value={resolvedCount}
          subtitle="Closed discrepancies"
          icon={CheckCircle2}
          variant="success"
        />
        <KpiCard
          title="Critical Risk Threshold"
          value={criticalCount}
          subtitle="Discrepancies > ₹50,000"
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search or AI query ('unresolved high value exceptions')..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setNLSearchQuery(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Issue Types</option>
            <option value="UNDERPAYMENT">UNDERPAYMENT</option>
            <option value="OVERPAYMENT">OVERPAYMENT</option>
            <option value="MISSING_PAYMENT">MISSING PAYMENT</option>
            <option value="DUPLICATE_PAYMENT">DUPLICATE PAYMENT</option>
            <option value="LATE_PAYMENT">LATE PAYMENT</option>
            <option value="FAILED_PAYMENT">FAILED PAYMENT</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            <option value="Admin">Admin</option>
            <option value="Finance Analyst">Finance Analyst</option>
            <option value="Operations User">Operations User</option>
          </select>
        </div>
      </div>

      {/* Exceptions Data Table */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Exception ID</th>
                <th className="p-3">Discrepancy Issue</th>
                <th className="p-3">Policy / Customer</th>
                <th className="p-3">Difference</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedExceptions.map((exc) => (
                <tr
                  key={exc.id}
                  onClick={() => router.push(`/exceptions/${exc.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-blue-400">{exc.exceptionNumber}</td>
                  <td className="p-3 font-semibold text-slate-100">{exc.type.replace('_', ' ')}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {exc.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500">{exc.policyNumber}</div>
                  </td>
                  <td className="p-3 font-bold text-red-400">
                    {formatINR(exc.differenceAmount)}
                  </td>
                  <td className="p-3"><StatusBadge status={exc.severity} isSeverity /></td>
                  <td className="p-3 font-medium text-slate-300">{exc.assignee}</td>
                  <td className="p-3"><StatusBadge status={exc.status} /></td>
                  <td className="p-3 text-slate-400">{formatDate(exc.updatedAt)}</td>
                </tr>
              ))}

              {paginatedExceptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No exceptions found matching your search and filter criteria.
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
            {Math.min(currentPage * pageSize, filteredExceptions.length)} of {filteredExceptions.length}{' '}
            exceptions
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
