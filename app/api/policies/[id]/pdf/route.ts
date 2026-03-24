import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { downloadDocumentAppOnly } from '@/lib/graph/graphClient';

// GET /api/policies/[id]/pdf
// Downloads the file from SharePoint via Graph API (avoids CORS + HTML redirect issues)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from('policies')
    .select('document_url, title, document_type')
    .eq('id', id)
    .single();

  if (error || !policy) return new NextResponse('Policy not found', { status: 404 });
  if (!policy.document_url) return new NextResponse('No document available', { status: 404 });

  try {
    const { buffer, mimeType } = await downloadDocumentAppOnly(policy.document_url);

    const ext = policy.document_type === 'docx' ? 'docx' : 'pdf';
    const fileName = `${policy.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    console.error('[pdf proxy]', e);
    return new NextResponse((e as Error).message, { status: 500 });
  }
}
