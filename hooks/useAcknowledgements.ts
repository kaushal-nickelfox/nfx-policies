import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Acknowledgement } from '@/types/index';

async function fetchAcknowledgements(): Promise<Acknowledgement[]> {
  const res = await fetch('/api/acknowledge');
  if (!res.ok) throw new Error('Failed to fetch acknowledgements');
  return res.json();
}

export function useAcknowledgements() {
  return useQuery({
    queryKey: ['acknowledgements'],
    queryFn: fetchAcknowledgements,
  });
}

export function useAcknowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      policyVersion,
    }: {
      policyId: string;
      policyVersion: string;
    }) => {
      const res = await fetch('/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policyId, policy_version: policyVersion }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to acknowledge');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['acknowledgements'] });
    },
  });
}
