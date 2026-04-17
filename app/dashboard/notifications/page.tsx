import { requireAdmin } from '@/lib/supabase';
import NotificationComposer from './NotificationComposer';

export default async function NotificationsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: recent } = await auth.admin.from('notifications')
    .select('*, user:profiles(full_name, email)')
    .order('created_at', { ascending: false }).limit(50);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">Send in-app notifications to users</p>
      </div>

      <NotificationComposer />

      <div className="mt-8">
        <h3 className="font-semibold mb-3">Recent Notifications</h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table>
            <thead>
              <tr>
                <th>To</th>
                <th>Title</th>
                <th>Type</th>
                <th>Read</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {recent && recent.length > 0 ? recent.map((n: any) => (
                <tr key={n.id}>
                  <td>
                    <div className="font-medium text-sm">{n.user?.full_name}</div>
                    <div className="text-xs text-slate-500">{n.user?.email}</div>
                  </td>
                  <td>
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-md">{n.body}</div>
                  </td>
                  <td className="text-xs text-slate-500">{n.type}</td>
                  <td>{n.is_read ? '✓' : '—'}</td>
                  <td className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString('en-AU')}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No notifications sent</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
