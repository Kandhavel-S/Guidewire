import React from 'react';
import { cn, getStatusBadgeColor, getSeverityBadgeColor } from '@/lib/utils';
import { Severity } from '@/types';

interface StatusBadgeProps {
  status: string;
  isSeverity?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isSeverity = false,
  className,
}) => {
  const colorClasses = isSeverity
    ? getSeverityBadgeColor(status as Severity)
    : getStatusBadgeColor(status);

  const displayLabel = status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors',
        colorClasses,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayLabel}
    </span>
  );
};
