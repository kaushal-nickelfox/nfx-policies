'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePolicies } from '@/hooks/usePolicies';
import Modal from '@/components/ui/Modal';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
  FileText,
  Shield,
  BookOpen,
  Clock,
  CheckCircle,
  CheckSquare,
  Search,
  Hash,
  Calendar,
  Filter,
} from 'lucide-react';
import type { PolicyCategory, PolicyWithStatus } from '@/types/index';

const CATEGORIES: (PolicyCategory | 'All')[] = [
  'All',
  'Attendance',
  'Behavior',
  'Remote Work',
  'Security',
  'General',
];

const categoryIcon = (cat: string) => {
  const s = { flexShrink: 0 as const };
  switch (cat) {
    case 'Security':
      return <Shield size={20} color="#6366f1" style={s} />;
    case 'Behavior':
      return <BookOpen size={20} color="#8b5cf6" style={s} />;
    case 'Attendance':
      return <Clock size={20} color="#f59e0b" style={s} />;
    case 'Remote Work':
      return <CheckSquare size={20} color="#10b981" style={s} />;
    default:
      return <FileText size={20} color="#6b7280" style={s} />;
  }
};

const categoryBg: Record<string, string> = {
  Security: '#EEF2FF',
  Behavior: '#F5F3FF',
  Attendance: '#FFF7ED',
  'Remote Work': '#F0FDF4',
  General: '#F8FAFC',
};
const categoryAccent: Record<string, string> = {
  Security: '#6366f1',
  Behavior: '#8b5cf6',
  Attendance: '#f59e0b',
  'Remote Work': '#10b981',
  General: '#6b7280',
};

export default function PolicyListPage() {
  const { data: policies, isLoading } = usePolicies();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<PolicyCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [viewerPolicy, setViewerPolicy] = useState<PolicyWithStatus | null>(null);

  const filtered = (policies ?? []).filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const ackCount = (policies ?? []).filter((p) => p.is_acknowledged).length;
  const total = (policies ?? []).length;

  if (isLoading) return <FullPageSpinner />;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── HEADER ─────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.4px',
          }}
        >
          Policy Library
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Browse and acknowledge all company HR policies.
        </p>
      </div>

      {/* ── PROGRESS BANNER ─────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          borderRadius: 16,
          padding: '20px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Your Progress
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#fff' }}>
            {ackCount} / {total}{' '}
            <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>
              policies acknowledged
            </span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff' }}>
            {total > 0 ? Math.round((ackCount / total) * 100) : 0}%
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Complete</p>
        </div>
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: 'rgba(79,70,229,0.12)',
          borderRadius: 999,
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
            width: `${total > 0 ? Math.round((ackCount / total) * 100) : 0}%`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* ── SEARCH + FILTER ─────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            color="#9ca3af"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              color: '#374151',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {/* Filter icon */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13 }}
        >
          <Filter size={15} /> Filter:
        </div>
        {/* Category pills */}
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const count =
            cat === 'All'
              ? (policies ?? []).length
              : (policies ?? []).filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                background: active ? '#4F46E5' : '#fff',
                color: active ? '#fff' : '#374151',
                border: active ? '1px solid #4F46E5' : '1px solid #e2e8f0',
                transition: 'all 0.15s',
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* ── POLICY CARDS GRID ─────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
          <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: '#374151', fontSize: 16 }}>No policies found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search or category.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((policy) => (
            <div
              key={policy.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'box-shadow 0.15s, transform 0.15s',
                cursor: 'default',
              }}
            >
              {/* Top row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: categoryBg[policy.category] ?? '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${categoryAccent[policy.category] ?? '#e2e8f0'}22`,
                  }}
                >
                  {categoryIcon(policy.category)}
                </div>
                {policy.is_acknowledged ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#D1FAE5',
                      color: '#059669',
                    }}
                  >
                    <CheckCircle size={11} /> Done
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#FEF3C7',
                      color: '#D97706',
                    }}
                  >
                    ⏳ Pending
                  </span>
                )}
              </div>

              {/* Title + desc */}
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {policy.title}
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', lineHeight: 1.6 }}>
                  {policy.description ?? 'No description provided.'}
                </p>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#F1F5F9',
                    color: '#475569',
                  }}
                >
                  {policy.category}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Hash size={10} />v{policy.version}
                </span>
                {policy.acknowledged_at && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Calendar size={10} />
                    {new Date(policy.acknowledged_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {/* Action */}
              {policy.is_acknowledged ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px',
                    borderRadius: 10,
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    color: '#059669',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={15} /> Acknowledged
                </div>
              ) : (
                <button
                  onClick={() => setViewerPolicy(policy)}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#4F46E5',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#4338CA')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#4F46E5')}
                >
                  <CheckSquare size={14} /> Read & Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Policy Viewer Modal */}
      {viewerPolicy && (
        <PolicyAckModal
          policy={viewerPolicy}
          onClose={() => setViewerPolicy(null)}
          onAcknowledged={() => {
            setViewerPolicy(null);
            queryClient.invalidateQueries({ queryKey: ['policies'] });
          }}
        />
      )}
    </div>
  );
}

function PolicyAckModal({
  policy,
  onClose,
  onAcknowledged,
}: {
  policy: PolicyWithStatus;
  onClose: () => void;
  onAcknowledged: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const defaultLayout = defaultLayoutPlugin();
  const pdfUrl = `/api/policies/${policy.id}/pdf`;

  const submit = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policy.id, policy_version: policy.version }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setDone(true);
      setTimeout(onAcknowledged, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={policy.title} size="xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* PDF Viewer */}
        <div
          style={{
            height: '60vh',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <Worker workerUrl="/pdf.worker.min.mjs">
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayout]} />
          </Worker>
        </div>

        {/* Acknowledge section */}
        {done ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 20px',
              borderRadius: 12,
              background: '#D1FAE5',
              border: '1px solid #6EE7B7',
            }}
          >
            <CheckCircle size={18} color="#059669" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
              Acknowledged successfully!
            </span>
          </div>
        ) : (
          <div
            style={{
              background: '#FAFAFA',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px 20px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                marginBottom: 14,
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
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>
                I confirm that I have read and understood the <strong>{policy.title}</strong> (v
                {policy.version}) in full.
              </span>
            </label>
            {error && <p style={{ margin: '0 0 10px', fontSize: 13, color: '#DC2626' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!confirmed || submitting}
                style={{
                  padding: '9px 22px',
                  borderRadius: 8,
                  border: 'none',
                  background: confirmed ? '#4F46E5' : '#C7D2FE',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: confirmed ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckSquare size={14} />
                {submitting ? 'Submitting...' : 'Confirm Acknowledgement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
