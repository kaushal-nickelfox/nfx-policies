'use client';

import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Users, FileText, CheckCircle, TrendingUp, BarChart2, Building2, Award, Shield } from 'lucide-react';

function ProgressBar({ value, color = '#4F46E5' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  );
}

const barColor = (pct: number) => pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useEmployeeStats();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  if (isLoading) return <FullPageSpinner />;
  if (!stats) return <div style={{ color: '#EF4444', padding: 32 }}>Failed to load stats.</div>;

  const pct = Math.round(stats.overall_completion_percent);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HEADER ─────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Welcome back, <strong>{session?.user?.name}</strong> — HR Policy Overview
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 999, background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA' }}>
          <Shield size={12} /> Admin Access
        </span>
      </div>

      {/* ── STAT CARDS ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 }}>
        {[
          { label: 'Total Employees', value: stats.total_employees, icon: Users, bg: '#EEF2FF', color: '#4F46E5' },
          { label: 'Total Policies', value: stats.total_policies, icon: FileText, bg: '#F5F3FF', color: '#7C3AED' },
          { label: 'Acknowledgements', value: stats.total_acknowledgements, icon: CheckCircle, bg: '#D1FAE5', color: '#059669' },
          { label: 'Completion Rate', value: `${pct}%`, icon: TrendingUp, bg: '#FEF3C7', color: '#D97706' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: isMobile ? '16px 14px' : '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── HERO COMPLETION BANNER ─────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B2E 0%, #2D2A45 100%)',
        borderRadius: 20, padding: isMobile ? '20px 20px' : '24px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Overall Organisation Completion</p>
          <p style={{ margin: '4px 0 12px', fontSize: 28, fontWeight: 800, color: '#fff' }}>{pct}% Complete</p>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', maxWidth: 400 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', borderRadius: 999, transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {stats.total_acknowledgements} of {stats.total_employees * stats.total_policies} expected acknowledgements
          </p>
        </div>
        <Award size={64} color="rgba(129,140,248,0.25)" />
      </div>

      {/* ── TWO COLUMNS ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>

        {/* Policy Completion */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BarChart2 size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Policy Completion</h2>
          </div>
          {stats.policy_completion.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.policy_completion.map((p) => {
                const v = Math.round(p.completion_percent);
                const color = barColor(v);
                return (
                  <div key={p.policy_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1, marginRight: 12 }}>{p.policy_title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${color}18`, color, flexShrink: 0 }}>
                        {p.ack_count}/{p.total_employees} · {v}%
                      </span>
                    </div>
                    <ProgressBar value={v} color={color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Department Breakdown */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Building2 size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Department Breakdown</h2>
          </div>
          {stats.dept_completion.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No department data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.dept_completion.map((d, i) => {
                const v = Math.round(d.completion_percent);
                const colors = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];
                const color = colors[i % colors.length];
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{d.department || 'Unassigned'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color }}>{d.ack_count}/{d.total_policies} · {v}%</span>
                    </div>
                    <ProgressBar value={v} color={color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, padding: '10px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>Completion indicator:</span>&nbsp;
          <span style={{ color: '#10B981', fontWeight: 600 }}>Green ≥ 80%</span>&nbsp;|&nbsp;
          <span style={{ color: '#F59E0B', fontWeight: 600 }}>Amber 50–79%</span>&nbsp;|&nbsp;
          <span style={{ color: '#EF4444', fontWeight: 600 }}>Red &lt; 50%</span>
        </p>
      </div>
    </div>
  );
}
