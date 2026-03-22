'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <AdminSidebar />
      <main style={{
        flex: 1,
        padding: isMobile ? '20px 16px' : '32px 36px',
        overflowY: 'auto',
        minWidth: 0,
        paddingTop: isMobile ? 76 : 32,
      }}>
        {children}
      </main>
    </div>
  );
}
