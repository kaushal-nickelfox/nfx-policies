'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FullPageSpinner } from '@/components/ui/Spinner';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  CheckCircle,
  X,
  BarChart2,
  FileCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { Policy } from '@/types/index';

/* ── Zod schema ──────────────────────────────────────────── */
const policySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['Attendance', 'Behavior', 'Remote Work', 'Security', 'General']),
  description: z.string().optional(),
  document_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  document_type: z.enum(['pdf', 'docx']),
  version: z.string().min(1, 'Version is required'),
});

type PolicyFormValues = z.infer<typeof policySchema>;

const CATEGORIES = ['Attendance', 'Behavior', 'Remote Work', 'Security', 'General'] as const;

type AdminPolicy = Policy & {
  ack_count: number;
  total_employees: number;
  completion_percent: number;
};

const defaultValues: PolicyFormValues = {
  title: '',
  category: 'General',
  description: '',
  document_url: '',
  document_type: 'pdf',
  version: '1.0',
};

/* ── Page ────────────────────────────────────────────────── */
export default function AdminPoliciesPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<AdminPolicy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues,
  });

  /* ── Queries ─────────────────────────────────────────── */
  const { data: policies, isLoading } = useQuery<AdminPolicy[]>({
    queryKey: ['admin-policies-v2'],
    queryFn: async () => {
      const res = await fetch('/api/admin/policies');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  /* ── Toggle active mutation ──────────────────────────── */
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const policy = policies?.find((p) => p.id === id);
      if (!policy) throw new Error('Policy not found');
      const fd = new FormData();
      fd.append('title', policy.title);
      fd.append('category', policy.category);
      fd.append('version', policy.version);
      fd.append('document_type', policy.document_type);
      fd.append('document_url', policy.document_url ?? '');
      fd.append('description', policy.description ?? '');
      fd.append('is_active', String(is_active));
      fd.append('requires_acknowledgement', String(policy.requires_acknowledgement));
      const res = await fetch(`/api/policies/${id}`, { method: 'PUT', body: fd });
      if (!res.ok) throw new Error('Failed to toggle');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-policies-v2'] }),
  });

  /* ── Delete mutation ─────────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-policies-v2'] });
      setDeleteId(null);
    },
  });

  /* ── Open modals ─────────────────────────────────────── */
  const openCreate = () => {
    setEditPolicy(null);
    reset(defaultValues);
    setModalOpen(true);
  };

  const openEdit = (p: AdminPolicy) => {
    setEditPolicy(p);
    reset({
      title: p.title,
      category: p.category,
      description: p.description ?? '',
      document_url: p.document_url ?? '',
      document_type: p.document_type,
      version: p.version,
    });
    setModalOpen(true);
  };

  /* ── Submit ──────────────────────────────────────────── */
  const onSubmit = async (values: PolicyFormValues) => {
    const fd = new FormData();
    fd.append('title', values.title);
    fd.append('category', values.category);
    fd.append('description', values.description ?? '');
    fd.append('document_url', values.document_url ?? '');
    fd.append('document_type', values.document_type);
    fd.append('version', values.version);
    fd.append('is_active', editPolicy ? String(editPolicy.is_active) : 'true');
    fd.append(
      'requires_acknowledgement',
      editPolicy ? String(editPolicy.requires_acknowledgement) : 'true'
    );

    const url = editPolicy ? `/api/policies/${editPolicy.id}` : '/api/policies';
    const method = editPolicy ? 'PUT' : 'POST';
    const res = await fetch(url, { method, body: fd });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Failed to save');
    }
    qc.invalidateQueries({ queryKey: ['admin-policies-v2'] });
    setModalOpen(false);
  };

  if (isLoading) return <FullPageSpinner />;

  const total = policies?.length ?? 0;
  const active = policies?.filter((p) => p.is_active).length ?? 0;
  const requiresAck = policies?.filter((p) => p.requires_acknowledgement).length ?? 0;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Header ─────────────────────────────────────── */}
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
            Policy Management
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Create and manage all HR policies
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#4F46E5',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
          }}
        >
          <Plus size={16} /> Add Policy
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: 'Total Policies',
            value: total,
            icon: FileText,
            bg: '#EEF2FF',
            color: '#4F46E5',
          },
          { label: 'Active', value: active, icon: CheckCircle, bg: '#D1FAE5', color: '#059669' },
          {
            label: 'Require Ack',
            value: requiresAck,
            icon: FileCheck,
            bg: '#FEF3C7',
            color: '#D97706',
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

      {/* ── Policy Table ───────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <BarChart2 size={18} color="#4F46E5" />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
            All Policies ({total})
          </h2>
        </div>

        {total === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9CA3AF' }}>
            <FileText
              size={40}
              color="#e2e8f0"
              style={{ margin: '0 auto 12px', display: 'block' }}
            />
            <p style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>No policies yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Click &quot;Add Policy&quot; to create your first policy.
            </p>
          </div>
        ) : (
          /* ── Table header (desktop only) ── */
          <div>
            {!isMobile && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 80px 80px 110px 90px',
                  padding: '10px 24px',
                  borderBottom: '1px solid #F1F5F9',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span>Title / Category</span>
                <span>Version</span>
                <span>Type</span>
                <span>Active</span>
                <span>Completion</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
            )}

            {(policies ?? []).map((p, i) => {
              const isLast = i === (policies?.length ?? 0) - 1;
              const pct = p.completion_percent;
              const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

              return (
                <div
                  key={p.id}
                  style={{
                    display: isMobile ? 'flex' : 'grid',
                    gridTemplateColumns: isMobile ? undefined : '1fr 120px 80px 80px 110px 90px',
                    flexDirection: isMobile ? 'column' : undefined,
                    padding: isMobile ? '16px' : '14px 24px',
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: isMobile ? 10 : 0,
                  }}
                >
                  {/* Title + category */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={15} color="#4F46E5" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.title}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginTop: 3,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#F1F5F9',
                            color: '#475569',
                          }}
                        >
                          {p.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Version */}
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                    {isMobile && (
                      <span style={{ fontSize: 11, color: '#9CA3AF', marginRight: 6 }}>
                        Version:
                      </span>
                    )}
                    v{p.version}
                  </div>

                  {/* Doc type */}
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: p.document_type === 'pdf' ? '#FEE2E2' : '#EEF2FF',
                        color: p.document_type === 'pdf' ? '#DC2626' : '#4F46E5',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.document_type}
                    </span>
                  </div>

                  {/* Active toggle */}
                  <div>
                    <button
                      onClick={() => toggleMutation.mutate({ id: p.id, is_active: !p.is_active })}
                      disabled={toggleMutation.isPending}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: p.is_active ? '#059669' : '#9CA3AF',
                      }}
                    >
                      {p.is_active ? (
                        <ToggleRight size={22} color="#059669" />
                      ) : (
                        <ToggleLeft size={22} color="#9CA3AF" />
                      )}
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Completion bar */}
                  <div style={{ minWidth: 80 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: barColor,
                        marginBottom: 4,
                      }}
                    >
                      {p.ack_count}/{p.total_employees} · {pct}%
                    </div>
                    <div
                      style={{
                        height: 4,
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
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <button
                      onClick={() => openEdit(p)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Edit"
                    >
                      <Pencil size={14} color="#4F46E5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid #FEE2E2',
                        background: '#FEF2F2',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirm Dialog ───────────────────────── */}
      {deleteId && (
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
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '28px 32px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
              Delete Policy?
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280' }}>
              This will permanently delete the policy and any uploaded documents. This cannot be
              undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────── */}
      {modalOpen && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {editPolicy ? 'Edit Policy' : 'Add Policy'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Title */}
              <div>
                <label style={labelStyle}>Policy Title *</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Remote Work Policy"
                  style={inputStyle(!!errors.title)}
                />
                {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
              </div>

              {/* Category + Version */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select {...register('category')} style={inputStyle(!!errors.category)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p style={errorStyle}>{errors.category.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Version *</label>
                  <input
                    {...register('version')}
                    placeholder="1.0"
                    style={inputStyle(!!errors.version)}
                  />
                  {errors.version && <p style={errorStyle}>{errors.version.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Brief description of this policy..."
                  style={{ ...inputStyle(false), resize: 'vertical' as const }}
                />
              </div>

              {/* Document URL */}
              <div>
                <label style={labelStyle}>Document URL (SharePoint / OneDrive link)</label>
                <input
                  {...register('document_url')}
                  placeholder="https://nickelfoxnet.sharepoint.com/..."
                  style={inputStyle(!!errors.document_url)}
                />
                {errors.document_url && <p style={errorStyle}>{errors.document_url.message}</p>}
              </div>

              {/* Document Type */}
              <div>
                <label style={labelStyle}>Document Type *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['pdf', 'docx'] as const).map((t) => (
                    <label
                      key={t}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 16px',
                        borderRadius: 9,
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        flex: 1,
                        justifyContent: 'center',
                        background: '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        value={t}
                        {...register('document_type')}
                        style={{ accentColor: '#4F46E5' }}
                      />
                      {t.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#374151',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: isSubmitting ? '#C7D2FE' : '#4F46E5',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Saving...' : editPolicy ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: 9,
  border: `1px solid ${hasError ? '#FCA5A5' : '#e2e8f0'}`,
  fontSize: 13,
  color: '#111827',
  outline: 'none',
  background: hasError ? '#FFF5F5' : '#fff',
  boxSizing: 'border-box',
});

const errorStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12,
  color: '#DC2626',
};
