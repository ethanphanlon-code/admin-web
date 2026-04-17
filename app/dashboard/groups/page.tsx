import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; region?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  let query = auth.admin.from('groups').select(`
    id, name, status, region, country, is_paid, pricing_tier, created_at,
    members:group_members(count)
  `).order('created_at', { ascending: false }).limit(200);

  if (params.q) query = query.ilike('name', `%${params.q}%`);
  if (params.status) query = query.eq('status', params.status);
  if (params.region) query = query.eq('region', params.region);

  const { data: groups } = await query;

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
        <p className="text-sm text-slate-500 mt-1">{groups?.length || 0} groups shown</p>
      </div>

      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" name="q" defaultValue={params.q || ''} placeholder="Search by name..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <select name="status" defaultValue={params.status || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="forming">Forming</option>
          <option value="active">Active</option>
          <option value="settled">Settled</option>
          <option value="dissolved">Dissolved</option>
        </select>
        <select name="region" defaultValue={params.region || ''} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All regions</option>
          <option value="AU-QLD">AU-QLD</option>
          <option value="AU-NSW">AU-NSW</option>
          <option value="AU-VIC">AU-VIC</option>
          <option value="NZ">NZ</option>
          <option value="UK">UK</option>
          <option value="US">US</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">Filter</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Region</th>
              <th>Members</th>
              <th>Plan</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups && groups.length > 0 ? groups.map((g: any) => (
              <tr key={g.id}>
                <td className="font-medium">{g.name}</td>
                <td>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200 text-slate-600 capitalize">
                    {g.status}
                  </span>
                </td>
                <td className="text-slate-600">{g.region || '—'}</td>
                <td className="text-slate-600">{g.members?.[0]?.count || 0}</td>
                <td className="text-slate-600">
                  {g.is_paid ? (g.pricing_tier || '✓') : <span className="text-slate-400">Free</span>}
                </td>
                <td className="text-slate-500 text-xs">{new Date(g.created_at).toLocaleDateString('en-AU')}</td>
                <td>
                  <Link href={`/dashboard/groups/${g.id}`} className="text-brand-500 hover:text-brand-600 text-sm font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No groups found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
