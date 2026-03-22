'use client';

import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Users, TrendingUp, FileText, CheckCircle, Award, BarChart2, Building2 } from 'lucide-react';

function ProgressRing({ pct, size = 64, stroke = 6, color = '#4F46E5' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

const deptColors = ['#4F46E5', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function TeamProgressPage() {
  const { data: stats, isLoading } = useEmployeeStats();
  if (isLoading) return <FullPageSpinner />;

  const pct = stats?.overall_completion_percent ?? 0;
  const deptData = stats?.dept_completion ?? [];
  const policyData = stats?.policy_completion ?? [];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── HEADER ─────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
          Team Progress
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
          Organisation-wide policy acknowledgement overview.
        </p>
      </div>

      {/* ── TOP STATS ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Employees', value: stats?.total_employees ?? 0, icon: Users, bg: '#EEF2FF', ic: '#4F46E5' },
          { label: 'Total Policies', value: stats?.total_policies ?? 0, icon: FileText, bg: '#F5F3FF', ic: '#7C3AED' },
          { label: 'Total Acknowledgements', value: stats?.total_acknowledgements ?? 0, icon: CheckCircle, bg: '#D1FAE5', ic: '#059669' },
          { label: 'Overall Completion', value: `${Math.round(pct)}%`, icon: TrendingUp, bg: '#FEF3C7', ic: '#D97706' },
        ].map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={ic} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── OVERALL COMPLETION HERO ─────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B2E 0%, #2D2A45 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 28,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ProgressRing pct={Math.round(pct)} size={96} stroke={8} color="#818cf8" />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
          }}>
            {Math.round(pct)}%
          </div>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>
            Company Completion Rate
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            {stats?.total_acknowledgements ?? 0} of {(stats?.total_employees ?? 0) * (stats?.total_policies ?? 0)} expected acknowledgements recorded
          </p>
          {/* Full bar */}
          <div style={{ marginTop: 14, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, width: 320, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
              width: `${Math.round(pct)}%`, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <Award size={48} color="rgba(129,140,248,0.3)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── DEPARTMENT BREAKDOWN ─────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Building2 size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>By Department</h2>
          </div>
          {deptData.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '32px 0' }}>No department data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {deptData.map((d, i) => {
                const p = Math.round(d.completion_percent);
                const color = deptColors[i % deptColors.length];
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {d.department || 'Unassigned'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>
                        {d.ack_count}/{d.total_policies} · {p}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: color, width: `${p}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── POLICY BREAKDOWN ─────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BarChart2 size={18} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>By Policy</h2>
          </div>
          {policyData.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '32px 0' }}>No policy data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {policyData.map((p, _i) => {
                const pct2 = Math.round(p.completion_percent);
                const color = pct2 >= 80 ? '#10B981' : pct2 >= 50 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={p.policy_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1, marginRight: 12 }}>
                        {p.policy_title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: pct2 >= 80 ? '#D1FAE5' : pct2 >= 50 ? '#FEF3C7' : '#FEE2E2',
                        color, flexShrink: 0,
                      }}>
                        {p.ack_count}/{p.total_employees} · {pct2}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: color, width: `${pct2}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend note */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>Color indicators:</span>&nbsp;
          <span style={{ color: '#10B981', fontWeight: 600 }}>Green ≥ 80%</span> &nbsp;|&nbsp;
          <span style={{ color: '#F59E0B', fontWeight: 600 }}>Amber 50–79%</span> &nbsp;|&nbsp;
          <span style={{ color: '#EF4444', fontWeight: 600 }}>Red &lt; 50%</span>
        </p>
      </div>
    </div>
  );
}
