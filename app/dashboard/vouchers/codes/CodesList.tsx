'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function CodesList({ codes }: { codes: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleAll = () => {
    if (selected.size === codes.length) setSelected(new Set());
    else setSelected(new Set(codes.map(c => c.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const bulkActivate = async (active: boolean) => {
    if (selected.size === 0) return;
    if (!confirm(`${active ? 'Activate' : 'Deactivate'} ${selected.size} code(s)?`)) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('vouchers').update({ is_active: active }).in('id', Array.from(selected));
    setSelected(new Set());
    setLoading(false);
    router.refresh();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`DELETE ${selected.size} code(s)? This cannot be undone.`)) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('vouchers').delete().in('id', Array.from(selected));
    setSelected(new Set());
    setLoading(false);
    router.refresh();
  };

  const exportSelected = () => {
    const selectedCodes = codes.filter(c => selected.has(c.id));
    const rows = [
      ['code', 'discount', 'max_redemptions', 'redemptions', 'expires_at', 'campaign', 'active'],
      ...selectedCodes.map(c => [
        c.code,
        c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`,
        c.max_redemptions,
        c.redemption_count || 0,
        c.expires_at || 'never',
        c.campaign_name || '',
        c.is_active ? 'yes' : 'no',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteOne = async (id: string, code: string) => {
    if (!confirm(`Delete code "${code}"?`)) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('vouchers').delete().eq('id', id);
    router.refresh();
  };

  const toggleOneActive = async (id: string, active: boolean) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('vouchers').update({ is_active: !active }).eq('id', id);
    router.refresh();
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="text-sm text-brand-700">
            <strong>{selected.size}</strong> selected
          </div>
          <div className="flex gap-2">
            <button onClick={exportSelected} disabled={loading}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50">
              Export CSV
            </button>
            <button onClick={() => bulkActivate(true)} disabled={loading}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50">
              Activate
            </button>
            <button onClick={() => bulkActivate(false)} disabled={loading}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50">
              Deactivate
            </button>
            <button onClick={bulkDelete} disabled={loading}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg">
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table>
          <thead>
            <tr>
              <th className="w-8">
                <input type="checkbox" checked={selected.size === codes.length && codes.length > 0}
                  onChange={toggleAll} />
              </th>
              <th>Code</th>
              <th>Discount</th>
              <th>Uses</th>
              <th>Redeemed</th>
              <th>Expires</th>
              <th>Rule</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.length > 0 ? codes.map(c => {
              const usesLeft = c.max_redemptions ? c.max_redemptions - (c.redemption_count || 0) : null;
              const expired = c.expires_at && new Date(c.expires_at) < new Date();
              return (
                <tr key={c.id} className={expired ? 'opacity-60' : ''}>
                  <td>
                    <input type="checkbox" checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)} />
                  </td>
                  <td>
                    <span className="font-mono font-bold text-brand-600">{c.code}</span>
                    {c.campaign_name && <div className="text-xs text-slate-500">{c.campaign_name}</div>}
                  </td>
                  <td className="font-medium">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                  </td>
                  <td>
                    <span className="text-sm">{c.max_redemptions}</span>
                    {usesLeft !== null && (
                      <div className="text-xs text-slate-500">{usesLeft} left</div>
                    )}
                  </td>
                  <td>{c.redemption_count || 0}</td>
                  <td className="text-xs">
                    {expired ? (
                      <span className="text-red-500">Expired</span>
                    ) : c.expires_at ? (
                      <span className="text-slate-600">{new Date(c.expires_at).toLocaleDateString('en-AU')}</span>
                    ) : (
                      <span className="text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="text-xs text-slate-600">{c.rule?.name || '—'}</td>
                  <td>
                    <button onClick={() => toggleOneActive(c.id, c.is_active)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${c.is_active ? 'bg-brand-500' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${c.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/vouchers/codes/${c.id}`} className="text-brand-500 text-xs font-medium">Edit</Link>
                      <button onClick={() => deleteOne(c.id, c.code)} className="text-red-500 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={9} className="text-center py-12 text-slate-400">
                No codes yet. <Link href="/dashboard/vouchers/generate" className="text-brand-500">Generate some</Link>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
