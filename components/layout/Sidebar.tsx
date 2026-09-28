'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  isAI?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { currentUser, logout, exceptions } = useAppStore();

  const openExceptionsCount = exceptions.filter((e) => e.status !== 'RESOLVED').length;

  const navSections: NavSection[] = [
    {
      label: 'MAIN',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'BILLING',
      items: [
        {
          name: 'Policies',
          href: '/policies',
          icon: ShieldCheck,
        },
        {
          name: 'Invoices',
          href: '/invoices',
          icon: FileText,
        },
        {
          name: 'Payments',
          href: '/payments',
          icon: CreditCard,
        },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        {
          name: 'Reconciliation',
          href: '/reconciliation',
          icon: RefreshCw,
        },
        {
          name: 'Exceptions',
          href: '/exceptions',
          icon: AlertTriangle,
          badge: openExceptionsCount > 0 ? openExceptionsCount : undefined,
        },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        {
          name: 'Reports',
          href: '/reports',
          icon: BarChart3,
        },
        {
          name: 'AI Insights',
          href: '/ai-insights',
          icon: Sparkles,
          isAI: true,
        },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        {
          name: 'Settings',
          href: '/settings',
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
            IF
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                INSUREFLOW
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                Reconciliation & Exceptions
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Powered by Guidewire Banner */}
      {!isCollapsed && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-400">
            Powered by <strong className="text-slate-200 font-semibold">Guidewire BillingCenter</strong>
          </span>
        </div>
      )}

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative group',
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive
                        ? 'text-blue-400'
                        : item.isAI
                        ? 'text-purple-400 group-hover:text-purple-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {!isCollapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'F'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {currentUser?.name || 'Finance Analyst'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'admin@insurance.com'}
              </div>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        >
          <div
            className="w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
