'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import {
  LayoutDashboard, Users, Home, FileText, CreditCard, Globe, Settings,
  Receipt, ShieldCheck, Bell, LogOut, Megaphone, Tag, BookOpen, Activity, Clock,
} from 'lucide-react';

const NAV = [
  { section: 'Overview', items: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/audit-log', label: 'Audit Log', icon: Activity },
  ]},
  { section: 'Users & Groups', items: [
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/groups', label: 'Groups', icon: Home },
    { href: '/dashboard/brokers', label: 'Brokers', icon: Users },
    { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  ]},
  { section: 'Content', items: [
    { href: '/dashboard/templates', label: 'Templates', icon: BookOpen },
    { href: '/dashboard/email-templates', label: 'Email Templates', icon: FileText },
  ]},
  { section: 'Finance', items: [
    { href: '/dashboard/refunds', label: 'Refunds', icon: CreditCard },
    { href: '/dashboard/broker-commissions', label: 'Broker Commissions', icon: Tag },
  ]},
  { section: 'Operations', items: [
    { href: '/dashboard/cron-jobs', label: 'Cron Jobs', icon: Clock },
    { href: '/dashboard/monitoring', label: 'Monitoring', icon: LayoutDashboard },
    { href: '/dashboard/db-performance', label: 'DB Performance', icon: Activity },
  ]},
  { section: 'Compliance', items: [
    { href: '/dashboard/data-exports', label: 'Data Exports', icon: FileText },
    { href: '/dashboard/deletion-requests', label: 'Deletion Requests', icon: Users },
  ]},
  { section: 'Configuration', items: [
    { href: '/dashboard/regions', label: 'Regions', icon: Globe },
    { href: '/dashboard/schemes', label: 'Govt Schemes', icon: ShieldCheck },
    { href: '/dashboard/pricing', label: 'Pricing Tiers', icon: Tag },
    { href: '/dashboard/vouchers', label: 'Vouchers', icon: Tag },
  ]},
  { section: 'Communications', items: [
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  ]},
  { section: 'Settings', items: [
    { href: '/dashboard/settings', label: 'System Settings', icon: Settings },
  ]},
];

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">C</div>
          <div>
            <div className="font-bold text-slate-900">CoHomed</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map(section => (
          <div key={section.section} className="mb-4">
            <div className="px-6 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.section}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-6 py-2 text-sm transition ${
                    active
                      ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-500 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
            {profile?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{profile?.full_name}</div>
            <div className="text-xs text-slate-500 capitalize">
              {profile?.app_role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
