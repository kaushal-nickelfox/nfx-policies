'use client';

import { signOut, useSession } from 'next-auth/react';
import { Menu, LogOut, Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useUIStore } from '@/store/useUIStore';

export default function Header() {
  const { data: session } = useSession();
  const { toggleSidebar } = useUIStore();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Left: hamburger */}
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Avatar
            name={session?.user?.name || 'User'}
            imageUrl={session?.user?.image}
            size="sm"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
