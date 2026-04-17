import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GroupActions from './GroupActions';

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: group } = await auth.admin.from('groups').select('*').eq('id', id).single();
  if (!group) notFound();

  const [
    { data: members },
    { data: documents },
    { data: expenses },
    { data: payments },
  ] = await Promise.all([
    auth.admin.from('group_members').select('*, profile:profiles(full_name, email, profile_color)')
      .eq('group_id', id).eq('is_active', true).order('ownership_percentage', { ascending: false }),
    auth.admin.from('documents').select('id, document_type, title, status, version, last_signed_at, generated_at')
      .eq('group_id', id).order('generated_at', { ascending: false }),
    auth.admin.from('expenses').select('id, title, category, total_amount, status, created_at')
      .eq('group_id', id).order('created_at', { ascending: false }).limit(20),
    auth.admin.from('payments').select('id, amount, status, payment_method, created_at, user:profiles(full_name)')
      .eq('group_id', id).order('created_at', { ascending: false }).limit(20),
  ]);

  const totalOwnership = members?.reduce((s, m) => s + (m.ownership_percentage || 0), 0) || 0;
  const totalSpent = expenses?.reduce((s, e) => s + (e.total_amount || 0), 0) || 0;

  return (
    <div className="max-w-6xl">
      <Link href="/dashboard/groups" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Back to groups
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200 capitalize">
              {group.status}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200">
              {group.region || group.country}
            </span>
            {group.is_paid && (
              <span className="px-2 py-0.5 text-xs rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                {group.pricing_tier || 'Paid'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Members" value={members?.length || 0} />
        <Stat label="Ownership Total" value={`${totalOwnership}%`} warn={totalOwnership !== 100} />
        <Stat label="Documents" value={documents?.length || 0} />
        <Stat label="Total Expenses" value={`$${totalSpent.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold">Members</h3>
          </div>
          <div>
            {members?.map((m: any, i: number) => (
              <Link key={m.id} href={`/dashboard/users/${m.user_id}`}
                className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: m.profile?.profile_color || '#0D7C66' }}>
                    {m.profile?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{m.profile?.full_name}</div>
                    <div className="text-xs text-slate-500">{m.role} · {m.is_borrower ? 'Borrower' : 'Non-borrower'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{m.ownership_percentage}%</div>
                  <div className="text-xs text-slate-500">{m.current_streak} 🔥</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold">Documents</h3>
          </div>
          <div>
            {documents && documents.length > 0 ? documents.map((d: any) => (
              <Link key={d.id} href={`/dashboard/documents/${d.id}`}
                className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <div>
                  <div className="font-medium text-sm">{d.title}</div>
                  <div className="text-xs text-slate-500">v{d.version} · {new Date(d.generated_at).toLocaleDateString('en-AU')}</div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${
                  d.status === 'executed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  d.status === 'partially_signed' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  {d.status}
                </span>
              </Link>
            )) : (
              <div className="p-8 text-center text-sm text-slate-400">No documents yet</div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold">Recent Expenses</h3>
            <Link href={`/dashboard/expenses?group=${id}`} className="text-xs text-brand-500">View all →</Link>
          </div>
          <div>
            {expenses && expenses.length > 0 ? expenses.slice(0, 8).map((e: any) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-sm">{e.title}</div>
                  <div className="text-xs text-slate-500">{e.category} · {e.status}</div>
                </div>
                <div className="font-semibold text-sm">${e.total_amount?.toLocaleString('en-AU')}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-slate-400">No expenses yet</div>
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold">Recent Payments</h3>
            <Link href={`/dashboard/payments?group=${id}`} className="text-xs text-brand-500">View all →</Link>
          </div>
          <div>
            {payments && payments.length > 0 ? payments.slice(0, 8).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-medium text-sm">{p.user?.full_name}</div>
                  <div className="text-xs text-slate-500">{p.payment_method} · {p.status}</div>
                </div>
                <div className="font-semibold text-sm">${p.amount?.toFixed(2)}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-slate-400">No payments yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <GroupActions groupId={group.id} currentStatus={group.status} isPaid={group.is_paid} />
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: any; warn?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${warn ? 'text-amber-600' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
