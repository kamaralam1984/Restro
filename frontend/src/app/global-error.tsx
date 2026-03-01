'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui', background: '#020617', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>A critical error occurred. Please refresh or go home.</p>
          <button
            onClick={reset}
            style={{ padding: '10px 20px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ display: 'inline-block', marginLeft: 12, padding: '10px 20px', background: '#334155', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
