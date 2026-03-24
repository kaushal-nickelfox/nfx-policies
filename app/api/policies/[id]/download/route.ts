import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { getPolicyFromOneDrive, getSignedDownloadUrl } from '@/lib/onedrive/storage';

// GET /api/policies/[id]/download
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const accessToken = session.accessToken as string;

  try {
    const policy = await getPolicyFromOneDrive(id, accessToken);
    const url = await getSignedDownloadUrl(policy.storage_path, accessToken);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
