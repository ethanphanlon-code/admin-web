'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function CodeEditForm({ code }: { code: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: code.code,
    description: code.description || '',
    discount_type: code.discount_type,
    discount_value: code.discount_value,
    max_redemptions: code.max_redemptions || 1,
    expires_at: code.expires_at ? code.expires_at.split('T')[0] : '',
    applies_to: code.applies_to || 'setup_fee',
    region_code: code.region_code || '',
    min_group_size: code.min_group_size || '',
    max_group_size: code.max_group_size || '',
    campaign_name: code.campaign_name || '',
    internal_notes: code.internal_notes || '',
    is_active: code.is_active,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        code: form.code.toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value.toString()),
        max_redemptions: parseInt(form.max_redemptions.toString()),
        expires_at: form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
        applies_to: form.applies_to,
        region_code: form.region_code || null,
        min_group_size: form.min_group_size ? parseInt(form.min_group_size.toString()) : null,
        max_group_size: form.max_group_size ? parseInt(form.max_group_size.toString()) : null,
        campaign_name: form.campaign_name || null,
        internal_notes: form.internal_notes || null,
        is_active: form.is_active,
      };
      const { error } = await supabase.from('vouchers').update(payload).eq('id', code.id);
      if (error) throw error;
      router.refresh();
      alert('Saved');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  const del = async () => {
    if (!confirm(`Delete code "${code.code}"? This cannot be undone.`)) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('vouchers').delete().eq('id', code.id);
    router.push('/dashboard/vouchers/codes');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <input value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-lg font-mono font-bold uppercase text-brand-600" />
        <div className="text-xs text-slate-500">
          {code.redemption_count || 0} / {form.max_redemptions} redeemed
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description (shown to user)</label>
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Discount Type</label>
          <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Value {form.discount_type === 'percentage' ? '(%)' : '($)'}
          </label>
          <input type="number" value={form.discount_value}
            onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Max redemptions</label>
          <input type="number" value={form.max_redemptions} min="1"
            onChange={e => setForm({ ...form, max_redemptions: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Expires</label>
          <input type="date" value={form.expires_at}
            onChange={e => setForm({ ...form, expires_at: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Applies To</label>
        <select value={form.applies_to} onChange={e => setForm({ ...form, applies_to: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="setup_fee">Setup fee only</option>
          <option value="transaction_fee">Transaction fees only</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Region</label>
          <input value={form.region_code}
            onChange={e => setForm({ ...form, region_code: e.target.value.toUpperCase() })}
            placeholder="AU-QLD" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Min group</label>
          <input type="number" value={form.min_group_size}
            onChange={e => setForm({ ...form, min_group_size: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Max group</label>
          <input type="number" value={form.max_group_size}
            onChange={e => setForm({ ...form, max_group_size: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Campaign name</label>
        <input value={form.campaign_name}
          onChange={e => setForm({ ...form, campaign_name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Internal notes (admin only)</label>
        <textarea value={form.internal_notes}
          onChange={e => setForm({ ...form, internal_notes: e.target.value })}
          rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
        <span className="text-sm">Active</span>
      </label>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button onClick={save} disabled={loading}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
          Cancel
        </button>
        <div className="flex-1" />
        <button onClick={del} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg">
          Delete
        </button>
      </div>
    </div>
  );
}
