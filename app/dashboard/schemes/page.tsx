import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import SchemeList from './SchemeList';

export default async function SchemesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('region_schemes').select('*').order('region_code').order('display_order');
  if (params.region) query = query.eq('region_code', params.region);
  const { data: schemes } = await query;

  const { data: regions } = await auth.admin.from('region_config').select('region_code, region_name').order('region_code');

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-sm text-slate-500 mt-1">First home buyer grants, shared equity schemes, stamp duty concessions</p>
        </div>
        <Link href="/dashboard/schemes/new" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          + New Scheme
        </Link>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3">
        <select name="region" defaultValue={params.region || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All regions</option>
          {regions?.map((r: any) => (
            <option key={r.region_code} value={r.region_code}>{r.region_code} — {r.region_name}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <SchemeList schemes={schemes || []} />
    </div>
  );
}
