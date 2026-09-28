import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Severity, ExceptionType, ExceptionStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number, compact: boolean = false): string {
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      return `${amount < 0 ? '-' : ''}₹${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${amount < 0 ? '-' : ''}₹${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      return `${amount < 0 ? '-' : ''}₹${(abs / 1000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateSeverity(
  diffAmount: number,
  type: ExceptionType
): Severity {
  const absDiff = Math.abs(diffAmount);

  // Failed & Duplicate payments are always at least HIGH
  if (type === 'FAILED_PAYMENT' || type === 'DUPLICATE_PAYMENT') {
    return absDiff > 50000 ? 'CRITICAL' : 'HIGH';
  }

  if (absDiff > 50000) return 'CRITICAL';
  if (absDiff >= 10000) return 'HIGH';
  if (absDiff >= 1000) return 'MEDIUM';
  return 'LOW';
}

export function getSeverityBadgeColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'LOW':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }
}

export function getStatusBadgeColor(status: ExceptionStatus | string): string {
  switch (status) {
    case 'RESOLVED':
    case 'MATCHED':
    case 'Paid':
    case 'Success':
    case 'COMPLETED':
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'INVESTIGATING':
    case 'Pending':
    case 'Partially Paid':
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'OPEN':
    case 'ESCALATED':
    case 'Failed':
    case 'Unpaid':
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
    case 'UNDERPAYMENT':
    case 'LATE_PAYMENT':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'OVERPAYMENT':
    case 'Overpaid':
    case 'DUPLICATE_PAYMENT':
    case 'MISSING_PAYMENT':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      keys.join(','),
      ...rows.map((row) =>
        keys
          .map((k) => {
            const val = row[k];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
