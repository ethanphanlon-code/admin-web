import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ action?: string; user?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('audit_log')
    .select('*, user:profiles(full_name, email)')
    .order('created_at', { ascending: false }).limit(300);

  if (params.action) query = query.ilike('action', `%${params.action}%`);
  if (params.user) query = query.eq('user_id', params.user);

  const { data: logs } = await query;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-500 mt-1">{logs?.length || 0} events</p>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3">
        <input type="text" name="action" defaultValue={params.action || ''}
          placeholder="Filter by action..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? logs.map((l: any) => (
              <tr key={l.id}>
                <td className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString('en-AU')}
                </td>
                <td>
                  {l.user ? (
                    <Link href={`/dashboard/users/${l.user_id}`} className="text-brand-500 hover:underline text-sm">
                      {l.user.full_name}
                    </Link>
                  ) : <span className="text-slate-400 text-xs">System</span>}
                </td>
                <td className="font-medium text-sm">{l.action?.replace(/_/g, ' ')}</td>
                <td className="text-slate-600 text-xs">{l.entity_type}</td>
                <td className="text-xs text-slate-500 max-w-md truncate">
                  {l.details ? JSON.stringify(l.details) : '—'}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">No activity</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
