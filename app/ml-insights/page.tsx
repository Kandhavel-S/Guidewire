'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, BrainCircuit, Clock3, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { mlApi, MLPrediction } from '@/lib/api/ml';

function riskClass(risk: string): string {
  if (risk === 'HIGH') return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (risk === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
}

export default function MLInsightsPage() {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    mlApi.getPredictions().then((response) => {
      if (!mounted) return;
      if (!response.success) setError(response.error || 'Unable to load ML predictions.');
      setPredictions(response.data || []);
      setIsLoading(false);
    }).catch(() => {
      if (mounted) {
        setError('ML analysis currently unavailable.');
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(
    () => riskFilter === 'ALL' ? predictions : predictions.filter((item) => item.riskLevel === riskFilter),
    [predictions, riskFilter]
  );
  const anomalies = predictions.filter((item) => item.predictionType === 'PAYMENT_ANOMALY');
  const latePayments = predictions.filter((item) => item.predictionType === 'LATE_PAYMENT');
  const highRisk = predictions.filter((item) => item.riskLevel === 'HIGH');
  const metrics: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'Payments Analyzed', value: predictions.length, Icon: Activity },
    { label: 'Anomalies Detected', value: anomalies.filter((item) => item.prediction).length, Icon: AlertTriangle },
    { label: 'High Risk Predictions', value: highRisk.length, Icon: ShieldAlert },
    { label: 'Late Payment Assessments', value: latePayments.length, Icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><BrainCircuit className="w-7 h-7" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Anomaly Detection</h1>
            <p className="text-sm text-slate-400 mt-1">Machine learning assessment of payment anomalies and late-payment risk.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, Icon }) => (
          <div key={label} className="p-5 rounded-xl border border-slate-800 bg-slate-900">
            <Icon className="w-5 h-5 text-cyan-400 mb-3" />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Prediction Register</h2>
            <p className="text-xs text-slate-500 mt-1">ML prediction, not a financial determination.</p>
          </div>
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300">
            <option value="ALL">All risk levels</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {isLoading && <div className="py-8 text-center text-sm text-slate-400">Loading ML predictions...</div>}
        {error && <div className="py-8 text-center text-sm text-amber-300">{error}</div>}
        {!isLoading && !error && filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-500">No payment assessments were generated from the available history.</div>}
        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase border-b border-slate-800"><tr><th className="p-3">Type</th><th className="p-3">Policy / Exception</th><th className="p-3">Score</th><th className="p-3">Risk</th><th className="p-3">Model</th><th className="p-3">Created</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-semibold text-slate-300">{item.predictionType === 'PAYMENT_ANOMALY' ? 'Payment anomaly' : 'Late payment'}</td>
                    <td className="p-3 text-slate-400">{item.exception?.exceptionNumber || item.payment?.policy?.policyNumber || 'N/A'}</td>
                    <td className="p-3 font-bold text-cyan-300">{(item.score * 100).toFixed(1)}%</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded border text-[10px] font-bold ${riskClass(item.riskLevel)}`}>{item.riskLevel}</span></td>
                    <td className="p-3 text-slate-400">{item.modelName} v{item.modelVersion}</td>
                    <td className="p-3 text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
