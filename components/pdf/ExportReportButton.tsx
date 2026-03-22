'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Download } from 'lucide-react';
import type { EmployeeWithStats, PolicyCompletion } from '@/types/index';

interface ExportReportButtonProps {
  employees: EmployeeWithStats[];
  policyCompletion: PolicyCompletion[];
}

export default function ExportReportButton({
  employees,
  policyCompletion,
}: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const { generateAcknowledgementReport } = await import('@/lib/pdf/generateReport');
      const blob = generateAcknowledgementReport(employees, policyCompletion);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acknowledgement-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleExport} isLoading={isGenerating} variant="outline">
      <Download className="h-4 w-4" />
      Export PDF Report
    </Button>
  );
}
