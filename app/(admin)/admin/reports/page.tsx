'use client';

import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FullPageSpinner } from '@/components/ui/Spinner';
import ExportReportButton from '@/components/pdf/ExportReportButton';
import {
  BarChart2, Users, FileText, CheckCircle, TrendingUp,
  Download, Award, Building2,
} from 'lucide-react';
import type { EmployeeWithStats } from '@/types/index';

function ProgressBar({ value, color = '#4F46E5' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  );
}

const barColor = (pct: number) => pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

export default function AdminReportsPage() {
  const { data: stats, isLoading: statsLoading } = useEmployeeStats();
  const isMobile = useIsMobile();

  const { data: empData, isLoading: empLoading } = useQuery<{ employees: EmployeeWithStats[] }>({
    queryKey: ['admin-employees-reports'],
    queryFn: async () => {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  if (statsLoading || empLoading) return <FullPageSpinner />;
  if (!stats) return <div style={{ color: '#EF4444', padding: 32 }}>Failed to load stats.</div>;

  const employees = empData?.employees ?? [];
  const pct = Math.round(stats.overall_completion_percent);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
            Reports
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Compliance overview as of {today}
          </p>
        </div>
        <ExportReportButton
          employees={employees}
          policyCompletion={stats.policy_completion}
        />
      </div>

      {/* Stat Cards */}
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

      {/* Hero Export Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B2E 0%, #2D2A45 100%)',
        borderRadius: 20, padding: isMobile ? '20px' : '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Overall Compliance</p>
          <p style={{ margin: '4px 0 12px', fontSize: 30, fontWeight: 800, color: '#fff' }}>{pct}% Complete</p>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', maxWidth: 400 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', borderRadius: 999 }} />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {stats.total_acknowledgements} of {stats.total_employees * stats.total_policies} expected acknowledgements
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Award size={52} color="rgba(129,140,248,0.3)" />
          <button
            onClick={async () => {
              const { generateAcknowledgementReport } = await import('@/lib/pdf/generateReport');
              const blob = generateAcknowledgementReport(employees, stats.policy_completion);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hr-compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
            }}
          >
            <Download size={16} /> Download Full Report
          </button>
        </div>
      </div>

      {/* Two columns */}
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
