import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Search } from 'lucide-react';
import CodesList from './CodesList';

export default async function CodesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rule?: string; batch?: string; status?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('vouchers')
    .select('*, rule:voucher_rules(name)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (params.q) query = query.ilike('code', `%${params.q.toUpperCase()}%`);
  if (params.rule) query = query.eq('rule_id', params.rule);
  if (params.batch) query = query.eq('generated_in_batch', params.batch);
  if (params.status === 'active') query = query.eq('is_active', true);
  if (params.status === 'inactive') query = query.eq('is_active', false);
  if (params.status === 'redeemed') query = query.gte('redemption_count', 1);
  if (params.status === 'unused') query = query.eq('redemption_count', 0);

  const { data: codes } = await query;
  const { data: rules } = await auth.admin.from('voucher_rules').select('id, name').order('name');

  const totalActive = codes?.filter(c => c.is_active).length || 0;
  const totalRedeemed = codes?.reduce((s, c) => s + (c.redemption_count || 0), 0) || 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-slate-500">
          {codes?.length || 0} codes · {totalActive} active · {totalRedeemed} total redemptions
        </p>
        <Link href="/dashboard/vouchers/generate"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          Generate Codes
        </Link>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" name="q" defaultValue={params.q || ''}
            placeholder="Search code..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <select name="rule" defaultValue={params.rule || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All rules</option>
          {rules?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select name="status" defaultValue={params.status || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="unused">Unused</option>
          <option value="redeemed">Redeemed</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
        <Link href="/dashboard/vouchers/codes" className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">Clear</Link>
      </form>

      <CodesList codes={codes || []} />
    </div>
  );
}
