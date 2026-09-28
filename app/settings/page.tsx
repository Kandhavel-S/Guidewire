'use client';

import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, RefreshCw, Info, Building2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatINR } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings, resetDemoData } = useAppStore();

  const [lowThreshold, setLowThreshold] = useState(settings.lowSeverityThreshold);
  const [medThreshold, setMedThreshold] = useState(settings.mediumSeverityThreshold);
  const [highThreshold, setHighThreshold] = useState(settings.highSeverityThreshold);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      lowSeverityThreshold: Number(lowThreshold),
      mediumSeverityThreshold: Number(medThreshold),
      highSeverityThreshold: Number(highThreshold),
    });
    setToastMessage('Reconciliation severity thresholds updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetConfirm = () => {
    resetDemoData();
    setToastMessage('Demo dataset restored to initial seed state.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" /> Platform Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure appearance, reconciliation thresholds & manage demo environment data
        </p>
      </div>

      {/* Appearance Theme Card */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Appearance Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize interface color scheme
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              settings.theme === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" /> Light Mode
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'
            }`}
          >
            <Moon className="w-4 h-4 text-purple-400" /> Dark Mode
          </button>
          <button
            onClick={() => updateSettings({ theme: 'system' })}
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              settings.theme === 'system'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'
            }`}
          >
            <Monitor className="w-4 h-4 text-slate-400" /> System Default
          </button>
        </div>
      </div>

      {/* Reconciliation Severity Thresholds Card */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Reconciliation Severity Thresholds (₹)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure financial variance thresholds used to auto-calculate exception risk severity
        </p>

        <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Low Severity Upper Limit (₹)
              </label>
              <input
                type="number"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Medium Severity Upper Limit (₹)
              </label>
              <input
                type="number"
                value={medThreshold}
                onChange={(e) => setMedThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                High Severity Upper Limit (₹)
              </label>
              <input
                type="number"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Save Severity Thresholds
          </button>
        </form>
      </div>

      {/* Demo Environment Management */}
      <div className="p-6 rounded-xl border border-red-500/30 bg-red-950/10 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Demo Environment Reset
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restore original demonstration dataset, reset all local modifications, clear investigation notes and re-run initial reconciliation.
        </p>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
        >
          Reset Demo Data
        </button>
      </div>

      {/* Application Info */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-400" /> Platform Specification
        </h3>
        <div className="space-y-1.5 text-slate-300">
          <div><strong>Product Name:</strong> InsureFlow</div>
          <div><strong>Subtitle:</strong> Premium Reconciliation & Exception Management</div>
          <div className="flex items-center gap-1 text-blue-400 font-semibold">
            <Building2 className="w-3.5 h-3.5" /> Powered by Guidewire BillingCenter
          </div>
          <div><strong>Architecture:</strong> Frontend-Only LocalStorage Persistence</div>
          <div><strong>Engine:</strong> Deterministic Financial Reconciliation with AI Triage</div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Demo Data?"
        description="Are you sure? This will restore the original demonstration dataset and remove all investigation notes, assignments, and custom status changes."
        confirmText="Yes, Reset All Data"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
