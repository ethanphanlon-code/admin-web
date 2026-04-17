import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CodeEditForm from './CodeEditForm';

export default async function EditCodePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: code } = await auth.admin.from('vouchers')
    .select('*, rule:voucher_rules(name, code_length)')
    .eq('id', id).single();
  if (!code) notFound();

  const { data: redemptions } = await auth.admin.from('voucher_redemptions')
    .select('*, user:profiles(full_name, email), group:groups(name)')
    .eq('voucher_id', id).order('redeemed_at', { ascending: false });

  return (
    <div>
      <Link href="/dashboard/vouchers/codes" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Back to codes</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeEditForm code={code} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Redemption History</h3>
          {redemptions && redemptions.length > 0 ? (
            <div className="space-y-2">
              {redemptions.map((r: any) => (
                <div key={r.id} className="border-b border-slate-100 last:border-0 pb-2">
                  <div className="text-sm font-medium">{r.user?.full_name}</div>
                  <div className="text-xs text-slate-500">{r.group?.name}</div>
                  <div className="text-xs text-slate-400">{new Date(r.redeemed_at).toLocaleString('en-AU')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not yet redeemed</p>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <div>Created: {new Date(code.created_at).toLocaleString('en-AU')}</div>
            {code.rule && <div>From rule: <Link href={`/dashboard/vouchers/rules/${code.rule_id}`} className="text-brand-500">{code.rule.name}</Link></div>}
            {code.generated_in_batch && <div>Batch: <span className="font-mono text-xs">{code.generated_in_batch.substring(0, 8)}...</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
