'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg animate-bounce">
          IF
        </div>
        <p className="text-xs text-slate-400 font-semibold">Redirecting to InsureFlow Dashboard...</p>
      </div>
    </div>
  );
}
