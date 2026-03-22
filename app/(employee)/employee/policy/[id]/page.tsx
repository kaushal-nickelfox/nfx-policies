'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import DocumentViewer from '@/components/viewer/DocumentViewer';
import AcknowledgeButton from '@/components/employee/AcknowledgeButton';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { PolicyWithStatus } from '@/types/index';
import { formatDate } from '@/utils/helpers';

interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: policy, isLoading, refetch } = useQuery<PolicyWithStatus>({
    queryKey: ['policy', id],
    queryFn: async () => {
      const res = await fetch(`/api/policies/${id}`);
      if (!res.ok) throw new Error('Policy not found');
      return res.json();
    },
  });

  if (isLoading) return <FullPageSpinner />;
  if (!policy) return <div className="p-6 text-red-500">Policy not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{policy.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{policy.category}</Badge>
            <span className="text-sm text-slate-500">v{policy.version}</span>
            <span className="text-sm text-slate-400">
              Updated {formatDate(policy.updated_at)}
            </span>
          </div>
          {policy.description && (
            <p className="mt-2 text-sm text-slate-600">{policy.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {policy.is_acknowledged ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Acknowledged</p>
                {policy.acknowledged_at && (
                  <p className="text-xs text-green-600">
                    on {formatDate(policy.acknowledged_at)}
                  </p>
                )}
              </div>
            </div>
          ) : policy.requires_acknowledgement ? (
            <AcknowledgeButton
              policyId={policy.id}
              policyVersion={policy.version}
              policyTitle={policy.title}
              onAcknowledged={() => refetch()}
            />
          ) : null}
        </div>
      </div>

      {/* Document */}
      <div className="h-[calc(100vh-280px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <DocumentViewer
          policyId={policy.id}
          documentUrl={policy.document_url}
          documentType={policy.document_type}
        />
      </div>
    </div>
  );
}
