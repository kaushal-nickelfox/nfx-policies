import { useQuery } from '@tanstack/react-query';
import type { AdminStats } from '@/types/index';

async function fetchEmployeeStats(): Promise<AdminStats> {
  const res = await fetch('/api/employees');
  if (!res.ok) throw new Error('Failed to fetch employee stats');
  return res.json();
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: ['employee-stats'],
    queryFn: fetchEmployeeStats,
  });
}
