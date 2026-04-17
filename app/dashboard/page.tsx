import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Users, Home, FileText, CreditCard, TrendingUp, Activity } from 'lucide-react';

export default async function DashboardHome() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { admin } = auth;

  // Fetch all counts in parallel
  const [
    { count: userCount },
    { count: groupCount },
    { count: activeGroupCount },
    { count: settledGroupCount },
    { count: docCount },
    { count: executedDocCount },
    { count: paymentCount },
    { count: recentUsers },
    { data: recentGroups },
    { data: recentActivity },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('groups').select('*', { count: 'exact', head: true }),
    admin.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'settled'),
    admin.from('documents').select('*', { count: 'exact', head: true }),
    admin.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'executed'),
    admin.from('payments').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    admin.from('groups').select('id, name, status, region, created_at, created_by').order('created_at', { ascending: false }).limit(5),
    admin.from('audit_log').select('*, user:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: 'Total Users', value: userCount || 0, icon: Users, href: '/dashboard/users',
      sub: recentUsers ? `+${recentUsers} this week` : '' },
    { label: 'Total Groups', value: groupCount || 0, icon: Home, href: '/dashboard/groups',
      sub: `${activeGroupCount || 0} active · ${settledGroupCount || 0} settled` },
    { label: 'Documents', value: docCount || 0, icon: FileText, href: '/dashboard/documents',
      sub: `${executedDocCount || 0} fully executed` },
    { label: 'Payments', value: paymentCount || 0, icon: CreditCard, href: '/dashboard/payments',
      sub: 'All-time' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {auth.profile?.full_name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm hover:border-brand-200 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString('en-AU')}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              {stat.sub && (
                <div className="text-xs text-slate-400 mt-2">{stat.sub}</div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent groups */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Groups</h3>
            <Link href="/dashboard/groups" className="text-sm text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          <div>
            {recentGroups && recentGroups.length > 0 ? (
              recentGroups.map(g => (
                <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                  className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{g.name}</div>
                    <div className="text-xs text-slate-500">
                      {g.region || '—'} · {new Date(g.created_at).toLocaleDateString('en-AU')}
                    </div>
                  </div>
                  <StatusBadge status={g.status} />
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">No groups yet</div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <Link href="/dashboard/activity" className="text-sm text-brand-500 hover:text-brand-600">View all →</Link>
          </div>
          <div>
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900">
                      <span className="font-medium">{a.user?.full_name || 'System'}</span>{' '}
                      <span className="text-slate-500">{a.action?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.created_at).toLocaleString('en-AU')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    forming: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    settled: 'bg-purple-50 text-purple-700 border-purple-200',
    dissolved: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.dissolved}`}>
      {status}
    </span>
  );
}
