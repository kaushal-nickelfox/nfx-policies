import { useQuery } from '@tanstack/react-query';

async function fetchDocumentUrl(policyId: string): Promise<string> {
  const res = await fetch(`/api/graph/document?policyId=${policyId}`);
  if (!res.ok) throw new Error('Failed to fetch document');

  // Returns a blob URL
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function useGraphDocument(policyId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['document', policyId],
    queryFn: () => fetchDocumentUrl(policyId!),
    enabled: enabled && !!policyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
