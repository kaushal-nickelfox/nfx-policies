import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { listPoliciesFromOneDrive } from '@/lib/onedrive/storage';
import { calcPercent } from '@/utils/helpers';
import type { AdminStats, EmployeeWithStats } from '@/types/index';

// GET /api/employees - admin stats + employee list with ack data
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServiceClient();

  // Fetch all data in parallel
  const accessToken = session.accessToken as string;

  const [empResult, policies, ackResult] = await Promise.all([
    supabase.from('employees').select('*').order('name'),
    listPoliciesFromOneDrive(accessToken),
    supabase.from('acknowledgements').select('*'),
  ]);

  const employees = empResult.data || [];
  const acks = ackResult.data || [];

  const totalEmployees = employees.length;
  const totalPolicies = policies.length;
  const totalAcks = acks.length;

  // Calculate policy completion
  const policyCompletion = policies.map((p: { id: string; title: string }) => {
    const ackCount = acks.filter((a) => a.policy_id === p.id).length;
    return {
      policy_id: p.id,
      policy_title: p.title,
      ack_count: ackCount,
      total_employees: totalEmployees,
      completion_percent: calcPercent(ackCount, totalEmployees),
    };
  });

  // Calculate dept completion
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

  // Recent activity (last 10)
  const recentActivity = acks
    .sort((a, b) => new Date(b.acknowledged_at).getTime() - new Date(a.acknowledged_at).getTime())
    .slice(0, 10)
    .map((ack) => {
      const emp = employees.find((e) => e.id === ack.employee_id);
      const pol = policies.find((p) => p.id === ack.policy_id);
      return {
        employee_name: emp?.name || 'Unknown',
        employee_email: emp?.email || '',
        policy_title: pol?.title || 'Unknown',
        acknowledged_at: ack.acknowledged_at,
      };
    });

  // Build employees with stats
  const employeesWithStats: EmployeeWithStats[] = employees.map((emp) => {
    const empAcks = acks.filter((a) => a.employee_id === emp.id);
    return {
      ...emp,
      acks_count: empAcks.length,
      total_policies: totalPolicies,
      completion_percent: calcPercent(empAcks.length, totalPolicies),
      acknowledgements: empAcks,
    };
  });

  const overallCompletion = calcPercent(totalAcks, totalEmployees * totalPolicies);

  const stats: AdminStats & { employees: EmployeeWithStats[] } = {
    total_employees: totalEmployees,
    total_policies: totalPolicies,
    total_acknowledgements: totalAcks,
    overall_completion_percent: overallCompletion,
    policy_completion: policyCompletion,
    dept_completion: deptCompletion,
    employees: employeesWithStats,
  };

  return NextResponse.json(stats);
}
