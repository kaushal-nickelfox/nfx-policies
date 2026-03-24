import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authOptions';
import { createServiceClient } from '@/lib/supabase/server';
import { calcPercent } from '@/utils/helpers';
import type { AdminStats, EmployeeWithStats } from '@/types/index';

// GET /api/employees - admin stats + employee list with ack data (admin only)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServiceClient();

  const [empResult, policiesResult, ackResult] = await Promise.all([
    supabase.from('employees').select('*').order('name'),
    supabase.from('policies').select('id, title').eq('is_active', true),
    supabase.from('acknowledgements').select('*').order('acknowledged_at', { ascending: false }),
  ]);

  const employees = empResult.data || [];
  const policies = policiesResult.data || [];
  const acks = ackResult.data || [];

  const totalEmployees = employees.length;
  const totalPolicies = policies.length;
  const totalAcks = acks.length;

  // Per-policy completion
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

  // Per-dept completion
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

  // Recent activity — last 10 acknowledgements
  const recentActivity = acks.slice(0, 10).map((ack) => {
    const emp = employees.find((e) => e.id === ack.employee_id);
    const pol = policies.find((p) => p.id === ack.policy_id);
    return {
      employee_name: emp?.name || 'Unknown',
      employee_email: emp?.email || '',
      policy_title: pol?.title || 'Unknown',
      acknowledged_at: ack.acknowledged_at,
    };
  });

  // Employees with per-person stats
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

  // Derived counts for stat cards
  const fullyAcknowledgedEmployees = employeesWithStats.filter(
    (e) => totalPolicies > 0 && e.acks_count >= totalPolicies
  ).length;
  const pendingEmployees = totalEmployees - fullyAcknowledgedEmployees;

  const result: AdminStats & { employees: EmployeeWithStats[] } = {
    total_employees: totalEmployees,
    total_policies: totalPolicies,
    total_acknowledgements: totalAcks,
    fully_acknowledged_employees: fullyAcknowledgedEmployees,
    pending_employees: pendingEmployees,
    overall_completion_percent: calcPercent(totalAcks, totalEmployees * totalPolicies),
    policy_completion: policyCompletion,
    dept_completion: deptCompletion,
    recent_activity: recentActivity,
    employees: employeesWithStats,
  };

  return NextResponse.json(result);
}
