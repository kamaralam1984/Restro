'use client';

import Link from 'next/link';

export default function StaffAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <div className="bg-slate-900 rounded-xl p-6 text-slate-400">
        <p>Analytics section for staff.</p>
        <Link href="/staff" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block">← Back to dashboard</Link>
      </div>
    </div>
  );
}
