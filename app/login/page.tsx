'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      setIsLoading(false);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setIsLoading(false);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100">
      {/* Left Column: Brand Hero */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border-r border-slate-800/80 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
            IF
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">InsureFlow</h1>
            <p className="text-xs text-slate-400 font-medium">Premium Reconciliation & Exception Management</p>
          </div>
        </div>

        {/* Center Hero Tagline */}
        <div className="my-12 lg:my-auto max-w-lg z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" /> Powered by Guidewire BillingCenter
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn payment discrepancies into <span className="text-blue-400">actionable insights.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Automate insurance premium matching, detect underpayments and duplicate gateway retries in real-time, and streamline case investigation with deterministic rules and AI decision support.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Deterministic Engine</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">82%</div>
              <div className="text-xs text-slate-400">Auto Match Rate</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Instant</div>
              <div className="text-xs text-slate-400">AI Case Triage</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} InsureFlow Platform. Enterprise Demo Environment.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-slate-900/50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to InsureFlow</h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your credentials to access the operations console.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="admin@insurance.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
