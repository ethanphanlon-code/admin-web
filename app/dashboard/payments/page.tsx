import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ group?: string; status?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('payments').select(`
    id, amount, status, payment_method, created_at,
    user:profiles(full_name, email), group:groups(id, name)
  `).order('created_at', { ascending: false }).limit(200);

  if (params.group) query = query.eq('group_id', params.group);
  if (params.status) query = query.eq('status', params.status);

  const { data: payments } = await query;
  const total = payments?.reduce((s, p: any) => s + (p.amount || 0), 0) || 0;

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500 mt-1">
          {payments?.length || 0} payments · Total ${total.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
        </p>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3 flex-wrap">
        <select name="status" defaultValue={params.status || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Group</th>
              <th>Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments && payments.length > 0 ? payments.map((p: any) => (
              <tr key={p.id}>
                <td className="font-medium">{p.user?.full_name}</td>
                <td>
                  <Link href={`/dashboard/groups/${p.group?.id}`} className="text-brand-500 hover:underline text-sm">
                    {p.group?.name}
                  </Link>
                </td>
                <td className="text-slate-600 text-xs">{p.payment_method}</td>
                <td>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${
                    p.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    p.status === 'failed' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>{p.status}</span>
                </td>
                <td className="font-semibold">${p.amount?.toFixed(2)}</td>
                <td className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-AU')}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No payments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
