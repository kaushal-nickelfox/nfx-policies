import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/admin/policies - all policies with ack stats (admin only)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServiceClient();

  const [{ data: policies, error: polErr }, { data: employees }, { data: acks }] = await Promise.all([
    supabase.from('policies').select('*').order('created_at', { ascending: false }),
    supabase.from('employees').select('id').eq('role', 'employee'),
    supabase.from('acknowledgements').select('policy_id'),
  ]);

  if (polErr) return NextResponse.json({ error: polErr.message }, { status: 500 });

  const totalEmployees = (employees ?? []).length;

  // Count acks per policy
  const ackCountMap = new Map<string, number>();
  for (const a of acks ?? []) {
    ackCountMap.set(a.policy_id, (ackCountMap.get(a.policy_id) ?? 0) + 1);
  }

  const result = (policies ?? []).map((p) => ({
    ...p,
    ack_count: ackCountMap.get(p.id) ?? 0,
    total_employees: totalEmployees,
    completion_percent: totalEmployees > 0
      ? Math.round(((ackCountMap.get(p.id) ?? 0) / totalEmployees) * 100)
      : 0,
  }));

  return NextResponse.json(result);
}
