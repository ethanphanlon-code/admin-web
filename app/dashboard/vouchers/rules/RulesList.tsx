'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function RulesList({ rules }: { rules: any[] }) {
  const router = useRouter();

  const toggle = async (id: string, active: boolean) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('voucher_rules').update({ is_active: !active }).eq('id', id);
    router.refresh();
  };

  const del = async (id: string, name: string, count: number) => {
    if (count > 0) {
      if (!confirm(`Rule "${name}" has ${count} codes generated from it. Deleting the rule will unlink those codes but keep them active. Continue?`)) return;
    } else {
      if (!confirm(`Delete rule "${name}"?`)) return;
    }
    const supabase = createSupabaseBrowserClient();
    await supabase.from('voucher_rules').delete().eq('id', id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Discount</th>
            <th>Code Format</th>
            <th>Uses / Code</th>
            <th>Expires</th>
            <th>Generated</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rules.length > 0 ? rules.map((r: any) => (
            <tr key={r.id}>
              <td>
                <div className="font-medium">{r.name}</div>
                {r.description && <div className="text-xs text-slate-500 truncate max-w-xs">{r.description}</div>}
              </td>
              <td className="font-semibold">
                {r.discount_type === 'percentage' ? `${r.discount_value}%` : `$${r.discount_value}`}
              </td>
              <td className="text-slate-600 text-xs">
                <span className="font-mono">{r.code_prefix ? r.code_prefix : ''}{'X'.repeat(r.code_length)}</span>
                <div className="text-xs text-slate-400">{r.code_charset}</div>
              </td>
              <td>{r.max_redemptions_per_code}</td>
              <td className="text-slate-600 text-xs">
                {r.default_expires_days ? `${r.default_expires_days} days` : 'Never'}
              </td>
              <td>
                <span className="text-sm">{r.vouchers?.[0]?.count || 0}</span>
              </td>
              <td>
                <button onClick={() => toggle(r.id, r.is_active)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${r.is_active ? 'bg-brand-500' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${r.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </td>
              <td>
                <div className="flex gap-2">
                  <Link href={`/dashboard/vouchers/generate?rule=${r.id}`} className="text-brand-500 text-sm font-medium">Generate</Link>
                  <Link href={`/dashboard/vouchers/rules/${r.id}`} className="text-slate-600 text-sm">Edit</Link>
                  <button onClick={() => del(r.id, r.name, r.vouchers?.[0]?.count || 0)} className="text-red-500 text-sm">Delete</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={8} className="text-center py-12 text-slate-400">
              No rules yet. <Link href="/dashboard/vouchers/rules/new" className="text-brand-500">Create your first rule</Link>.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
