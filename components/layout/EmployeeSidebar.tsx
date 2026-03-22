'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CheckSquare, Users, Settings, X, Zap, Menu, Shield } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/employee/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/employee/policy',         label: 'Policy List',    icon: FileText },
  { href: '/employee/acknowledgements', label: 'Acknowledgments', icon: CheckSquare },
  { href: '/employee/team',           label: 'Team Progress',  icon: Users },
  { href: '/employee/settings',       label: 'Settings',       icon: Settings },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  const sidebarVisible = !isMobile || isSidebarOpen;

  return (
    <>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
          height: 56, background: '#1E1B2E',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(79,70,229,0.25)',
              border: '1px solid rgba(79,70,229,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={15} color="#818cf8" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>NFX Policies</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Menu size={20} color="#fff" />
          </button>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      {sidebarVisible && (
        <aside
          style={{
            backgroundColor: '#1E1B2E', width: 256,
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
            display: 'flex', flexDirection: 'column',
            transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 0.25s ease',
            boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {/* Logo */}
          <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(79,70,229,0.25)', border: '1px solid rgba(79,70,229,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={18} color="#818cf8" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>NFX Policies</span>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="rgba(255,255,255,0.5)" />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/employee/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 10,
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: active ? '#2D2A45' : 'transparent',
                    transition: 'all 0.15s', textDecoration: 'none',
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0, color: active ? '#818cf8' : 'rgba(255,255,255,0.4)' }} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Admin Panel Switch */}
          {isAdmin && (
            <div style={{ padding: '12px 12px 0' }}>
              <Link
                href="/admin/dashboard"
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                  transition: 'all 0.15s',
                }}
              >
                <Shield size={16} color="#f87171" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f87171' }}>Admin Panel</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(248,113,113,0.6)' }}>Switch to HR view</p>
                </div>
              </Link>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Zap size={13} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>NickelFox</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>© 2026 NickelFox Technologies</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '2px 0 0' }}>v1.0</p>
          </div>
        </aside>
      )}

      {/* Desktop spacer */}
      {!isMobile && <div style={{ width: 256, flexShrink: 0 }} />}
    </>
  );
}
