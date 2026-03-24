'use client';

import { use, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import DocumentViewer from '@/components/viewer/DocumentViewer';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import type { PolicyWithStatus } from '@/types/index';
import { formatDate } from '@/utils/helpers';

interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  const { data: policy, isLoading } = useQuery<PolicyWithStatus>({
    queryKey: ['policy', id],
    queryFn: async () => {
      const res = await fetch(`/api/policies/${id}`);
      if (!res.ok) throw new Error('Policy not found');
      return res.json();
    },
  });

  const handleAcknowledge = async () => {
    if (!confirmed || !policy) return;
    setSubmitting(true);
    setAckError(null);
    try {
      const res = await fetch('/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policy.id, policy_version: policy.version }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to acknowledge');
      }
      // Refresh policy data and the policies list cache
      queryClient.invalidateQueries({ queryKey: ['policy', id] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    } catch (e) {
      setAckError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <FullPageSpinner />;
  if (!policy) return <div style={{ padding: 32, color: '#EF4444' }}>Policy not found.</div>;

  const categoryColors: Record<string, { bg: string; color: string }> = {
    Security: { bg: '#EEF2FF', color: '#4F46E5' },
    Behavior: { bg: '#F5F3FF', color: '#7C3AED' },
    Attendance: { bg: '#FFF7ED', color: '#EA580C' },
    'Remote Work': { bg: '#F0FDF4', color: '#16A34A' },
    General: { bg: '#F8FAFC', color: '#475569' },
  };
  const cat = categoryColors[policy.category] ?? { bg: '#F1F5F9', color: '#475569' };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      {/* ── BREADCRUMB ───────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
          fontSize: 13,
          color: '#6B7280',
        }}
      >
        <button
          onClick={() => router.push('/employee/policy')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            fontSize: 13,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeft size={14} />
          Policy Library
        </button>
        <ChevronRight size={13} color="#CBD5E1" />
        <span
          style={{
            color: '#111827',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 280,
          }}
        >
          {policy.title}
        </span>
      </nav>

      {/* ── POLICY HEADER ────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.4px',
            }}
          >
            {policy.title}
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              background: cat.bg,
              color: cat.color,
            }}
          >
            {policy.category}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: 12,
            color: '#6B7280',
          }}
        >
          <span>Version {policy.version}</span>
          <span>·</span>
          <span>Updated {formatDate(policy.updated_at)}</span>
          {policy.description && (
            <>
              <span>·</span>
              <span style={{ color: '#9CA3AF' }}>{policy.description}</span>
            </>
          )}
        </div>
      </div>

      {/* ── DOCUMENT VIEWER ──────────────── */}
      <div
        style={{
          height: 'calc(100vh - 340px)',
          minHeight: 400,
          overflow: 'hidden',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <DocumentViewer
          policyId={policy.id}
          documentUrl={policy.document_url}
          documentType={policy.document_type}
        />
      </div>

      {/* ── STICKY BOTTOM BAR ─────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {policy.is_acknowledged ? (
            /* ── Acknowledged state ── */
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderRadius: 12,
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
              }}
            >
              <CheckCircle size={20} color="#059669" />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#059669' }}>
                  Policy Acknowledged
                </p>
                {policy.acknowledged_at && (
                  <p style={{ margin: 0, fontSize: 12, color: '#16A34A' }}>
                    You acknowledged this on {formatDate(policy.acknowledged_at)}
                  </p>
                )}
              </div>
            </div>
          ) : policy.requires_acknowledgement ? (
            /* ── Pending state ── */
            <>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  flex: 1,
                  fontSize: 13,
                  color: '#374151',
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{
                    marginTop: 2,
                    width: 16,
                    height: 16,
                    accentColor: '#4F46E5',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <span>
                  I have read and understood the <strong>{policy.title}</strong> (v{policy.version})
                  in full.
                </span>
              </label>

              {ackError && (
                <p style={{ margin: 0, fontSize: 12, color: '#DC2626', flexShrink: 0 }}>
                  {ackError}
                </p>
              )}

              <button
                onClick={handleAcknowledge}
                disabled={!confirmed || submitting}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: confirmed ? '#4F46E5' : '#E2E8F0',
                  color: confirmed ? '#fff' : '#94A3B8',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: confirmed ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle size={15} />
                {submitting ? 'Saving…' : 'Acknowledge'}
              </button>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              This policy does not require acknowledgement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
