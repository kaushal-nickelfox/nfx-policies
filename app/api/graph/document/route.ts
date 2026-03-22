import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { getDocumentStream } from '@/lib/graph/graphClient';

// GET /api/graph/document?policyId=xxx - stream document from SharePoint
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get('policyId');

  if (!policyId) return NextResponse.json({ error: 'policyId required' }, { status: 400 });

  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from('policies')
    .select('document_url, document_type, title')
    .eq('id', policyId)
    .single();

  if (error || !policy) return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
  if (!policy.document_url) {
    return NextResponse.json({ error: 'No document URL configured' }, { status: 400 });
  }

  try {
    const buffer = await getDocumentStream(policy.document_url);
    const contentType =
      policy.document_type === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${policy.title}.${policy.document_type}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    console.error('Document fetch error:', e);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
