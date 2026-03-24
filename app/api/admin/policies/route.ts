import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { listPoliciesFromOneDrive } from '@/lib/onedrive/storage';

// GET /api/admin/policies - all policies from OneDrive with ack stats (admin only)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServiceClient();
  const accessToken = session.accessToken as string;

  const [policies, { data: employees }, { data: acks }] = await Promise.all([
    listPoliciesFromOneDrive(accessToken),
    supabase.from('employees').select('id').eq('role', 'employee'),
    supabase.from('acknowledgements').select('policy_id'),
  ]);

  const totalEmployees = (employees ?? []).length;

  const ackCountMap = new Map<string, number>();
  for (const a of acks ?? []) {
    ackCountMap.set(a.policy_id, (ackCountMap.get(a.policy_id) ?? 0) + 1);
  }

  const result = policies.map((p) => ({
    ...p,
    ack_count: ackCountMap.get(p.id) ?? 0,
    total_employees: totalEmployees,
    completion_percent:
      totalEmployees > 0 ? Math.round(((ackCountMap.get(p.id) ?? 0) / totalEmployees) * 100) : 0,
  }));

  return NextResponse.json(result);
}
