import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ status?: string; type?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('documents').select(`
    id, title, document_type, status, version, generated_at, last_signed_at,
    group:groups(id, name, region)
  `).order('generated_at', { ascending: false }).limit(200);

  if (params.status) query = query.eq('status', params.status);
  if (params.type) query = query.eq('document_type', params.type);

  const { data: docs } = await query;

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-500 mt-1">{docs?.length || 0} documents</p>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3 flex-wrap">
        <select name="status" defaultValue={params.status || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_signatures">Pending Signatures</option>
          <option value="partially_signed">Partially Signed</option>
          <option value="executed">Executed</option>
        </select>
        <select name="type" defaultValue={params.type || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All types</option>
          <option value="risk_disclosure">Risk Disclosure</option>
          <option value="co_ownership_agreement">Co-Ownership Agreement</option>
          <option value="household_expense_agreement">Household Expense Agreement</option>
          <option value="mortgage_contribution_deed">Mortgage Contribution Deed</option>
          <option value="broker_handover_pack">Broker Handover Pack</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Group</th>
              <th>Status</th>
              <th>Version</th>
              <th>Generated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {docs && docs.length > 0 ? docs.map((d: any) => (
              <tr key={d.id}>
                <td className="font-medium">{d.title}</td>
                <td className="text-slate-600 text-xs">{d.document_type}</td>
                <td>
                  <Link href={`/dashboard/groups/${d.group?.id}`} className="text-brand-500 hover:underline">
                    {d.group?.name}
                  </Link>
                </td>
                <td>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${
                    d.status === 'executed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    d.status === 'partially_signed' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td>v{d.version}</td>
                <td className="text-slate-500 text-xs">{new Date(d.generated_at).toLocaleDateString('en-AU')}</td>
                <td>
                  <Link href={`/dashboard/documents/${d.id}`} className="text-brand-500 text-sm font-medium">View →</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No documents</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
