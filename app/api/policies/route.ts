import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { listPoliciesFromOneDrive, uploadPolicyDocument } from '@/lib/onedrive/storage';

// GET /api/policies - fetch policies from OneDrive with user acknowledgement status
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const accessToken = session.accessToken as string;

  let policies;
  try {
    policies = await listPoliciesFromOneDrive(accessToken);
  } catch (e) {
    console.error('[OneDrive] listPoliciesFromOneDrive error:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const supabase = createServiceClient();

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('azure_oid', session.user.azure_oid)
    .single();

  if (!employee) {
    return NextResponse.json(
      policies.map((p) => ({ ...p, is_acknowledged: false, acknowledged_at: null }))
    );
  }

  const { data: acks } = await supabase
    .from('acknowledgements')
    .select('policy_id, acknowledged_at')
    .eq('employee_id', employee.id);

  const ackMap = new Map((acks || []).map((a) => [a.policy_id, a.acknowledged_at]));

  return NextResponse.json(
    policies.map((p) => ({
      ...p,
      is_acknowledged: ackMap.has(p.id),
      acknowledged_at: ackMap.get(p.id) || null,
    }))
  );
}

// POST /api/policies - upload new policy to OneDrive (admin only)
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
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { storagePath, itemId } = await uploadPolicyDocument(
    buffer,
    file.name,
    file.type,
    session.accessToken as string
  );

  return NextResponse.json(
    { id: itemId, storage_path: storagePath, file_name: file.name },
    { status: 201 }
  );
}
