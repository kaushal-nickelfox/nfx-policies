import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import {
  getPolicyFromOneDrive,
  uploadPolicyDocument,
  deletePolicyDocument,
} from '@/lib/onedrive/storage';

// GET /api/policies/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const accessToken = session.accessToken as string;

  try {
    const policy = await getPolicyFromOneDrive(id, accessToken);

    const supabase = createServiceClient();
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
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

// PUT /api/policies/[id] - replace file (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const accessToken = session.accessToken as string;
  const contentType = req.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const existing = await getPolicyFromOneDrive(id, accessToken);
    await deletePolicyDocument(existing.storage_path, accessToken).catch(() => {});
  } catch {
    // Old file may not exist, continue
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { storagePath, itemId } = await uploadPolicyDocument(
    buffer,
    file.name,
    file.type,
    accessToken
  );

  return NextResponse.json({ id: itemId, storage_path: storagePath, file_name: file.name });
}

// DELETE /api/policies/[id] - delete from OneDrive (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const accessToken = session.accessToken as string;

  try {
    const policy = await getPolicyFromOneDrive(id, accessToken);
    await deletePolicyDocument(policy.storage_path, accessToken);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
