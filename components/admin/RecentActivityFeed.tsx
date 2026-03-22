import Avatar from '@/components/ui/Avatar';
import type { RecentActivity } from '@/types/index';
import { formatDate } from '@/utils/helpers';

interface RecentActivityFeedProps {
  activities: RecentActivity[];
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">No recent activity.</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <Avatar name={activity.employee_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900">
              <span className="font-medium">{activity.employee_name}</span>
              {' acknowledged '}
              <span className="font-medium text-blue-600">{activity.policy_title}</span>
            </p>
            <p className="text-xs text-slate-500">{formatDate(activity.acknowledged_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
