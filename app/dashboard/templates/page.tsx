import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  const { data: regions } = await auth.admin.from('region_config').select('region_code, region_name').order('region_code');
  let query = auth.admin.from('region_documents').select('*').order('region_code').order('display_order');
  if (params.region) query = query.eq('region_code', params.region);
  const { data: docs } = await query;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Document Templates</h1>
        <p className="text-sm text-slate-500 mt-1">Legal document configuration per region</p>
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Type</th>
              <th>Label</th>
              <th>Legal Basis</th>
              <th>Requires Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {docs && docs.length > 0 ? docs.map((d: any) => (
              <tr key={d.id}>
                <td className="font-mono text-xs">{d.region_code}</td>
                <td className="text-slate-600 text-xs">{d.document_type}</td>
                <td className="font-medium">{d.icon} {d.label}</td>
                <td className="text-slate-600 text-xs max-w-xs truncate">{d.legal_basis}</td>
                <td>{d.requires_payment ? '✓' : '—'}</td>
                <td>
                  <Link href={`/dashboard/templates/${d.id}`} className="text-brand-500 text-sm">Edit →</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No document templates configured</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Document content is generated from the app's client-side templates (src/lib/documentTemplates.ts) or the generate-document edge function.
        This page configures the metadata: which document types exist for each region, their display names, and legal basis.
      </p>
    </div>
  );
}
