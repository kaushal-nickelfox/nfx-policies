import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EmployeeWithStats, PolicyCompletion } from '@/types/index';

export function generateAcknowledgementReport(
  employees: EmployeeWithStats[],
  policyCompletion: PolicyCompletion[]
): Blob {
  const doc = new jsPDF();
  const now = new Date();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // primary blue
  doc.text('HR Policy Acknowledgement Report', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // muted
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 14, 30);

  // Summary stats
  const totalEmployees = employees.length;
  const totalAcks = employees.reduce((sum, e) => sum + e.acks_count, 0);
  const avgCompletion =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.completion_percent, 0) / employees.length)
      : 0;

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Summary', 14, 42);

  doc.setFontSize(11);
  doc.text(`Total Employees: ${totalEmployees}`, 14, 50);
  doc.text(`Total Acknowledgements: ${totalAcks}`, 14, 57);
  doc.text(`Average Completion: ${avgCompletion}%`, 14, 64);

  // Policy completion table
  doc.setFontSize(13);
  doc.text('Policy Completion Status', 14, 78);

  autoTable(doc, {
    startY: 83,
    head: [['Policy', 'Acknowledged', 'Total Employees', 'Completion %']],
    body: policyCompletion.map((p) => [
      p.policy_title,
      p.ack_count,
      p.total_employees,
      `${p.completion_percent}%`,
    ]),
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  // Employee details table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(13);
  doc.text('Employee Acknowledgement Details', 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Name', 'Email', 'Department', 'Acknowledged', 'Total', 'Completion %']],
    body: employees.map((e) => [
      e.name,
      e.email,
      e.department || 'N/A',
      e.acks_count,
      e.total_policies,
      `${e.completion_percent}%`,
    ]),
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    styles: { fontSize: 9 },
  });

  return doc.output('blob');
}
