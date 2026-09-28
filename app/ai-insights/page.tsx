'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, RefreshCw, AlertCircle, CircleAlert, Lightbulb } from 'lucide-react';
import { aiApi } from '@/lib/api/ai';

interface AIInsight {
  title: string;
  description?: string;
  finding?: string;
  impact?: string;
  recommendedAction?: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | string;
}

function normalizeInsight(insight: AIInsight): AIInsight {
  return {
    ...insight,
    finding: insight.finding || insight.description || 'No finding provided.',
    impact: insight.impact || 'Impact was not specified by the AI response.',
    recommendedAction: insight.recommendedAction || 'Review this finding and determine the next action.',
  };
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiApi.getDashboardInsights();
      if (!response.success) {
        throw new Error(response.error || 'Unable to load AI insights.');
      }
      setInsights((response.data?.insights || []).map(normalizeInsight));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load AI insights.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reconciliation Intelligence
            </h1>
            <p className="text-sm text-purple-200 mt-0.5">
              AI-powered analytical findings synthesized from live Guidewire BillingCenter ledger data
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" /> Live AI Findings
        </h2>
        <button
          onClick={() => void loadInsights()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-sm text-slate-400">Generating insights from current reconciliation data...</div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {!isLoading && !error && insights.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400">No AI insights were returned.</div>
      )}

      {!isLoading && !error && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="p-6 rounded-xl border border-purple-500/20 bg-white dark:bg-slate-900 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs">AI Finding</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-800 text-slate-300">
                  {insight.severity}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{insight.title}</h3>
              </div>

              <div className="grid gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <CircleAlert className="w-3.5 h-3.5 text-amber-500" /> Finding
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{insight.finding}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div className="font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Impact</div>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{insight.impact}</p>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-purple-300">
                    <Lightbulb className="w-3.5 h-3.5" /> Recommended Action
                  </div>
                  <p className="mt-1 leading-relaxed text-purple-100">{insight.recommendedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
