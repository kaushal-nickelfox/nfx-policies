'use client';

import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Users, CheckCircle, Clock, Activity, Shield, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatDate } from '@/utils/helpers';

const PIE_COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useEmployeeStats();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  if (isLoading) return <FullPageSpinner />;
  if (!stats) return <div style={{ color: '#EF4444', padding: 32 }}>Failed to load stats.</div>;

  const pct = Math.round(stats.overall_completion_percent);

  const barData = stats.policy_completion.map((p) => ({
    name: p.policy_title.length > 18 ? p.policy_title.slice(0, 18) + '…' : p.policy_title,
    fullName: p.policy_title,
    completion: Math.round(p.completion_percent),
    ack: p.ack_count,
    total: p.total_employees,
  }));

  const pieData = stats.dept_completion.map((d) => ({
    name: d.department || 'Unassigned',
    value: Math.round(d.completion_percent),
  }));

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── HEADER ─────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 20 : 26,
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.4px',
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Welcome back, <strong>{session?.user?.name}</strong> — HR Policy Overview
          </p>
        </div>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 999,
            background: '#FEE2E2',
            color: '#EF4444',
            border: '1px solid #FECACA',
          }}
        >
          <Shield size={12} /> Admin Access
        </span>
      </div>

      {/* ── STAT CARDS ─────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? 10 : 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: 'Total Employees',
            value: stats.total_employees,
            icon: Users,
            bg: '#EEF2FF',
            color: '#4F46E5',
          },
          {
            label: 'Fully Acknowledged',
            value: stats.fully_acknowledged_employees,
            icon: CheckCircle,
            bg: '#D1FAE5',
            color: '#059669',
          },
          {
            label: 'Pending',
            value: stats.pending_employees,
            icon: Clock,
            bg: '#FEF3C7',
            color: '#D97706',
          },
          {
            label: 'Total Acknowledgements',
            value: stats.total_acknowledgements,
            icon: Activity,
            bg: '#F5F3FF',
            color: '#7C3AED',
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: isMobile ? '16px 14px' : '20px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile ? 22 : 26,
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1,
                }}
              >
                {value}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── HERO BANNER ─────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B2E 0%, #2D2A45 100%)',
          borderRadius: 20,
          padding: isMobile ? '20px 20px' : '24px 32px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Overall Organisation Completion
          </p>
          <p style={{ margin: '4px 0 12px', fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {pct}% Complete
          </p>
          <div
            style={{
              height: 10,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 999,
              overflow: 'hidden',
              maxWidth: 400,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
                borderRadius: 999,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {stats.total_acknowledgements} of {stats.total_employees * stats.total_policies}{' '}
            expected acknowledgements
          </p>
        </div>
        <Award size={64} color="rgba(129,140,248,0.25)" />
      </div>

      {/* ── CHARTS ROW ──────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* CompletionBarChart */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
            Policy Completion
          </h2>
          {barData.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              No policy data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value: number, _name: string, props) => [
                    `${value}% (${props.payload.ack}/${props.payload.total})`,
                    props.payload.fullName,
                  ]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.completion >= 80
                          ? '#10B981'
                          : entry.completion >= 50
                            ? '#F59E0B'
                            : '#EF4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* DeptPieChart */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
            By Department
          </h2>
          {pieData.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              No department data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${value}%`}
                  labelLine={false}
                >
                  {pieData.map((_entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Completion']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY FEED ────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Activity size={18} color="#4F46E5" />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
            Recent Activity
          </h2>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>
            Last 10 acknowledgements
          </span>
        </div>

        {(stats.recent_activity ?? []).length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
            No acknowledgements yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(stats.recent_activity ?? []).map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < stats.recent_activity.length - 1 ? '1px solid #F8FAFC' : 'none',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#4F46E5',
                  }}
                >
                  {a.employee_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.employee_name}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}>
                      {' '}
                      acknowledged{' '}
                    </span>
                    {a.policy_title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                    {a.employee_email}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>
                  {formatDate(a.acknowledged_at)}
                </span>
                <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
