'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  X,
  Zap,
  Menu,
  Shield,
  BarChart2,
  UserCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/policies', label: 'Policies', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, isDarkMode, toggleDarkMode } = useUIStore();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile top bar */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            height: 56,
            background: '#1E1B2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(239,68,68,0.25)',
                border: '1px solid rgba(239,68,68,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={15} color="#f87171" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Admin Panel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDarkMode ? (
                <Sun size={18} color="#fbbf24" />
              ) : (
                <Moon size={18} color="rgba(255,255,255,0.7)" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={20} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: '#1E1B2E',
          width: 256,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.25s ease',
          boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={18} color="#f87171" />
            </div>
            <div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  display: 'block',
                  letterSpacing: '-0.2px',
                }}
              >
                NFX Policies
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#f87171',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Admin Panel
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} color="rgba(255,255,255,0.5)" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: active ? '#2D2A45' : 'transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
              >
                <Icon
                  size={18}
                  style={{ flexShrink: 0, color: active ? '#f87171' : 'rgba(255,255,255,0.4)' }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Switch to Employee Panel */}
        <div style={{ padding: '0 12px 12px' }}>
          <Link
            href="/employee/dashboard"
            onClick={() => isMobile && setSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              background: 'rgba(79,70,229,0.12)',
              border: '1px solid rgba(79,70,229,0.25)',
              transition: 'all 0.15s',
            }}
          >
            <UserCircle size={16} color="#818cf8" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#818cf8' }}>
                Employee Panel
              </p>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(129,140,248,0.6)' }}>
                Switch to employee view
              </p>
            </div>
          </Link>
        </div>

        {/* Profile + Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px' }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '100%',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              {isDarkMode ? 'Dark mode' : 'Light mode'}
            </span>
            <div
              style={{
                width: 36,
                height: 20,
                borderRadius: 999,
                background: isDarkMode ? '#4F46E5' : 'rgba(255,255,255,0.15)',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: isDarkMode ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDarkMode ? <Moon size={9} color="#4F46E5" /> : <Sun size={9} color="#f59e0b" />}
              </div>
            </div>
          </button>
          {session?.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="avatar"
                  style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {session.user.name?.[0] ?? 'A'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session.user.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Out
              </button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={11} color="rgba(255,255,255,0.25)" />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
              NickelFox Technologies · v1.0
            </span>
          </div>
        </div>
      </aside>

      {/* Desktop spacer */}
      {!isMobile && <div style={{ width: 256, flexShrink: 0 }} />}
    </>
  );
}
