import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/policies - fetch active policies from Supabase with user acknowledgement status
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  const { data: policies, error } = await supabase
    .from('policies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  if (!employee) {
    return NextResponse.json(
      (policies ?? []).map((p) => ({ ...p, is_acknowledged: false, acknowledged_at: null }))
    );
  }

  const { data: acks } = await supabase
    .from('acknowledgements')
    .select('policy_id, acknowledged_at')
    .eq('employee_id', employee.id);

  const ackMap = new Map((acks || []).map((a) => [a.policy_id, a.acknowledged_at]));

  return NextResponse.json(
    (policies ?? []).map((p) => ({
      ...p,
      is_acknowledged: ackMap.has(p.id),
      acknowledged_at: ackMap.get(p.id) || null,
    }))
  );
}

// POST /api/policies - create policy in Supabase (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const formData = await req.formData();
  const supabase = createServiceClient();

  // Look up the admin's employee UUID for created_by
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  const { data, error } = await supabase
    .from('policies')
    .insert({
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: (formData.get('description') as string) || null,
      document_url: (formData.get('document_url') as string) || null,
      document_type: (formData.get('document_type') as string) || 'pdf',
      version: (formData.get('version') as string) || '1.0',
      is_active: formData.get('is_active') !== 'false',
      requires_acknowledgement: formData.get('requires_acknowledgement') !== 'false',
      created_by: employee?.id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
