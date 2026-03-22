'use client';

import PDFViewer from './PDFViewer';
import DocxViewer from './DocxViewer';
import type { DocumentType } from '@/types/index';

interface DocumentViewerProps {
  policyId: string;
  documentUrl: string | null;
  documentType: DocumentType;
}

export default function DocumentViewer({
  policyId,
  documentUrl,
  documentType,
}: DocumentViewerProps) {
  if (!documentUrl) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <p>No document available for this policy.</p>
      </div>
    );
  }

  if (documentType === 'pdf') {
    return (
      <PDFViewer fileUrl={`/api/graph/document?policyId=${policyId}`} />
    );
  }

  if (documentType === 'docx') {
    return <DocxViewer policyId={policyId} />;
  }

  return null;
}
