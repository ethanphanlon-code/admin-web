import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import RegionToggle from './RegionToggle';

export default async function RegionsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: regions } = await auth.admin.from('region_config')
    .select('*').order('country_code').order('region_code');

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Regions</h1>
        <p className="text-sm text-slate-500 mt-1">Toggle regions live/disabled and manage region-specific configuration</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Region</th>
              <th>Code</th>
              <th>Currency</th>
              <th>Live</th>
              <th>Coming Soon</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {regions && regions.length > 0 ? regions.map((r: any) => (
              <tr key={r.region_code}>
                <td>{r.country_flag} {r.country_name}</td>
                <td className="font-medium">{r.region_name}</td>
                <td className="text-slate-500 text-xs font-mono">{r.region_code}</td>
                <td className="text-slate-600">{r.currency_symbol} {r.currency_code}</td>
                <td><RegionToggle code={r.region_code} field="is_live" initial={r.is_live} /></td>
                <td><RegionToggle code={r.region_code} field="coming_soon" initial={r.coming_soon} /></td>
                <td>
                  <Link href={`/dashboard/regions/${r.region_code}`} className="text-brand-500 text-sm font-medium">Edit →</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                No regions configured. Run migration 009 to seed regions.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
