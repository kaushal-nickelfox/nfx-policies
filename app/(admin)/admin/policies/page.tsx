'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FullPageSpinner } from '@/components/ui/Spinner';
import {
  Plus, Pencil, Trash2, FileText, CheckCircle, Clock,
  Upload, Link2, X, BarChart2, Users, FileCheck,
} from 'lucide-react';
import type { Policy } from '@/types/index';

const CATEGORIES = ['Attendance', 'Behavior', 'Remote Work', 'Security', 'General'] as const;

type AdminPolicy = Policy & { ack_count: number; total_employees: number; completion_percent: number };

type DocSource = 'upload' | 'url';

interface FormState {
  title: string;
  category: string;
  description: string;
  version: string;
  document_url: string;
  document_type: string;
  effective_date: string;
  expiry_date: string;
  assigned_to: 'all' | 'department';
  assigned_departments: string[];
  is_active: boolean;
  requires_acknowledgement: boolean;
}

const defaultForm: FormState = {
  title: '', category: 'General', description: '', version: '1.0',
  document_url: '', document_type: 'pdf',
  effective_date: '', expiry_date: '',
  assigned_to: 'all', assigned_departments: [],
  is_active: true, requires_acknowledgement: true,
};

const KNOWN_DEPTS = ['Engineering', 'Design', 'Product', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPoliciesPage() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<AdminPolicy | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [docSource, setDocSource] = useState<DocSource>('url');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: policies, isLoading } = useQuery<AdminPolicy[]>({
    queryKey: ['admin-policies-v2'],
    queryFn: async () => {
      const res = await fetch('/api/admin/policies');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-policies-v2'] }); setDeleteId(null); },
  });

  const openCreate = () => {
    setEditPolicy(null);
    setForm(defaultForm);
    setDocSource('url');
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (p: AdminPolicy) => {
    setEditPolicy(p);
    setForm({
      title: p.title, category: p.category, description: p.description ?? '',
      version: p.version, document_url: p.document_url ?? '', document_type: p.document_type,
      effective_date: p.effective_date ?? '', expiry_date: p.expiry_date ?? '',
      assigned_to: p.assigned_to ?? 'all',
      assigned_departments: p.assigned_departments ?? [],
      is_active: p.is_active, requires_acknowledgement: p.requires_acknowledgement,
    });
    setDocSource(p.storage_path ? 'upload' : 'url');
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'assigned_departments') {
          fd.append(k, JSON.stringify(v));
        } else {
          fd.append(k, String(v));
        }
      });
      if (docSource === 'upload' && file) {
        fd.append('file', file);
      }

      const url = editPolicy ? `/api/policies/${editPolicy.id}` : '/api/policies';
      const method = editPolicy ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      qc.invalidateQueries({ queryKey: ['admin-policies-v2'] });
      setModalOpen(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <FullPageSpinner />;

  const total = policies?.length ?? 0;
  const active = policies?.filter(p => p.is_active).length ?? 0;
  const requiresAck = policies?.filter(p => p.requires_acknowledgement).length ?? 0;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
            Policy Management
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
            Create, upload, and manage all HR policies
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
          }}
        >
          <Plus size={16} /> Add Policy
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 }}>
        {[
          { label: 'Total Policies', value: total, icon: FileText, bg: '#EEF2FF', color: '#4F46E5' },
          { label: 'Active', value: active, icon: CheckCircle, bg: '#D1FAE5', color: '#059669' },
          { label: 'Require Ack', value: requiresAck, icon: FileCheck, bg: '#FEF3C7', color: '#D97706' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
            padding: isMobile ? '14px 12px' : '18px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <BarChart2 size={18} color="#4F46E5" />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>All Policies ({total})</h2>
        </div>

        {total === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9CA3AF' }}>
            <FileText size={40} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>No policies yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Policy" to create your first policy.</p>
          </div>
        ) : (
          <div>
            {(policies ?? []).map((p, i) => {
              const isLast = i === (policies?.length ?? 0) - 1;
              const pct = p.completion_percent;
              const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
              const isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
              const isDueSoon = p.expiry_date && !isExpired && (new Date(p.expiry_date).getTime() - Date.now()) < 7 * 86400000;

              return (
                <div key={p.id} style={{
                  padding: isMobile ? '16px' : '16px 24px',
                  borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? 12 : 16,
                  flexDirection: isMobile ? 'column' : 'row',
                }}>
                  {/* Icon + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={17} color="#4F46E5" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#F1F5F9', color: '#475569' }}>{p.category}</span>
                        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>v{p.version}</span>
                        {p.storage_path && <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>📎 File</span>}
                        {p.document_url && !p.storage_path && <span style={{ fontSize: 10, color: '#4F46E5', fontWeight: 600 }}>🔗 URL</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: p.is_active ? '#D1FAE5' : '#F1F5F9',
                      color: p.is_active ? '#059669' : '#6B7280',
                    }}>{p.is_active ? 'Active' : 'Inactive'}</span>
                  </div>

                  {/* Deadline */}
                  <div style={{ flexShrink: 0, minWidth: 90 }}>
                    {p.expiry_date ? (
                      <span style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: isExpired ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280' }}>
                        <Clock size={11} />{formatDate(p.expiry_date)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>No expiry</span>
                    )}
                  </div>

                  {/* Targeting */}
                  <div style={{ flexShrink: 0, minWidth: 100 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: '#374151' }}>
                      <Users size={11} />
                      {p.assigned_to === 'all' ? 'All Employees' : `${(p.assigned_departments ?? []).length} Dept(s)`}
                    </span>
                  </div>

                  {/* Completion */}
                  <div style={{ flexShrink: 0, minWidth: 120 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: barColor, marginBottom: 4 }}>
                      {p.ack_count}/{p.total_employees} · {pct}%
                    </div>
                    <div style={{ height: 4, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999 }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Pencil size={14} color="#4F46E5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#111827' }}>Delete Policy?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280' }}>This will permanently delete the policy and any uploaded documents. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 580, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {editPolicy ? 'Edit Policy' : 'Create Policy'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Policy Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Remote Work Policy"
                  style={inputStyle}
                />
              </div>

              {/* Category + Version */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Version *</label>
                  <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0" style={inputStyle} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Brief description of this policy..."
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
              </div>

              {/* Document Source Toggle */}
              <div>
                <label style={labelStyle}>Document Source</label>
                <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                  {(['upload', 'url'] as DocSource[]).map(src => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setDocSource(src)}
                      style={{
                        flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: docSource === src ? '#4F46E5' : '#fff',
                        color: docSource === src ? '#fff' : '#6B7280',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      {src === 'upload' ? <><Upload size={13} /> Upload File</> : <><Link2 size={13} /> External URL</>}
                    </button>
                  ))}
                </div>

                {docSource === 'upload' ? (
                  <div>
                    {file ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid #86EFAC', background: '#F0FDF4' }}>
                        <FileText size={16} color="#059669" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#059669', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#6B7280" /></button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRef.current?.click()}
                        style={{
                          border: '2px dashed #C7D2FE', borderRadius: 10, padding: '24px',
                          textAlign: 'center', cursor: 'pointer', background: '#FAFAFA',
                          transition: 'border-color 0.15s',
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                      >
                        <Upload size={24} color="#A5B4FC" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>Click or drag to upload</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>PDF or DOCX, up to 50MB</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                    {editPolicy?.storage_path && !file && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6B7280' }}>Current file: {editPolicy.storage_path.split('-').slice(1).join('-')}</p>
                    )}
                  </div>
                ) : (
                  <input
                    value={form.document_url}
                    onChange={e => setForm(f => ({ ...f, document_url: e.target.value }))}
                    placeholder="https://sharepoint.com/..."
                    style={inputStyle}
                  />
                )}
              </div>

              {/* Effective + Expiry dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Effective Date</label>
                  <input type="date" value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry / Deadline</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Assign To */}
              <div>
                <label style={labelStyle}>Assign To</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['all', 'department'] as const).map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, border: `1px solid ${form.assigned_to === v ? '#4F46E5' : '#e2e8f0'}`, background: form.assigned_to === v ? '#EEF2FF' : '#fff', transition: 'all 0.15s' }}>
                      <input type="radio" name="assigned_to" value={v} checked={form.assigned_to === v} onChange={() => setForm(f => ({ ...f, assigned_to: v }))} style={{ accentColor: '#4F46E5' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: form.assigned_to === v ? '#4F46E5' : '#374151' }}>
                        {v === 'all' ? 'All Employees' : 'Specific Departments'}
                      </span>
                    </label>
                  ))}
                </div>
                {form.assigned_to === 'department' && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {KNOWN_DEPTS.map(dept => {
                      const checked = form.assigned_departments.includes(dept);
                      return (
                        <label key={dept} style={{
                          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                          padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          border: `1px solid ${checked ? '#4F46E5' : '#e2e8f0'}`,
                          background: checked ? '#EEF2FF' : '#fff',
                          color: checked ? '#4F46E5' : '#6B7280',
                          transition: 'all 0.15s',
                        }}>
                          <input type="checkbox" checked={checked} onChange={() => {
                            setForm(f => ({
                              ...f,
                              assigned_departments: checked
                                ? f.assigned_departments.filter(d => d !== dept)
                                : [...f.assigned_departments, dept],
                            }));
                          }} style={{ display: 'none' }} />
                          {dept}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 20, padding: '12px 16px', background: '#F8FAFC', borderRadius: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ accentColor: '#4F46E5', width: 16, height: 16 }} />
                  Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <input type="checkbox" checked={form.requires_acknowledgement} onChange={e => setForm(f => ({ ...f, requires_acknowledgement: e.target.checked }))} style={{ accentColor: '#4F46E5', width: 16, height: 16 }} />
                  Requires Acknowledgement
                </label>
              </div>

              {/* Footer buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                <button onClick={() => setModalOpen(false)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.title.trim()}
                  style={{
                    padding: '10px 22px', borderRadius: 10, border: 'none',
                    background: submitting || !form.title.trim() ? '#C7D2FE' : '#EF4444',
                    color: '#fff', fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : editPolicy ? 'Save Changes' : 'Create Policy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #e2e8f0',
  fontSize: 13, color: '#111827', outline: 'none', background: '#fff',
  boxSizing: 'border-box',
};
