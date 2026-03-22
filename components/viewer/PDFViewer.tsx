'use client';

import { useEffect, useRef } from 'react';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use iframe approach for reliability
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = fileUrl;
      iframe.className = 'w-full h-full border-0';
      iframe.title = 'PDF Viewer';
      containerRef.current.appendChild(iframe);
    }
  }, [fileUrl]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <FullPageSpinner />
    </div>
  );
}
