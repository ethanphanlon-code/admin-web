'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

function generatePreview(length: number, charset: string, prefix: string): string {
  const sets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
    letters: 'ABCDEFGHJKMNPQRSTUVWXYZ',
    numbers: '23456789',
  };
  const chars = sets[charset] || sets.alphanumeric;
  let out = prefix || '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function RuleForm({ rule }: { rule?: any }) {
  const router = useRouter();
  const isEdit = !!rule;
  const [form, setForm] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    discount_type: rule?.discount_type || 'percentage',
    discount_value: rule?.discount_value || 20,
    code_length: rule?.code_length || 6,
    code_prefix: rule?.code_prefix || '',
    code_charset: rule?.code_charset || 'alphanumeric',
    max_redemptions_per_code: rule?.max_redemptions_per_code || 1,
    default_expires_days: rule?.default_expires_days || '',
    region_code: rule?.region_code || '',
    applies_to: rule?.applies_to || 'setup_fee',
    min_group_size: rule?.min_group_size || '',
    max_group_size: rule?.max_group_size || '',
    is_active: rule?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [previewSeed, setPreviewSeed] = useState(0);

  const previewCodes = useMemo(() => {
    return Array.from({ length: 3 }, () =>
      generatePreview(form.code_length, form.code_charset, form.code_prefix)
    );
  }, [form.code_length, form.code_charset, form.code_prefix, previewSeed]);

  const save = async () => {
    if (!form.name) { alert('Rule name is required'); return; }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        name: form.name,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value.toString()),
        code_length: parseInt(form.code_length.toString()),
        code_prefix: form.code_prefix || '',
        code_charset: form.code_charset,
        max_redemptions_per_code: parseInt(form.max_redemptions_per_code.toString()),
        default_expires_days: form.default_expires_days ? parseInt(form.default_expires_days.toString()) : null,
        region_code: form.region_code || null,
        applies_to: form.applies_to,
        min_group_size: form.min_group_size ? parseInt(form.min_group_size.toString()) : null,
        max_group_size: form.max_group_size ? parseInt(form.max_group_size.toString()) : null,
        is_active: form.is_active,
      };
      const { error } = isEdit
        ? await supabase.from('voucher_rules').update(payload).eq('id', rule.id)
        : await supabase.from('voucher_rules').insert(payload);
      if (error) throw error;
      router.push('/dashboard/vouchers/rules');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Basics */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-slate-900">Rule Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rule Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Launch Promo 20% Off"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description (internal)</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Shown to users at checkout"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-sm mb-3 text-slate-900">Discount</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Value {form.discount_type === 'percentage' ? '(0-100)' : '($)'}
              </label>
              <input type="number" value={form.discount_value}
                onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                min="0" max={form.discount_type === 'percentage' ? 100 : undefined}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Applies To</label>
            <select value={form.applies_to} onChange={e => setForm({ ...form, applies_to: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="setup_fee">Setup fee only</option>
              <option value="transaction_fee">Transaction fees only</option>
              <option value="both">Both setup + transaction fees</option>
            </select>
          </div>
        </div>

        {/* Code shape */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-sm mb-3 text-slate-900">Code Format</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Length</label>
              <input type="number" value={form.code_length} min="4" max="20"
                onChange={e => setForm({ ...form, code_length: parseInt(e.target.value) || 6 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <p className="text-xs text-slate-400 mt-1">4–20 chars</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Charset</label>
              <select value={form.code_charset} onChange={e => setForm({ ...form, code_charset: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="alphanumeric">A–Z + 2–9</option>
                <option value="letters">Letters only</option>
                <option value="numbers">Numbers only</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">0/O, 1/I/L excluded</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prefix (optional)</label>
              <input value={form.code_prefix}
                onChange={e => setForm({ ...form, code_prefix: e.target.value.toUpperCase() })}
                placeholder="LAUNCH-" maxLength={10}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase" />
              <p className="text-xs text-slate-400 mt-1">Optional prefix</p>
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-sm mb-3 text-slate-900">Usage Limits</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Uses per code</label>
              <input type="number" value={form.max_redemptions_per_code} min="1"
                onChange={e => setForm({ ...form, max_redemptions_per_code: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <p className="text-xs text-slate-400 mt-1">1 = single-use code</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Default expiry (days from creation)</label>
              <input type="number" value={form.default_expires_days}
                onChange={e => setForm({ ...form, default_expires_days: e.target.value })}
                placeholder="Blank = never expires" min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-sm mb-3 text-slate-900">Targeting <span className="text-xs font-normal text-slate-400">(optional)</span></h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Region code</label>
              <input value={form.region_code}
                onChange={e => setForm({ ...form, region_code: e.target.value.toUpperCase() })}
                placeholder="AU-QLD, blank = all"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min group size</label>
              <input type="number" value={form.min_group_size}
                onChange={e => setForm({ ...form, min_group_size: e.target.value })}
                min="2" max="4" placeholder="Any"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max group size</label>
              <input type="number" value={form.max_group_size}
                onChange={e => setForm({ ...form, max_group_size: e.target.value })}
                min="2" max="4" placeholder="Any"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 border-t border-slate-200 pt-5">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <span className="text-sm">Rule is active (can be used for code generation)</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={loading || !form.name}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Rule' : 'Create Rule'}
          </button>
          <button onClick={() => router.back()} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
            Cancel
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit sticky top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-900">Live Preview</h3>
          <button onClick={() => setPreviewSeed(s => s + 1)} className="text-xs text-brand-500">↻ Refresh</button>
        </div>

        <div className="space-y-2 mb-4">
          {previewCodes.map((c, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-center text-lg font-bold text-brand-600">
              {c}
            </div>
          ))}
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between"><span>Discount</span>
            <span className="font-medium">{form.discount_type === 'percentage' ? `${form.discount_value}%` : `$${form.discount_value}`}</span>
          </div>
          <div className="flex justify-between"><span>Length</span><span className="font-medium">{form.code_length} chars</span></div>
          <div className="flex justify-between"><span>Uses each</span><span className="font-medium">{form.max_redemptions_per_code}</span></div>
          <div className="flex justify-between"><span>Expires</span>
            <span className="font-medium">{form.default_expires_days ? `${form.default_expires_days} days` : 'Never'}</span>
          </div>
          {form.region_code && <div className="flex justify-between"><span>Region</span><span className="font-mono">{form.region_code}</span></div>}
        </div>
      </div>
    </div>
  );
}
