'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Shield,
  Bell,
  Moon,
  Sun,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle,
  Lock,
} from 'lucide-react';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        marginBottom: 20,
      }}
    >
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--card-border-inner)' }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  iconColor = '#4F46E5',
  danger = false,
  onClick,
  toggle,
  toggled,
  onToggleChange,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  iconColor?: string;
  danger?: boolean;
  onClick?: () => void;
  toggle?: boolean;
  toggled?: boolean;
  onToggleChange?: (v: boolean) => void;
}) {
  const [localOn, setLocalOn] = useState(toggled ?? false);
  const isControlled = onToggleChange !== undefined;
  const on = isControlled ? (toggled ?? false) : localOn;

  const handleToggle = () => {
    if (isControlled) {
      onToggleChange(!on);
    } else {
      setLocalOn((v) => !v);
    }
  };

  return (
    <div
      onClick={toggle ? handleToggle : onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 24px',
        cursor: onClick || toggle ? 'pointer' : 'default',
        borderBottom: '1px solid var(--card-border-inner)',
        transition: 'background 0.12s',
        background: 'var(--card-bg)',
      }}
      onMouseEnter={(e) => {
        if (onClick || toggle)
          (e.currentTarget as HTMLDivElement).style.background = 'var(--hover-bg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)';
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          flexShrink: 0,
          background: danger ? '#FEE2E2' : `${iconColor}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={16} color={danger ? '#EF4444' : iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            fontWeight: 600,
            color: danger ? '#EF4444' : 'var(--text-primary)',
          }}
        >
          {label}
        </p>
        {value && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{value}</p>
        )}
      </div>
      {toggle ? (
        <div
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            padding: 2,
            background: on ? '#4F46E5' : 'var(--card-border)',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: on ? 'flex-end' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      ) : onClick ? (
        <ChevronRight size={16} color="var(--text-muted)" />
      ) : null}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 720 }}>
      {/* ── HEADER ─────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.4px',
          }}
        >
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Manage your account and preferences.
        </p>
      </div>

      {/* ── PROFILE CARD ─────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B2E 0%, #2D2A45 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="avatar"
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              objectFit: 'cover',
              border: '3px solid rgba(129,140,248,0.4)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              flexShrink: 0,
              background: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              border: '3px solid rgba(129,140,248,0.4)',
            }}
          >
            {session?.user?.name?.[0] ?? 'U'}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
            {session?.user?.name ?? '—'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {session?.user?.email ?? '—'}
          </p>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              background: 'rgba(79,70,229,0.3)',
              color: '#a5b4fc',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <Shield size={10} /> Employee
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Signed in via
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Microsoft SSO
          </p>
        </div>
      </div>

      {/* ── ACCOUNT INFO ──────────────────── */}
      <SettingsSection title="Account Information">
        <SettingsRow
          icon={User}
          label="Full Name"
          value={session?.user?.name ?? '—'}
          iconColor="#4F46E5"
        />
        <SettingsRow
          icon={Mail}
          label="Email"
          value={session?.user?.email ?? '—'}
          iconColor="#0EA5E9"
        />
        <SettingsRow
          icon={Building2}
          label="Department"
          value={(session?.user as unknown as Record<string, string>)?.department ?? 'Not set'}
          iconColor="#7C3AED"
        />
        <SettingsRow icon={Briefcase} label="Role" value="Employee" iconColor="#10B981" />
        <SettingsRow
          icon={Lock}
          label="Authentication"
          value="Microsoft Azure AD (SSO)"
          iconColor="#6B7280"
        />
      </SettingsSection>

      {/* ── NOTIFICATIONS ──────────────────── */}
      <SettingsSection title="Notification Preferences">
        <SettingsRow
          icon={Bell}
          label="New Policy Alerts"
          value="Get notified when a new policy is published"
          iconColor="#F59E0B"
          toggle
          toggled={true}
        />
        <SettingsRow
          icon={Bell}
          label="Acknowledgement Reminders"
          value="Remind me of pending acknowledgements"
          iconColor="#F59E0B"
          toggle
          toggled={true}
        />
        <SettingsRow
          icon={Bell}
          label="Team Update Digests"
          value="Weekly summary of team progress"
          iconColor="#F59E0B"
          toggle
          toggled={false}
        />
      </SettingsSection>

      {/* ── PREFERENCES ──────────────────── */}
      <SettingsSection title="Preferences">
        <SettingsRow
          icon={isDarkMode ? Moon : Sun}
          label="Dark Mode"
          value={isDarkMode ? 'On — dark theme active' : 'Off — light theme active'}
          iconColor="#6366f1"
          toggle
          toggled={isDarkMode}
          onToggleChange={toggleDarkMode}
        />
        <SettingsRow icon={Globe} label="Language" value="English (Default)" iconColor="#0EA5E9" />
      </SettingsSection>

      {/* ── SECURITY ──────────────────── */}
      <SettingsSection title="Security & Access">
        <SettingsRow
          icon={Shield}
          label="Login Sessions"
          value="Managed by Microsoft Azure AD"
          iconColor="#10B981"
        />
        <SettingsRow
          icon={Lock}
          label="Password Reset"
          value="Handled through Microsoft account"
          iconColor="#6B7280"
        />
      </SettingsSection>

      {/* ── SAVE + SIGN OUT ─────────────── */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            borderRadius: 10,
            border: '1px solid #FCA5A5',
            background: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FFF5F5',
            color: '#EF4444',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>
        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 28px',
            borderRadius: 10,
            border: 'none',
            background: saved ? '#10B981' : '#4F46E5',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {saved ? (
            <>
              <CheckCircle size={15} /> Saved!
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
