'use client';

import EmployeeSidebar from '@/components/layout/EmployeeSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--page-bg)' }}>
      <EmployeeSidebar />
      <main
        style={{
          flex: 1,
          padding: isMobile ? '20px 16px' : '32px 36px',
          paddingTop: isMobile ? 76 : 32,
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
