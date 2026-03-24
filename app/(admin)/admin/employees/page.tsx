'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FullPageSpinner } from '@/components/ui/Spinner';
import AckTable from '@/components/admin/AckTable';
import ExportReportButton from '@/components/pdf/ExportReportButton';
import {
  Users,
  CheckCircle,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
  UserCheck,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import type { EmployeeWithStats, Policy, Acknowledgement, UserRole } from '@/types/index';

interface EmployeesData {
  employees: EmployeeWithStats[];
  policies: Policy[];
  policy_completion: {
    policy_id: string;
    policy_title: string;
    ack_count: number;
    total_employees: number;
    completion_percent: number;
  }[];
}

type StatusFilter = 'all' | 'compliant' | 'partial' | 'none';

function Avatar({
  name,
  image,
  size = 40,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  if (image)
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover' }}
      />
    );
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const colors = ['#4F46E5', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function RoleToggleButton({
  emp,
  currentAzureOid,
}: {
  emp: EmployeeWithStats;
  currentAzureOid: string;
}) {
  const queryClient = useQueryClient();
  const isSelf = emp.azure_oid === currentAzureOid;
  const isAdmin = emp.role === 'admin';

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (newRole: UserRole) => {
      const res = await fetch(`/api/employees/${emp.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-employees-v2'] }),
  });

  return (
    <div>
      <button
        disabled={isSelf || isPending}
        onClick={() => mutate(isAdmin ? 'employee' : 'admin')}
        style={{
          width: '100%',
          padding: '9px',
          borderRadius: 9,
          border: `1px solid ${isAdmin ? '#FEE2E2' : '#D1FAE5'}`,
          background: isAdmin ? '#FFF5F5' : '#F0FDF4',
          color: isAdmin ? '#DC2626' : '#059669',
          fontSize: 13,
          fontWeight: 600,
          cursor: isSelf || isPending ? 'not-allowed' : 'pointer',
          opacity: isSelf ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'opacity 0.15s',
        }}
      >
        {isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
        {isPending ? 'Saving…' : isAdmin ? 'Revoke Admin' : 'Make Admin'}
      </button>
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#DC2626', textAlign: 'center' }}>
          {(error as Error).message}
        </p>
      )}
    </div>
  );
}

function EmployeeDetailModal({
  emp,
  policies,
  onClose,
  currentAzureOid,
}: {
  emp: EmployeeWithStats;
  policies: Policy[];
  onClose: () => void;
  currentAzureOid: string;
}) {
  const ackMap = new Map(
    (emp.acknowledgements ?? []).map((a: Acknowledgement) => [a.policy_id, a.acknowledged_at])
  );
  const pct = Math.round(emp.completion_percent);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: 28,
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={emp.name} image={emp.avatar_url} size={48} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                {emp.name}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{emp.email}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {emp.department && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: '#EEF2FF',
                      color: '#4F46E5',
                    }}
                  >
                    {emp.department}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: emp.role === 'admin' ? '#FEE2E2' : '#F1F5F9',
                    color: emp.role === 'admin' ? '#EF4444' : '#475569',
                  }}
                >
                  {emp.role === 'admin' ? '🔐 Admin' : 'Employee'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Role management */}
        <div style={{ marginBottom: 20 }}>
          <RoleToggleButton emp={emp} currentAzureOid={currentAzureOid} />
        </div>

        {/* Completion summary */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Completion</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>{pct}%</p>
          </div>
          <div
            style={{
              height: 6,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: '#fff',
                borderRadius: 999,
                transition: 'width 0.5s',
              }}
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {emp.acks_count} of {emp.total_policies} policies acknowledged
          </p>
        </div>

        {/* Per-policy list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {policies
            .filter((p) => p.requires_acknowledgement)
            .map((p) => {
              const ackDate = ackMap.get(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: ackDate ? '#F0FDF4' : '#FAFAFA',
                  }}
                >
                  {ackDate ? (
                    <CheckCircle size={16} color="#059669" style={{ flexShrink: 0 }} />
                  ) : (
                    <Clock size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
                  )}
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
                      {p.title}
                    </p>
                    {ackDate && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7280' }}>
                        Acknowledged{' '}
                        {new Date(ackDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      color: ackDate ? '#059669' : '#D97706',
                    }}
                  >
                    {ackDate ? 'Done ✓' : 'Pending'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default function AdminEmployeesPage() {
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const currentAzureOid = session?.user?.azure_oid ?? '';
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeWithStats | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const { data, isLoading } = useQuery<EmployeesData>({
    queryKey: ['admin-employees-v2'],
    queryFn: async () => {
      const [empRes, polRes] = await Promise.all([fetch('/api/employees'), fetch('/api/policies')]);
      if (!empRes.ok || !polRes.ok) throw new Error('Failed to load data');
      const statsData = await empRes.json();
      const policies = await polRes.json();
      return {
        employees: statsData.employees || [],
        policies,
        policy_completion: statsData.policy_completion || [],
      };
    },
  });

  const employees = data?.employees ?? [];
  const policies = data?.policies ?? [];

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[];
    return depts.sort();
  }, [employees]);

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const s = search.toLowerCase();
        const matchSearch =
          s === '' || e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s);
        const matchDept = dept === 'all' || e.department === dept;
        const matchStatus =
          status === 'all' ||
          (status === 'compliant' && e.completion_percent === 100) ||
          (status === 'partial' && e.completion_percent > 0 && e.completion_percent < 100) ||
          (status === 'none' && e.completion_percent === 0);
        return matchSearch && matchDept && matchStatus;
      }),
    [employees, search, dept, status]
  );

  if (isLoading) return <FullPageSpinner />;

  const compliant = employees.filter((e) => e.completion_percent === 100).length;
  const partial = employees.filter(
    (e) => e.completion_percent > 0 && e.completion_percent < 100
  ).length;
  const notStarted = employees.filter((e) => e.completion_percent === 0).length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
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
            Employees
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Compliance tracking for {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ExportReportButton
          employees={employees}
          policyCompletion={data?.policy_completion ?? []}
        />
      </div>

      {/* Stats */}
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
            value: employees.length,
            icon: Users,
            bg: '#EEF2FF',
            color: '#4F46E5',
          },
          {
            label: 'Fully Compliant',
            value: compliant,
            icon: UserCheck,
            bg: '#D1FAE5',
            color: '#059669',
          },
          { label: 'In Progress', value: partial, icon: Clock, bg: '#FEF3C7', color: '#D97706' },
          {
            label: 'Not Started',
            value: notStarted,
            icon: Shield,
            bg: '#FEE2E2',
            color: '#EF4444',
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: isMobile ? '14px 12px' : '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1,
                }}
              >
                {value}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            color="#9ca3af"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              color: '#374151',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            color: '#374151',
            background: '#fff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            color: '#374151',
            background: '#fff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Status</option>
          <option value="compliant">Compliant (100%)</option>
          <option value="partial">In Progress</option>
          <option value="none">Not Started</option>
        </select>
      </div>

      {/* Employee Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <Users size={40} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>
            No employees match your filters
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {filtered.map((emp) => {
            const pct = Math.round(emp.completion_percent);
            const barColor = pct === 100 ? '#10B981' : pct > 0 ? '#F59E0B' : '#EF4444';
            return (
              <div
                key={emp.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {/* Top */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={emp.name} image={emp.avatar_url} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {emp.name}
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: 11,
                        color: '#6B7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {emp.email}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {emp.department && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#EEF2FF',
                        color: '#4F46E5',
                      }}
                    >
                      {emp.department}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: emp.role === 'admin' ? '#FEE2E2' : '#F1F5F9',
                      color: emp.role === 'admin' ? '#EF4444' : '#475569',
                    }}
                  >
                    {emp.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </div>

                {/* Completion */}
                <div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}
                  >
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                      {emp.acks_count}/{emp.total_policies} policies
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: barColor, lineHeight: 1 }}>
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: '#F1F5F9',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: barColor,
                        borderRadius: 999,
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelectedEmp(emp)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9,
                      border: '1px solid #e2e8f0',
                      background: '#F8FAFC',
                      color: '#4F46E5',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#EEF2FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  >
                    View Details
                  </button>
                  <div style={{ flex: 1 }}>
                    <RoleToggleButton emp={emp} currentAzureOid={currentAzureOid} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Acknowledgement Matrix Toggle */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={() => setShowMatrix((v) => !v)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle size={16} color="#4F46E5" />
            View Acknowledgement Matrix
          </span>
          {showMatrix ? (
            <ChevronUp size={18} color="#6B7280" />
          ) : (
            <ChevronDown size={18} color="#6B7280" />
          )}
        </button>
        {showMatrix && (
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            <AckTable
              employees={employees}
              policies={policies.map((p) => ({ id: p.id, title: p.title }))}
            />
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <EmployeeDetailModal
          emp={selectedEmp}
          policies={policies}
          onClose={() => setSelectedEmp(null)}
          currentAzureOid={currentAzureOid}
        />
      )}
    </div>
  );
}
