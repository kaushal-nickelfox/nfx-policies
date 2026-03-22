import Card, { CardContent } from '@/components/ui/Card';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import type { AdminStats } from '@/types/index';

interface StatsCardsProps {
  stats: AdminStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Employees',
      value: stats.total_employees,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Policies',
      value: stats.total_policies,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Total Acknowledgements',
      value: stats.total_acknowledgements,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Overall Completion',
      value: `${stats.overall_completion_percent}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg p-3 ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
