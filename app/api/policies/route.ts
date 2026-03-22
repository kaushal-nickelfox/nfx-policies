import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient, uploadPolicyDocument } from '@/lib/supabase/server';

// GET /api/policies - fetch policies with user acknowledgement status
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  // Fetch active policies
  const { data: policies, error: polError } = await supabase
    .from('policies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (polError) return NextResponse.json({ error: polError.message }, { status: 500 });

  // Department-based filtering
  const filtered = (policies || []).filter((p) => {
    if (p.assigned_to === 'department') {
      const dept = (session.user as { department?: string | null }).department;
      if (!dept) return false;
      return (p.assigned_departments ?? []).includes(dept);
    }
    return true;
  });

  // Fetch user's employee record
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  if (!employee) {
    return NextResponse.json(
      filtered.map((p) => ({ ...p, is_acknowledged: false, acknowledged_at: null }))
    );
  }

  // Fetch user's acknowledgements
  const { data: acks } = await supabase
    .from('acknowledgements')
    .select('policy_id, acknowledged_at')
    .eq('employee_id', employee.id);

  const ackMap = new Map((acks || []).map((a) => [a.policy_id, a.acknowledged_at]));

  const policiesWithStatus = filtered.map((p) => ({
    ...p,
    is_acknowledged: ackMap.has(p.id),
    acknowledged_at: ackMap.get(p.id) || null,
  }));

  return NextResponse.json(policiesWithStatus);
}

// POST /api/policies - create new policy (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServiceClient();

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  const contentType = req.headers.get('content-type') ?? '';

  let insertData: Record<string, unknown>;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    let storagePath: string | null = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadPolicyDocument(buffer, file.name, file.type);
      storagePath = result.storagePath;
    }

    insertData = {
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
      created_by: employee?.id || null,
    };
  } else {
    const body = await req.json();
    insertData = { ...body, created_by: employee?.id || null };
  }

  const { data, error } = await supabase
    .from('policies')
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
