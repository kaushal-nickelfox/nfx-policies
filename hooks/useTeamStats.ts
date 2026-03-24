import { useQuery } from '@tanstack/react-query';
import type { AdminStats } from '@/types/index';

async function fetchTeamStats(): Promise<AdminStats> {
  const res = await fetch('/api/team-stats');
  if (!res.ok) throw new Error('Failed to fetch team stats');
  return res.json();
}

export function useTeamStats() {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: fetchTeamStats,
  });
}
