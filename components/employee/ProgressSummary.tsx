import ProgressBar from '@/components/ui/ProgressBar';
import { CheckCircle, Clock, FileText } from 'lucide-react';

interface ProgressSummaryProps {
  totalPolicies: number;
  acknowledgedCount: number;
}

export default function ProgressSummary({ totalPolicies, acknowledgedCount }: ProgressSummaryProps) {
  const pendingCount = totalPolicies - acknowledgedCount;
  const percent =
    totalPolicies > 0 ? Math.round((acknowledgedCount / totalPolicies) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Your Progress</h2>
        <span className="text-2xl font-bold text-blue-600">{percent}%</span>
      </div>

      <ProgressBar value={percent} showLabel={false} />

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center rounded-lg bg-slate-50 p-3">
          <FileText className="mb-1 h-5 w-5 text-slate-500" />
          <span className="text-xl font-bold text-slate-900">{totalPolicies}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-green-50 p-3">
          <CheckCircle className="mb-1 h-5 w-5 text-green-500" />
          <span className="text-xl font-bold text-green-700">{acknowledgedCount}</span>
          <span className="text-xs text-green-600">Done</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-yellow-50 p-3">
          <Clock className="mb-1 h-5 w-5 text-yellow-500" />
          <span className="text-xl font-bold text-yellow-700">{pendingCount}</span>
          <span className="text-xs text-yellow-600">Pending</span>
        </div>
      </div>
    </div>
  );
}
