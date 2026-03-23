'use client';

import MicrosoftLoginButton from '@/components/auth/MicrosoftLoginButton';
import { FileText, Shield, BookOpen, CheckCircle, Users, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

const features = [
  { icon: Shield,       title: 'Enterprise Security',      desc: 'Azure AD SSO with role-based access control' },
  { icon: BookOpen,     title: 'Policy Management',        desc: 'Upload, version, and distribute HR policies' },
  { icon: CheckCircle,  title: 'Acknowledgement Tracking', desc: 'Real-time compliance monitoring by department' },
  { icon: Users,        title: 'Employee Dashboard',       desc: 'Personal policy history and completion status' },
];

export default function LoginPage() {
  const isMobile = useIsMobile();

  return (
    <main style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      width: '100%',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div style={{
        width: isMobile ? '100%' : '50%',
        flexShrink: 0,
        backgroundColor: '#1E1B2E',
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '32px 24px' : '52px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', borderRadius: '50%', width: 500, height: 500, top: -140, right: -140, background: '#2D2A45', filter: 'blur(90px)', opacity: 0.8, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', width: 380, height: 380, bottom: -100, right: -80, background: '#2D2A45', filter: 'blur(75px)', opacity: 0.6, pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, marginBottom: isMobile ? 24 : 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.20)',
          }}>
            <FileText size={20} color="rgba(255,255,255,0.92)" />
          </div>
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
            NFX <span style={{ fontWeight: 400 }}>Policies</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: isMobile ? 0 : 40 }}>
          <h1 style={{
            margin: 0, marginBottom: 12,
            fontSize: isMobile ? 28 : 44, fontWeight: 800, lineHeight: 1.15,
            color: '#ffffff', letterSpacing: '-1px',
          }}>
            Manage HR Policies<br />with Confidence
          </h1>
          {!isMobile && (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: '#C8C0D0', maxWidth: 390 }}>
              A unified platform for policy distribution, acknowledgement tracking, and compliance reporting.
            </p>
          )}
        </div>

        {/* Feature Cards — desktop only */}
        {!isMobile && (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#2D2A45', border: '1px solid rgba(255,255,255,0.10)',
                }}>
                  <Icon size={17} color="rgba(255,255,255,0.82)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{title}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#C8C0D0', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop footer */}
        {!isMobile && (
          <>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Zap size={13} color="rgba(200,192,208,0.60)" />
              <span style={{ fontSize: 12, color: 'rgba(200,192,208,0.60)' }}>© 2026 NickelFox Technologies</span>
            </div>
          </>
        )}
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '40px 24px 60px' : '52px 48px',
        position: 'relative',
      }}>
        <div style={{
          width: '100%', maxWidth: 400,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <h2 style={{
            margin: 0, marginBottom: 10,
            fontSize: isMobile ? 28 : 34, fontWeight: 800,
            color: '#0f172a', letterSpacing: '-0.7px', textAlign: 'center',
          }}>
            Welcome back
          </h2>
          <p style={{
            margin: 0, marginBottom: 32,
            fontSize: 14.5, color: '#64748b',
            lineHeight: 1.6, textAlign: 'center',
          }}>
            Sign in with your company Microsoft account to continue.
          </p>

          <div style={{ width: '100%', marginBottom: 14 }}>
            <MicrosoftLoginButton />
          </div>

          <p style={{
            margin: 0, marginBottom: 32,
            textAlign: 'center', fontSize: 12,
            color: '#94a3b8', lineHeight: 1.7,
          }}>
            By signing in, you agree to our{' '}
            <span style={{ color: '#2563eb', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#2563eb', cursor: 'pointer' }}>Privacy Policy</span>
          </p>

          <div style={{ width: '100%', height: 1, background: '#f1f5f9', marginBottom: 24 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#64748b' }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                <path d="M12 2L3 6.5V12c0 4.5 3.8 8.7 9 10 5.2-1.3 9-5.5 9-10V6.5L12 2Z"
                  fill="#3b82f6" fillOpacity="0.15"
                  stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Secured with Azure AD
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#64748b' }}>
              <CheckCircle size={17} color="#94a3b8" />
              SOC 2 Compliant
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#94a3b8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>NickelFox</span>
          </div>
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>© 2026 NickelFox Technologies</span>
        </div>
      </div>
    </main>
  );
}
