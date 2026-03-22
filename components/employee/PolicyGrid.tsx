'use client';

import PolicyCard from './PolicyCard';
import type { PolicyWithStatus } from '@/types/index';
import { FileText } from 'lucide-react';

interface PolicyGridProps {
  policies: PolicyWithStatus[];
  onView: (id: string) => void;
  onAcknowledge: (id: string) => void;
}

export default function PolicyGrid({ policies, onView, onAcknowledge }: PolicyGridProps) {
  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No policies found</h3>
        <p className="mt-1 text-sm text-slate-500">
          No policies match your current filters. Try adjusting your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          onView={onView}
          onAcknowledge={onAcknowledge}
        />
      ))}
    </div>
  );
}
