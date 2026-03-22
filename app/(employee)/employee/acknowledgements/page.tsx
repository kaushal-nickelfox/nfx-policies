'use client';

import { useAcknowledgements } from '@/hooks/useAcknowledgements';
import { usePolicies } from '@/hooks/usePolicies';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { CheckCircle, FileText, Calendar, Hash, Shield, BookOpen, Clock, CheckSquare, TrendingUp } from 'lucide-react';
import type { PolicyCategory } from '@/types/index';

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'Security':    return <Shield    size={16} color="#6366f1" />;
    case 'Behavior':    return <BookOpen  size={16} color="#8b5cf6" />;
    case 'Attendance':  return <Clock     size={16} color="#f59e0b" />;
    case 'Remote Work': return <CheckSquare size={16} color="#10b981" />;
    default:            return <FileText  size={16} color="#6b7280" />;
  }
};

const categoryColor: Record<string, string> = {
  Security: '#6366f1', Behavior: '#8b5cf6',
  Attendance: '#f59e0b', 'Remote Work': '#10b981', General: '#6b7280',
};

export default function AcknowledgementsPage() {
  const { data: acks, isLoading: acksLoading } = useAcknowledgements();
  const { data: policies, isLoading: policiesLoading } = usePolicies();

  const isLoading = acksLoading || policiesLoading;
  if (isLoading) return <FullPageSpinner />;

  const total = (policies ?? []).filter(p => p.requires_acknowledgement).length;
  const ackCount = (acks ?? []).length;
  const pct = total > 0 ? Math.round((ackCount / total) * 100) : 0;

  // Merge acks with policy info
  const enrichedAcks = (acks ?? []).map(ack => {
    const policy = (policies ?? []).find(p => p.id === ack.policy_id);
    return { ...ack, policy };
  }).sort((a, b) => new Date(b.acknowledged_at).getTime() - new Date(a.acknowledged_at).getTime());

  // Group by month
  const grouped: Record<string, typeof enrichedAcks> = {};
  for (const ack of enrichedAcks) {
    const key = new Date(ack.acknowledged_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ack);
  }

  // Pending policies
  const pendingPolicies = (policies ?? []).filter(p => p.requires_acknowledgement && !p.is_acknowledged);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
          Acknowledgements
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Track your policy acknowledgement history.
        </p>
      </div>

      {/* ── STATS ROW ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Acknowledged */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
          padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#059669" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{ackCount}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Acknowledged</p>
          </div>
        </div>

        {/* Pending */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
          padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#D97706" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{pendingPolicies.length}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Pending</p>
          </div>
        </div>

        {/* Completion */}
        <div style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          border: '1px solid #4338CA', borderRadius: 16,
          padding: '20px 24px', boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{pct}%</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Completion Rate</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: HISTORY ──────────────────────── */}
        <div>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Acknowledgement History</h2>
          {enrichedAcks.length === 0 ? (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
              padding: '60px 0', textAlign: 'center',
            }}>
              <CheckCircle size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: '#374151' }}>No acknowledgements yet</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                Go to Policy List to start acknowledging policies.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{month}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#F1F5F9', color: '#64748b' }}>
                    {items.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(ack => (
                    <div key={ack.id} style={{
                      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: '#F8FAFC', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {categoryIcon(ack.policy?.category ?? 'General')}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
                          {ack.policy?.title ?? 'Unknown Policy'}
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          {ack.policy && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                              padding: '2px 7px', borderRadius: 4,
                              background: `${categoryColor[ack.policy.category]}18`,
                              color: categoryColor[ack.policy.category],
                            }}>{ack.policy.category}</span>
                          )}
                          <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Hash size={10} />v{ack.policy_version}
                          </span>
                        </div>
                      </div>
                      {/* Date + badge */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 6 }}>
                          <CheckCircle size={14} color="#059669" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Acknowledged</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <Calendar size={10} />
                          {new Date(ack.acknowledged_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── RIGHT: PENDING ──────────────────────── */}
        <div>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Still Pending</h2>
          {pendingPolicies.length === 0 ? (
            <div style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
              padding: '32px 20px', textAlign: 'center',
            }}>
              <CheckCircle size={36} color="#10B981" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, color: '#059669', fontSize: 14 }}>All caught up!</p>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>You've acknowledged all required policies.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingPolicies.map(p => (
                <div key={p.id} style={{
                  background: '#fff', border: '1px solid #FDE68A', borderRadius: 12,
                  padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    {categoryIcon(p.category)}
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', flex: 1 }}>{p.title}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                      padding: '2px 7px', borderRadius: 4, background: '#FEF3C7', color: '#D97706',
                    }}>⏳ Pending</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>v{p.version}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
