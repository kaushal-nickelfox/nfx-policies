'use client';

import { FileText, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { PolicyWithStatus } from '@/types/index';
import { formatDate } from '@/utils/helpers';

interface PolicyCardProps {
  policy: PolicyWithStatus;
  onView: (id: string) => void;
  onAcknowledge: (id: string) => void;
}

export default function PolicyCard({ policy, onView, onAcknowledge }: PolicyCardProps) {
  const categoryColors: Record<string, string> = {
    Attendance: 'bg-blue-100 text-blue-700',
    Behavior: 'bg-purple-100 text-purple-700',
    'Remote Work': 'bg-teal-100 text-teal-700',
    Security: 'bg-red-100 text-red-700',
    General: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0 rounded-lg bg-blue-50 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900">{policy.title}</h3>
              {policy.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{policy.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[policy.category] || 'bg-slate-100 text-slate-700'}`}
                >
                  {policy.category}
                </span>
                <span className="text-xs text-slate-400">v{policy.version}</span>
                <span className="text-xs text-slate-400">
                  Updated {formatDate(policy.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            {policy.is_acknowledged ? (
              <Badge variant="acknowledged">
                <CheckCircle className="mr-1 h-3 w-3" />
                Acknowledged
              </Badge>
            ) : policy.requires_acknowledgement ? (
              <Badge variant="pending">
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {policy.document_url && (
            <Button variant="outline" size="sm" onClick={() => onView(policy.id)}>
              <ExternalLink className="h-3.5 w-3.5" />
              View Policy
            </Button>
          )}
          {policy.requires_acknowledgement && !policy.is_acknowledged && (
            <Button size="sm" onClick={() => onAcknowledge(policy.id)}>
              <CheckCircle className="h-3.5 w-3.5" />
              Acknowledge
            </Button>
          )}
          {policy.is_acknowledged && policy.acknowledged_at && (
            <p className="text-xs text-slate-400">
              Acknowledged on {formatDate(policy.acknowledged_at)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
