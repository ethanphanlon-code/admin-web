import { requireAdmin } from '@/lib/supabase';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import UserActions from './UserActions';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: user } = await auth.admin.from('profiles').select('*').eq('id', id).single();
  if (!user) notFound();

  const { data: financial } = await auth.admin.from('financial_profiles').select('*').eq('user_id', id).maybeSingle();
  const { data: groups } = await auth.admin
    .from('group_members')
    .select('*, group:groups(id, name, status, region)')
    .eq('user_id', id)
    .eq('is_active', true);
  const { data: authUser } = await auth.admin.auth.admin.getUserById(id);

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/users" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Back to users
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: user.profile_color || '#0D7C66' }}>
          {user.full_name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{user.full_name}</h1>
          <p className="text-slate-500">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200 text-slate-600 capitalize">
              {user.app_role?.replace('_', ' ')}
            </span>
            {user.onboarding_completed && (
              <span className="px-2 py-0.5 text-xs rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                Onboarded
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Profile</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Full name" value={user.full_name} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone || '—'} />
            <Row label="Address" value={user.address || '—'} />
            <Row label="Country" value={user.country || '—'} />
            <Row label="Region" value={user.region || '—'} />
            <Row label="Living situation" value={user.living_situation || '—'} />
            <Row label="Housemates" value={user.housemate_count?.toString() || '—'} />
            <Row label="Goal" value={user.goal || '—'} />
            <Row label="Rent start" value={user.rent_tracking_start ? new Date(user.rent_tracking_start).toLocaleDateString('en-AU') : '—'} />
            <Row label="Created" value={new Date(user.created_at).toLocaleString('en-AU')} />
            <Row label="Last sign-in" value={authUser?.user?.last_sign_in_at ? new Date(authUser.user.last_sign_in_at).toLocaleString('en-AU') : '—'} />
            <Row label="Email confirmed" value={authUser?.user?.email_confirmed_at ? '✓' : 'Not confirmed'} />
            <Row label="Profile ID" value={user.id} mono />
          </dl>
        </div>

        {/* Financial profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Financial Profile</h3>
          {financial ? (
            <dl className="space-y-2 text-sm">
              <Row label="Income" value={financial.gross_annual_income ? `$${financial.gross_annual_income.toLocaleString('en-AU')}` : '—'} />
              <Row label="Employment" value={financial.employment_status || '—'} />
              <Row label="Employer" value={financial.employer_name || '—'} />
              <Row label="Deposit" value={financial.deposit_amount ? `$${financial.deposit_amount.toLocaleString('en-AU')}` : '—'} />
              <Row label="First home buyer" value={financial.first_home_buyer ? '✓' : '—'} />
              <Row label="Residency" value={financial.residency_status || '—'} />
              <Row label="Current rent" value={financial.current_rental_payment ? `$${financial.current_rental_payment}/${financial.rental_payment_frequency}` : '—'} />
              <Row label="Debts" value={financial.existing_debts ? `$${financial.existing_debts.toLocaleString('en-AU')}` : '—'} />
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No financial profile yet</p>
          )}
        </div>

        {/* Groups */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Groups ({groups?.length || 0})</h3>
          {groups && groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map((gm: any) => (
                <Link key={gm.id} href={`/dashboard/groups/${gm.group?.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                  <div>
                    <div className="font-medium">{gm.group?.name}</div>
                    <div className="text-xs text-slate-500">
                      {gm.ownership_percentage}% ownership · {gm.role} · {gm.is_borrower ? 'Borrower' : 'Non-borrower'}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{gm.group?.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not in any groups</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <UserActions userId={user.id} currentRole={user.app_role} callerRole={auth.profile.app_role} />
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}
