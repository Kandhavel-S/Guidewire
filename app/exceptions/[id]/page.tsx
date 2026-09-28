'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageSquarePlus,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState, LoadingState } from '@/components/ui/EmptyState';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { formatINR, formatDate } from '@/lib/utils';
import { aiApi } from '@/lib/api/ai';
import { exceptionsApi } from '@/lib/api/exceptions';
import { mlApi, MLPrediction } from '@/lib/api/ml';
import { ExceptionStatus } from '@/types';

export default function ExceptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    exceptions,
    policies,
    invoices,
    payments,
    assignException,
    updateExceptionStatus,
    addExceptionNote,
    resolveException,
  } = useAppStore();

  const exceptionId = params?.id as string;

  const [exceptionDetail, setExceptionDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);

  const [noteText, setNoteText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingDetail(true);

    // Try finding in store first for fast load
    const storeExc = (exceptions || []).find(
      (e) => e && (e.id === exceptionId || e.exceptionNumber?.toLowerCase() === exceptionId?.toLowerCase())
    );
    if (storeExc) {
      setExceptionDetail(storeExc);
    }

    // Always fetch detailed record (with full notes and timeline) from backend API
    exceptionsApi.getExceptionById(exceptionId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setExceptionDetail(res.data);
      }
      setIsLoadingDetail(false);
    }).catch(() => {
      if (isMounted) setIsLoadingDetail(false);
    });

    return () => {
      isMounted = false;
    };
  }, [exceptionId, exceptions]);

  useEffect(() => {
    if (!exceptionId) return;
    mlApi.getExceptionPredictions(exceptionId).then((response) => {
      if (response.success) setMlPredictions(response.data || []);
    }).catch(() => {
      setMlPredictions([]);
    });
  }, [exceptionId]);

  if (isLoadingDetail && !exceptionDetail) {
    return <LoadingState message="Loading payment exception details..." />;
  }

  if (!exceptionDetail) {
    return (
      <ErrorState
        title="Exception Record Not Found"
        description={`No payment exception record matching ID '${exceptionId}'.`}
        onRetry={() => router.push('/exceptions')}
      />
    );
  }

  const exc = exceptionDetail;

  const customerName = exc.customerName || exc.policy?.policyholder?.name || 'Customer';
  const policyNumber = exc.policyNumber || exc.policy?.policyNumber || 'N/A';
  const invoiceNumber = exc.invoiceNumber || exc.invoice?.invoiceNumber || 'N/A';
  const productType = exc.productType || exc.policy?.policyType || 'Insurance';
  const expectedAmount = Number(exc.expectedAmount || 0);
  const actualAmount = Number(exc.actualAmount || 0);
  const differenceAmount = Number(exc.differenceAmount ?? exc.difference ?? 0);
  const assigneeName = exc.assignee || exc.assignedTo?.name || 'Unassigned';
  const notesList = Array.isArray(exc.notes) ? exc.notes : [];
  const timelineList = Array.isArray(exc.timeline) ? exc.timeline : [];

  const policy = (policies || []).find((p) => p.id === exc.policyId) || exc.policy;
  const invoice = (invoices || []).find((i) => i.id === exc.invoiceId) || exc.invoice;
  const payment = (payments || []).find((p) => p.id === exc.paymentId) || exc.payment;

  // AI Analysis Handler
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    const steps = [
      'Analyzing transaction data...',
      'Reviewing payment gateway history...',
      'Comparing invoice schedule...',
      'Identifying root cause & recommendations...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiStep(i);
      await new Promise((res) => setTimeout(res, 300));
    }

    try {
      const res = await aiApi.analyzeException(exc.id);
      if (res.success && res.data?.analysis) {
        const a = res.data.analysis;
        setAiAnalysis({
          confidenceScore: a.confidence === 'HIGH' ? 95 : a.confidence === 'MEDIUM' ? 75 : 55,
          likelyCause: a.likelyCause || a.summary,
          financialImpact: a.financialImpact,
          explanation: a.summary,
          recommendedSteps: a.recommendedActions || [],
        });
      } else {
        setAiAnalysis({
          confidenceScore: 0,
          likelyCause: 'Analysis unavailable',
          financialImpact: 'Unable to determine',
          explanation: res.error || 'The AI analysis service returned an unexpected response. Please try again.',
          recommendedSteps: [],
        });
      }
    } catch (error) {
      setAiAnalysis({
        confidenceScore: 0,
        likelyCause: 'Analysis failed',
        financialImpact: 'Unable to determine',
        explanation: 'Failed to connect to the AI analysis service. Please check your connection and try again.',
        recommendedSteps: [],
      });
    }
    setIsAnalyzing(false);
  };

  // AI Summary Handler
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await aiApi.generateSummary(exc.id);
      setAiSummary(res.data?.summary || 'Summary unavailable.');
    } catch {
      setAiSummary('Failed to generate summary. Please try again.');
    }
    setIsGeneratingSummary(false);
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    await addExceptionNote(exc.id, noteText);
    setNoteText('');
    // Refresh detail
    const res = await exceptionsApi.getExceptionById(exc.id);
    if (res.success && res.data) setExceptionDetail(res.data);
  };

  const handleResolveConfirm = async () => {
    await resolveException(exc.id, resolutionNote);
    setShowResolveModal(false);
    setResolutionNote('');
    // Refresh detail
    const res = await exceptionsApi.getExceptionById(exc.id);
    if (res.success && res.data) setExceptionDetail(res.data);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => router.push('/exceptions')}
        className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Exceptions Command Center
      </button>

      {/* Case Header Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {exc.exceptionNumber}
              </h1>
              <span className="text-sm font-semibold text-slate-300">
                ({String(exc.type || '').replace('_', ' ')})
              </span>
              <StatusBadge status={exc.severity} isSeverity />
              <StatusBadge status={exc.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Customer: <strong className="text-slate-200">{customerName}</strong> • Policy: {policyNumber} • Created: {formatDate(exc.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {exc.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Resolve Exception
            </button>
          )}

          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      </div>

      {/* Financial Discrepancy Impact Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Expected Premium</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">
            {formatINR(expectedAmount)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase">Actual Remitted</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {formatINR(actualAmount)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <span className="text-xs text-red-400 font-semibold uppercase">Discrepancy Difference</span>
          <div className="text-2xl font-extrabold text-red-500 mt-1">
            {formatINR(differenceAmount)}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-cyan-500/30 bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">ML Payment Analysis</h3>
            <p className="text-[11px] text-slate-500 mt-1">Advisory assessment, not a financial determination.</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-cyan-300">Model predictions</span>
        </div>

        {mlPredictions.length === 0 ? (
          <p className="text-xs text-slate-500">ML analysis currently unavailable or has not been run for this exception.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlPredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    {prediction.predictionType === 'PAYMENT_ANOMALY' ? 'Anomaly Detection' : 'Late Payment Risk'}
                  </span>
                  <span className={`px-2 py-1 rounded border text-[10px] font-bold ${
                    prediction.riskLevel === 'HIGH'
                      ? 'text-red-400 bg-red-500/10 border-red-500/30'
                      : prediction.riskLevel === 'MEDIUM'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}>{prediction.riskLevel} RISK</span>
                </div>
                <div className="text-2xl font-extrabold text-cyan-300">{(prediction.score * 100).toFixed(1)}%</div>
                <div className="text-[11px] text-slate-400">
                  {prediction.predictionType === 'PAYMENT_ANOMALY' ? 'Anomaly score' : 'Late payment probability'}
                </div>
                <div className="text-[11px] text-slate-500">{prediction.modelName} v{prediction.modelVersion} • {formatDate(prediction.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Exception Analysis Display Panel */}
      {isAnalyzing && (
        <div className="p-6 rounded-xl border border-purple-500/40 bg-purple-950/20 text-purple-200 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4 animate-spin" /> AI Reasoning in progress
          </div>
          <p className="text-xs font-mono text-slate-300">
            {[
              'Analyzing transaction history...',
              'Reviewing payment gateway payload...',
              'Comparing invoice terms...',
              'Synthesizing investigation guidance...',
            ][aiStep]}
          </p>
        </div>
      )}

      {aiAnalysis && (
        <div className="p-6 rounded-xl border border-purple-500/40 bg-slate-900/95 text-slate-100 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Exception Analysis Report
              </h3>
            </div>
            <span className="text-xs text-purple-300 font-semibold">
              Confidence Score: {aiAnalysis.confidenceScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold block">Likely Cause</span>
              <p className="text-slate-300 leading-relaxed">{aiAnalysis.likelyCause}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-bold block">Financial Impact</span>
              <p className="text-slate-300 leading-relaxed">{aiAnalysis.financialImpact}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="text-purple-400 font-bold block">Potential Explanation</span>
            <p className="text-slate-300 leading-relaxed">{aiAnalysis.explanation}</p>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider block">
              Recommended Investigation Steps
            </span>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              {(aiAnalysis.recommendedSteps || []).map((step: any, idx: number) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Case Details + Right Column AI Assistant & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Context Cards + Notes + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Related Entities Cards */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Linked BillingCenter Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => router.push(`/policies/${policy?.id || exc.policyId}`)}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Policy
                </div>
                <div className="font-bold text-blue-400">{policyNumber}</div>
                <div className="text-[11px] text-slate-400">{productType}</div>
              </div>

              <div
                onClick={() => router.push(`/invoices/${invoice?.id || exc.invoiceId}`)}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" /> Invoice
                </div>
                <div className="font-bold text-blue-400">{invoiceNumber}</div>
                <div className="text-[11px] text-slate-400">Due: {formatDate(invoice?.dueDate || exc.invoice?.dueDate)}</div>
              </div>

              <div
                onClick={() => payment && router.push(`/payments/${payment.id}`)}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-800 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Payment TXN
                </div>
                <div className="font-bold text-blue-400">
                  {exc.payment?.transactionId || exc.transactionId || 'No TXN Record'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {exc.payment?.paymentMethod || payment?.paymentMethod || 'Unpaid'}
                </div>
              </div>
            </div>
          </div>

          {/* Add Investigation Note */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-blue-500" /> Investigation Notes ({notesList.length})
              </h3>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Generate AI Summary
              </button>
            </div>

            {/* Generated AI Summary output */}
            {aiSummary && (
              <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 whitespace-pre-line leading-relaxed">
                {aiSummary}
              </div>
            )}

            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an investigation note detailing bank statements, customer contact, or ledger adjustments..."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save Note
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {notesList.map((note: any, idx: number) => (
                <div
                  key={note.id || idx}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex justify-between font-semibold text-slate-400">
                    <span className="text-slate-200">{note.author || note.user?.name || 'Analyst'}</span>
                    <span className="text-[11px]">{formatDate(note.timestamp || note.createdAt)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{note.text || note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Audit Trail */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Case Activity Timeline ({timelineList.length})
            </h3>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
              {timelineList.map((event: any, idx: number) => (
                <div key={event.id || idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-blue-500" />
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {event.title || event.eventType?.replace('_', ' ') || 'Timeline Event'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {event.actor || event.user?.name || 'System'} • {formatDate(event.timestamp || event.createdAt)}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Controls & AI Assistant */}
        <div className="space-y-6">
          {/* Case Management Controls Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Case Triage Settings
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assignee</label>
              <select
                value={assigneeName}
                onChange={async (e) => {
                  await assignException(exc.id, e.target.value);
                  const res = await exceptionsApi.getExceptionById(exc.id);
                  if (res.success && res.data) setExceptionDetail(res.data);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Admin">Admin</option>
                <option value="Finance Analyst">Finance Analyst</option>
                <option value="Operations User">Operations User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={exc.status}
                onChange={async (e) => {
                  await updateExceptionStatus(exc.id, e.target.value as ExceptionStatus);
                  const res = await exceptionsApi.getExceptionById(exc.id);
                  if (res.success && res.data) setExceptionDetail(res.data);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="ESCALATED">ESCALATED</option>
              </select>
            </div>
          </div>

          {/* Interactive AI Assistant */}
          <AIAssistant exception={exc} />
        </div>
      </div>

      {/* Resolve Confirmation Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Resolve Exception {exc.exceptionNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Provide an optional final resolution summary note for the audit ledger before marking this case as RESOLVED.
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Verified customer credit statement; remaining ₹5,000 cleared via manual bank entry."
              rows={3}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveConfirm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                Confirm & Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
