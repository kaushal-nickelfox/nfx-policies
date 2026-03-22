'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PolicyCompletion } from '@/types/index';

interface CompletionBarChartProps {
  data: PolicyCompletion[];
}

export default function CompletionBarChart({ data }: CompletionBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.policy_title.length > 20 ? d.policy_title.slice(0, 20) + '…' : d.policy_title,
    completion: d.completion_percent,
    acknowledged: d.ack_count,
    total: d.total_employees,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          unit="%"
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, name) => [
            name === 'completion' ? `${value}%` : value,
            name === 'completion' ? 'Completion' : name,
          ]}
        />
        <Bar dataKey="completion" fill="#2563eb" radius={[4, 4, 0, 0]} name="completion" />
      </BarChart>
    </ResponsiveContainer>
  );
}
