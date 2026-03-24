'use client';

import DOMPurify from 'dompurify';
import { useQuery } from '@tanstack/react-query';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface DocxViewerProps {
  policyId: string;
}

export default function DocxViewer({ policyId }: DocxViewerProps) {
  const { data, isLoading, error } = useQuery<{ html: string }>({
    queryKey: ['docx-html', policyId],
    queryFn: async () => {
      const res = await fetch(`/api/policies/${policyId}/html`);
      if (!res.ok) throw new Error('Failed to load document');
      return res.json();
    },
  });

  if (isLoading) return <FullPageSpinner />;
  if (error)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#EF4444',
        }}
      >
        <p>Error: {error instanceof Error ? error.message : 'Failed to load document'}</p>
      </div>
    );
  if (!data?.html) return null;

  const safeHtml = DOMPurify.sanitize(data.html);

  return (
    <div
      className="prose prose-slate max-w-none p-6"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
