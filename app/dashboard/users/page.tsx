import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; region?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  const q = params.q || '';
  const role = params.role || '';
  const region = params.region || '';

  let query = auth.admin.from('profiles')
    .select('id, email, full_name, app_role, country, region, onboarding_completed, created_at, avatar_url, profile_color')
    .order('created_at', { ascending: false })
    .limit(200);

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (role) query = query.eq('app_role', role);
  if (region) query = query.eq('region', region);

  const { data: users, count } = await query;

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            {users?.length || 0} users shown {q || role || region ? '(filtered)' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <select name="role" defaultValue={role} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All roles</option>
          <option value="standard_user">Standard User</option>
          <option value="regional_admin">Regional Admin</option>
          <option value="global_admin">Global Admin</option>
        </select>
        <select name="region" defaultValue={region} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All regions</option>
          <option value="AU-QLD">AU-QLD</option>
          <option value="AU-NSW">AU-NSW</option>
          <option value="AU-VIC">AU-VIC</option>
          <option value="AU-WA">AU-WA</option>
          <option value="AU-SA">AU-SA</option>
          <option value="AU-TAS">AU-TAS</option>
          <option value="NZ">NZ</option>
          <option value="UK">UK</option>
          <option value="US">US</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          Filter
        </button>
        <Link href="/dashboard/users" className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
          Clear
        </Link>
      </form>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Region</th>
              <th>Onboarded</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                      style={{ backgroundColor: u.profile_color || '#0D7C66' }}>
                      {u.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium">{u.full_name || '—'}</span>
                  </div>
                </td>
                <td className="text-slate-600">{u.email}</td>
                <td>
                  <RoleBadge role={u.app_role} />
                </td>
                <td className="text-slate-600">{u.region || '—'}</td>
                <td>
                  {u.onboarding_completed ? (
                    <span className="text-emerald-600 text-xs">✓</span>
                  ) : (
                    <span className="text-slate-400 text-xs">Pending</span>
                  )}
                </td>
                <td className="text-slate-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('en-AU')}
                </td>
                <td>
                  <Link href={`/dashboard/users/${u.id}`}
                    className="text-brand-500 hover:text-brand-600 text-sm font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'global_admin') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">Global Admin</span>;
  if (role === 'regional_admin') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Regional Admin</span>;
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200">User</span>;
}
