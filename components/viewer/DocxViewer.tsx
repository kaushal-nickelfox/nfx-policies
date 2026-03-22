'use client';

import { useEffect, useState } from 'react';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface DocxViewerProps {
  policyId: string;
}

export default function DocxViewer({ policyId }: DocxViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHtml() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/policies/${policyId}/html`);
        if (!res.ok) throw new Error('Failed to load document');
        const data = await res.json();
        setHtml(data.html);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHtml();
  }, [policyId]);

  if (isLoading) return <FullPageSpinner />;
  if (error)
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  if (!html) return null;

  return (
    <div
      className="prose prose-slate max-w-none p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
