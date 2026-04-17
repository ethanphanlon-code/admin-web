import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ group?: string; status?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('expenses').select(`
    id, title, category, total_amount, status, expense_type, created_at,
    group:groups(id, name)
  `).order('created_at', { ascending: false }).limit(200);

  if (params.group) query = query.eq('group_id', params.group);
  if (params.status) query = query.eq('status', params.status);

  const { data: expenses } = await query;

  const total = expenses?.reduce((s, e: any) => s + (e.total_amount || 0), 0) || 0;

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {expenses?.length || 0} expenses · Total ${total.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3 flex-wrap">
        <select name="status" defaultValue={params.status || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="voting">Voting</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Group</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {expenses && expenses.length > 0 ? expenses.map((e: any) => (
              <tr key={e.id}>
                <td className="font-medium">{e.title}</td>
                <td className="text-slate-600 text-xs">{e.category}</td>
                <td>
                  <Link href={`/dashboard/groups/${e.group?.id}`} className="text-brand-500 hover:underline text-sm">
                    {e.group?.name}
                  </Link>
                </td>
                <td className="text-slate-600 text-xs">{e.expense_type}</td>
                <td>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200">{e.status}</span>
                </td>
                <td className="font-semibold">${e.total_amount?.toLocaleString('en-AU')}</td>
                <td className="text-slate-500 text-xs">{new Date(e.created_at).toLocaleDateString('en-AU')}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No expenses</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
