import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { calcPercent } from '@/utils/helpers';

// GET /api/team-stats - aggregate team progress (accessible by all authenticated users)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  const [empResult, policiesResult, ackResult] = await Promise.all([
    supabase.from('employees').select('id, department'),
    supabase.from('policies').select('id, title').eq('is_active', true),
    supabase.from('acknowledgements').select('employee_id, policy_id'),
  ]);

  const employees = empResult.data || [];
  const policies = policiesResult.data || [];
  const acks = ackResult.data || [];
  const totalEmployees = employees.length;
  const totalPolicies = policies.length;
  const totalAcks = acks.length;

  const policyCompletion = policies.map((p) => {
    const ackCount = acks.filter((a) => a.policy_id === p.id).length;
    return {
      policy_id: p.id,
      policy_title: p.title,
      ack_count: ackCount,
      total_employees: totalEmployees,
      completion_percent: calcPercent(ackCount, totalEmployees),
    };
  });

  const departments = [...new Set(employees.map((e) => e.department || 'Unknown'))];
  const deptCompletion = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => (e.department || 'Unknown') === dept);
    const deptAcks = acks.filter((a) => deptEmployees.some((e) => e.id === a.employee_id));
    const maxPossible = deptEmployees.length * totalPolicies;
    return {
      department: dept,
      ack_count: deptAcks.length,
      total_policies: totalPolicies,
      completion_percent: calcPercent(deptAcks.length, maxPossible),
    };
  });

  return NextResponse.json({
    total_employees: totalEmployees,
    total_policies: totalPolicies,
    total_acknowledgements: totalAcks,
    overall_completion_percent: calcPercent(totalAcks, totalEmployees * totalPolicies),
    policy_completion: policyCompletion,
    dept_completion: deptCompletion,
  });
}
