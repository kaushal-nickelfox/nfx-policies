'use client';

import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import type { EmployeeWithStats } from '@/types/index';

interface AckTableProps {
  employees: EmployeeWithStats[];
  policies: { id: string; title: string }[];
}

export default function AckTable({ employees, policies }: AckTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-3 pr-4 text-left font-medium text-slate-500">Employee</th>
            <th className="py-3 pr-4 text-left font-medium text-slate-500">Department</th>
            {policies.map((p) => (
              <th
                key={p.id}
                className="max-w-[120px] truncate py-3 pr-4 text-left font-medium text-slate-500"
                title={p.title}
              >
                {p.title.length > 15 ? p.title.slice(0, 15) + '…' : p.title}
              </th>
            ))}
            <th className="py-3 text-left font-medium text-slate-500">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const ackedIds = new Set(emp.acknowledgements.map((a) => a.policy_id));
            return (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={emp.name} imageUrl={emp.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-600">{emp.department || '—'}</td>
                {policies.map((p) => (
                  <td key={p.id} className="py-3 pr-4">
                    {ackedIds.has(p.id) ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
                <td className="py-3 min-w-[120px]">
                  <ProgressBar value={emp.completion_percent} showLabel size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
