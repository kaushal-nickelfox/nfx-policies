import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient, getSignedDownloadUrl } from '@/lib/supabase/server';

// GET /api/policies/[id]/download - get a signed URL for a policy document
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from('policies')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (error || !policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!policy.storage_path) return NextResponse.json({ error: 'No uploaded document' }, { status: 404 });

  try {
    const url = await getSignedDownloadUrl(policy.storage_path);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
