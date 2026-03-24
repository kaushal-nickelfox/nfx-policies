import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { getPolicyFromOneDrive, getSignedDownloadUrl } from '@/lib/onedrive/storage';

// GET /api/policies/[id]/pdf - stream PDF from OneDrive through Next.js (avoids CORS)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const accessToken = session.accessToken as string;

  try {
    const policy = await getPolicyFromOneDrive(id, accessToken);
    const downloadUrl = await getSignedDownloadUrl(policy.storage_path, accessToken);

    const response = await fetch(downloadUrl);
    if (!response.ok) return new NextResponse('Failed to fetch document', { status: 502 });

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${policy.file_name}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
}
