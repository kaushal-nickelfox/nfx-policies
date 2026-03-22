import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { getDocumentStream } from '@/lib/graph/graphClient';

// GET /api/policies/[id]/html - convert DOCX to sanitized HTML
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from('policies')
    .select('document_url, document_type')
    .eq('id', id)
    .single();

  if (error || !policy) return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
  if (policy.document_type !== 'docx') {
    return NextResponse.json({ error: 'Not a DOCX file' }, { status: 400 });
  }
  if (!policy.document_url) {
    return NextResponse.json({ error: 'No document URL' }, { status: 400 });
  }

  try {
    const buffer = await getDocumentStream(policy.document_url);

    // Convert DOCX to HTML using mammoth (server-side)
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ buffer });

    // Sanitize using DOMPurify on server with jsdom
    // Simple sanitization without jsdom for server:
    const html = result.value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, 'data-removed=');

    return NextResponse.json({ html });
  } catch (e) {
    console.error('DOCX conversion error:', e);
    return NextResponse.json({ error: 'Failed to convert document' }, { status: 500 });
  }
}
