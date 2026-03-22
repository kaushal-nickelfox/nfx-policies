'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DeptCompletion } from '@/types/index';

interface DeptPieChartProps {
  data: DeptCompletion[];
}

const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

export default function DeptPieChart({ data }: DeptPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.department || 'Unknown',
    value: d.completion_percent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
