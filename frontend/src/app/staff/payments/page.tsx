'use client';

import Link from 'next/link';

export default function StaffPaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Payments</h1>
      <div
        className="rounded-xl p-6"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.13)',
          borderRadius: '16px',
          color: '#a89070',
        }}
      >
        <p>Payments section for staff.</p>
        <Link
          href="/staff"
          className="text-sm mt-2 inline-block"
          style={{ color: '#c8972a' }}
        >← Back to dashboard</Link>
      </div>
    </div>
  );
}
