import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient, uploadPolicyDocument, deletePolicyDocument } from '@/lib/supabase/server';

// GET /api/policies/[id] - get single policy with ack status
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  let isAcknowledged = false;
  let acknowledgedAt = null;

  if (employee) {
    const { data: ack } = await supabase
      .from('acknowledgements')
      .select('acknowledged_at')
      .eq('employee_id', employee.id)
      .eq('policy_id', id)
      .single();

    isAcknowledged = !!ack;
    acknowledgedAt = ack?.acknowledged_at || null;
  }

  return NextResponse.json({ ...policy, is_acknowledged: isAcknowledged, acknowledged_at: acknowledgedAt });
}

// PUT /api/policies/[id] - update policy (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch existing policy to check old storage_path
  const { data: existing } = await supabase.from('policies').select('storage_path').eq('id', id).single();

  const contentType = req.headers.get('content-type') ?? '';
  let updateData: Record<string, unknown>;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    let storagePath = existing?.storage_path ?? null;

    if (file && file.size > 0) {
      // Delete old file if exists
      if (existing?.storage_path) {
        await deletePolicyDocument(existing.storage_path).catch(() => {});
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadPolicyDocument(buffer, file.name, file.type);
      storagePath = result.storagePath;
    }

    updateData = {
      title: formData.get('title'),
      category: formData.get('category'),
      description: formData.get('description') || null,
      document_url: file ? null : (formData.get('document_url') || null),
      document_type: formData.get('document_type') || 'pdf',
      version: formData.get('version') || '1.0',
      is_active: formData.get('is_active') === 'true',
      requires_acknowledgement: formData.get('requires_acknowledgement') === 'true',
      effective_date: formData.get('effective_date') || null,
      expiry_date: formData.get('expiry_date') || null,
      assigned_to: formData.get('assigned_to') || 'all',
      assigned_departments: formData.get('assigned_departments')
        ? JSON.parse(formData.get('assigned_departments') as string)
        : null,
      storage_path: storagePath,
      updated_at: new Date().toISOString(),
    };
  } else {
    const body = await req.json();
    updateData = { ...body, updated_at: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('policies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/policies/[id] - delete policy (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch storage_path before deleting
  const { data: policy } = await supabase.from('policies').select('storage_path').eq('id', id).single();
  if (policy?.storage_path) {
    await deletePolicyDocument(policy.storage_path).catch(() => {});
  }

  const { error } = await supabase.from('policies').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
