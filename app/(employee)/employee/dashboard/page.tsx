'use client';

import { usePolicies } from '@/hooks/usePolicies';
import { usePolicyStore } from '@/store/usePolicyStore';
import { useSession, signOut } from 'next-auth/react';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useEffect } from 'react';
import { FileText, CheckCircle, Clock, Shield, BookOpen } from 'lucide-react';
import type { PolicyCategory } from '@/types/index';
import { useIsMobile } from '@/hooks/useIsMobile';

const CATEGORIES: (PolicyCategory | 'All')[] = [
  'All',
  'Attendance',
  'Behavior',
  'Remote Work',
  'Security',
  'General',
];

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'Security':
      return <Shield size={18} color="#6b7280" />;
    case 'Behavior':
      return <BookOpen size={18} color="#6b7280" />;
    case 'Attendance':
      return <Clock size={18} color="#6b7280" />;
    default:
      return <FileText size={18} color="#6b7280" />;
  }
};

export default function EmployeeDashboardPage() {
  const { data: session } = useSession();
  const { data: policies, isLoading } = usePolicies();
  const { setPolicies, setSelectedCategory, selectedCategory, getFilteredPolicies } =
    usePolicyStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (policies) setPolicies(policies);
  }, [policies, setPolicies]);

  const filteredPolicies = getFilteredPolicies();
  const acknowledgedCount = policies?.filter((p) => p.is_acknowledged).length ?? 0;
  const totalPolicies = policies?.filter((p) => p.requires_acknowledgement).length ?? 0;
  const pendingCount = totalPolicies - acknowledgedCount;

  if (isLoading) return <FullPageSpinner />;
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', paddingTop: isMobile ? 56 : 0 }}>
      {/* ── TOP HEADER ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: isMobile ? 14 : 0,
          marginBottom: 32,
        }}
      >
        {/* Welcome */}
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
            Welcome back, <span style={{ color: '#111827' }}>{session?.user?.name}</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Review and acknowledge your company HR policies.
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '12px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="avatar"
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                flexShrink: 0,
                background: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {session?.user?.name?.[0] ?? 'U'}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {session?.user?.name}
            </p>
            <p style={{ margin: '2px 0 6px', fontSize: 12, color: '#6B7280' }}>
              {session?.user?.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '3px 10px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
          {/* Nickelfox logo mark */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: '#1E1B2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={16} color="#818cf8" />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: isMobile ? 10 : 20,
          marginBottom: 28,
        }}
      >
        {/* Total */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: isMobile ? '16px 14px' : '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? 28 : 40,
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1,
              }}
            >
              {totalPolicies}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: isMobile ? 11 : 14,
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              Total Policies
            </p>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} color="#64748b" />
          </div>
        </div>

        {/* Done */}
        <div
          style={{
            background: '#10B981',
            border: '1px solid #059669',
            borderRadius: 16,
            padding: isMobile ? '16px 14px' : '24px 28px',
            boxShadow: '0 1px 4px rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? 28 : 40,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {acknowledgedCount}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: isMobile ? 11 : 14,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
              }}
            >
              Done Policies
            </p>
          </div>
          <CheckCircle size={40} color="rgba(255,255,255,0.7)" />
        </div>

        {/* Pending — full width on mobile (spans 2 cols) */}
        <div
          style={{
            background: '#F59E0B',
            border: '1px solid #D97706',
            borderRadius: 16,
            padding: isMobile ? '16px 14px' : '24px 28px',
            boxShadow: '0 1px 4px rgba(245,158,11,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gridColumn: isMobile ? '1 / -1' : 'auto',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? 28 : 40,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {pendingCount}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: isMobile ? 11 : 14,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
              }}
            >
              Pending Policies
            </p>
          </div>
          <Clock size={40} color="rgba(255,255,255,0.7)" />
        </div>
      </div>

      {/* ── FILTER PILLS — horizontal scroll on mobile ─── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          overflowX: isMobile ? 'auto' : 'visible',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          paddingBottom: isMobile ? 4 : 0,
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
        }}
      >
        {CATEGORIES.map((cat) => {
          const count =
            cat === 'All'
              ? (policies?.length ?? 0)
              : (policies?.filter((p) => p.category === cat).length ?? 0);
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: isMobile ? '6px 14px' : '7px 16px',
                borderRadius: 999,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
                background: active ? '#4F46E5' : '#fff',
                color: active ? '#fff' : '#374151',
                border: active ? '1px solid #4F46E5' : '1px solid #e2e8f0',
                boxShadow: active ? '0 2px 8px rgba(79,70,229,0.25)' : 'none',
              }}
            >
              {cat}
              {cat === 'All' ? ` (${count})` : count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* ── POLICY LIST ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredPolicies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280' }}>
            <FileText size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#374151' }}>No policies found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try selecting a different category.</p>
          </div>
        ) : (
          filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: isMobile ? '14px 14px' : '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                justifyContent: 'space-between',
                gap: isMobile ? 12 : 16,
              }}
            >
              {/* Icon + info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: '#F8FAFC',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {categoryIcon(policy.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {policy.title}
                    </h3>
                    {policy.is_acknowledged ? (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: '#D1FAE5',
                          color: '#059669',
                        }}
                      >
                        Done
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: '#FEF3C7',
                          color: '#D97706',
                        }}
                      >
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                    {policy.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: '#F1F5F9',
                        color: '#475569',
                      }}
                    >
                      {policy.category}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>v{policy.version}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ flexShrink: 0 }}>
                {policy.is_acknowledged ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#10B981',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={16} /> Acknowledged
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#D97706',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={16} /> Pending
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
