import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RegionEditForm from './RegionEditForm';

export default async function RegionDetail({ params }: { params: Promise<{ code: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { code } = await params;

  const { data: region } = await auth.admin.from('region_config').select('*').eq('region_code', code).single();
  if (!region) notFound();

  const { data: schemes } = await auth.admin.from('region_schemes').select('*').eq('region_code', code).order('display_order');
  const { data: docs } = await auth.admin.from('region_documents').select('*').eq('region_code', code).order('display_order');

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/regions" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Back to regions</Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{region.country_flag} {region.region_name}</h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">{region.region_code}</p>
      </div>

      <RegionEditForm region={region} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold">Schemes ({schemes?.length || 0})</h3>
            <Link href={`/dashboard/schemes?region=${code}`} className="text-sm text-brand-500">Manage →</Link>
          </div>
          <div>
            {schemes && schemes.length > 0 ? schemes.map((s: any) => (
              <div key={s.id} className="px-5 py-3 border-b border-slate-100 last:border-0">
                <div className="font-medium text-sm">{s.short_name || s.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.description}</div>
              </div>
            )) : <div className="p-6 text-center text-sm text-slate-400">No schemes</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold">Required Documents ({docs?.length || 0})</h3>
            <Link href={`/dashboard/templates?region=${code}`} className="text-sm text-brand-500">Templates →</Link>
          </div>
          <div>
            {docs && docs.length > 0 ? docs.map((d: any) => (
              <div key={d.id} className="px-5 py-3 border-b border-slate-100 last:border-0">
                <div className="font-medium text-sm">{d.icon} {d.label}</div>
                <div className="text-xs text-slate-500">{d.description}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">{d.legal_basis}</div>
              </div>
            )) : <div className="p-6 text-center text-sm text-slate-400">No documents configured</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
