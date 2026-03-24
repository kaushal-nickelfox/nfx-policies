import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/policies/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase.from('policies').select('*').eq('id', id).single();

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

  return NextResponse.json({
    ...policy,
    is_acknowledged: isAcknowledged,
    acknowledged_at: acknowledgedAt,
  });
}

// PUT /api/policies/[id] - update policy metadata (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const contentType = req.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const formData = await req.formData();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('policies')
    .update({
      title: formData.get('title'),
      category: formData.get('category'),
      description: (formData.get('description') as string) || null,
      document_url: (formData.get('document_url') as string) || null,
      document_type: formData.get('document_type') || 'pdf',
      version: formData.get('version') || '1.0',
      is_active: formData.get('is_active') !== 'false',
      requires_acknowledgement: formData.get('requires_acknowledgement') !== 'false',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/policies/[id] - delete from Supabase (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { error } = await supabase.from('policies').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
