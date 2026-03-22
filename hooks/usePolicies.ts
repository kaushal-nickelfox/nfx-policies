import { useQuery } from '@tanstack/react-query';
import type { PolicyWithStatus } from '@/types/index';

async function fetchPolicies(): Promise<PolicyWithStatus[]> {
  const res = await fetch('/api/policies');
  if (!res.ok) throw new Error('Failed to fetch policies');
  return res.json();
}

export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: fetchPolicies,
  });
}
