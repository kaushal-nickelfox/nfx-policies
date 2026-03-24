import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';

const schema = z.object({ role: z.enum(['admin', 'employee']) });

// PATCH /api/employees/[id]/role  — admin only, cannot change own role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });

  const supabase = createServiceClient();

  const { data: target } = await supabase
    .from('employees')
    .select('azure_oid')
    .eq('id', id)
    .single();

  if (!target) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

  if (target.azure_oid === session.user.azure_oid) {
    return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
  }

  const { error } = await supabase
    .from('employees')
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
