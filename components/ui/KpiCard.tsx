import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20';
      case 'danger':
        return 'border-red-500/30 bg-red-500/5 dark:bg-red-950/20';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
    }
  };

  return (
    <div
      className={cn(
        'p-5 rounded-xl border shadow-sm transition-all hover:shadow-md relative overflow-hidden',
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          {value}
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5',
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
