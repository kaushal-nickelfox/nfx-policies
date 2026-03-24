'use client';

import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function MicrosoftLoginButton() {
  const [isPending, startTransition] = useTransition();
  const { isLoading, setLoading } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const busy = isPending || isLoading;

  const handleSignIn = () => {
    setError(null);
    startTransition(async () => {
      setLoading(true);
      try {
        await signIn('microsoft-entra-id', { callbackUrl: '/employee/dashboard' });
      } catch {
        setLoading(false);
        setError('Sign-in failed. Please try again.');
      }
    });
  };

  return (
    <>
      <button
        onClick={handleSignIn}
        disabled={busy}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '14px 24px',
          borderRadius: 12,
          border: 'none',
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.65 : 1,
          background: busy ? '#4a6fd6' : 'linear-gradient(135deg, #2F5BE7 0%, #4070f0 100%)',
          boxShadow: '0 4px 16px rgba(47,91,231,0.35)',
          color: '#ffffff',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '-0.1px',
          fontFamily: 'Inter, system-ui, sans-serif',
          transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!busy) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.015)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 22px rgba(47,91,231,0.45)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 16px rgba(47,91,231,0.35)';
        }}
      >
        {busy ? (
          /* Spinner */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </svg>
        ) : (
          /* Microsoft logo squares */
          <svg
            width="20"
            height="20"
            viewBox="0 0 21 21"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
        )}
        <span>{busy ? 'Signing in…' : 'Continue with Microsoft'}</span>
      </button>

      {error && (
        <p
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}
    </>
  );
}
