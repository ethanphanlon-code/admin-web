'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function GenerateForm({ rules, selectedRuleId }: { rules: any[]; selectedRuleId?: string }) {
  const router = useRouter();
  const [ruleId, setRuleId] = useState(selectedRuleId || rules[0]?.id);
  const [quantity, setQuantity] = useState(10);
  const [campaignName, setCampaignName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const rule = rules.find(r => r.id === ruleId);

  const generate = async () => {
    if (quantity < 1 || quantity > 10000) {
      alert('Quantity must be between 1 and 10000');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('generate_voucher_codes', {
        p_rule_id: ruleId,
        p_quantity: quantity,
        p_campaign_name: campaignName || null,
        p_expires_at: expiresAt ? new Date(expiresAt + 'T23:59:59').toISOString() : null,
      });
      if (error) throw error;
      const d: any = data;
      if (d.error) throw new Error(d.error);

      // Fetch the generated codes
      const { data: codes } = await supabase.from('vouchers')
        .select('code, expires_at, max_redemptions')
        .eq('generated_in_batch', d.batch_id).order('code');

      setResult({ ...d, codes: codes || [] });
      router.refresh();
    } catch (e: unknown) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result?.codes) return;
    const rows = [
      ['code', 'expires_at', 'max_redemptions', 'campaign'],
      ...result.codes.map((c: any) => [
        c.code,
        c.expires_at || 'never',
        c.max_redemptions,
        result.campaign,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${result.campaign?.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    if (!result?.codes) return;
    navigator.clipboard.writeText(result.codes.map((c: any) => c.code).join('\n'));
    alert('Copied ' + result.codes.length + ' codes to clipboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Generate Codes</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rule</label>
          <select value={ruleId} onChange={e => setRuleId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {rules.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.discount_type === 'percentage' ? `${r.discount_value}%` : `$${r.discount_value}`} ({r.code_length} chars, {r.max_redemptions_per_code} use{r.max_redemptions_per_code !== 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>

        {rule && (
          <div className="bg-slate-50 rounded-lg p-3 text-xs grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">Discount:</span> <strong>{rule.discount_type === 'percentage' ? `${rule.discount_value}%` : `$${rule.discount_value}`}</strong></div>
            <div><span className="text-slate-500">Format:</span> <code className="font-mono">{rule.code_prefix}{'X'.repeat(rule.code_length)}</code></div>
            <div><span className="text-slate-500">Uses per code:</span> <strong>{rule.max_redemptions_per_code}</strong></div>
            <div><span className="text-slate-500">Default expiry:</span> <strong>{rule.default_expires_days ? `${rule.default_expires_days} days` : 'Never'}</strong></div>
            {rule.region_code && <div><span className="text-slate-500">Region:</span> <code className="font-mono">{rule.region_code}</code></div>}
            <div><span className="text-slate-500">Applies to:</span> <strong>{rule.applies_to?.replace('_', ' ')}</strong></div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input type="number" value={quantity} min="1" max="10000"
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <p className="text-xs text-slate-400 mt-1">1–10,000 codes per batch</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign name (optional)</label>
            <input value={campaignName} onChange={e => setCampaignName(e.target.value)}
              placeholder={rule?.name || 'e.g. Q2 Launch Campaign'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Override expiry (optional)</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <p className="text-xs text-slate-400 mt-1">
            Leaving this blank uses the rule's default ({rule?.default_expires_days ? `${rule.default_expires_days} days from today` : 'never expires'})
          </p>
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? `Generating ${quantity} codes...` : `Generate ${quantity} code${quantity !== 1 ? 's' : ''}`}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
        {result ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <span className="text-emerald-700">✓</span>
              </div>
              <div>
                <div className="font-semibold text-sm">{result.generated} codes generated</div>
                <div className="text-xs text-slate-500">{result.campaign}</div>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={copyAll} className="flex-1 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50">
                Copy all
              </button>
              <button onClick={downloadCSV} className="flex-1 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50">
                Download CSV
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
              {result.codes?.map((c: any, i: number) => (
                <div key={i} className={`px-3 py-2 font-mono text-sm border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-slate-50' : ''}`}>
                  {c.code}
                </div>
              ))}
            </div>

            <Link href={`/dashboard/vouchers/codes?batch=${result.batch_id}`}
              className="block mt-3 text-center text-xs text-brand-500 hover:text-brand-600">
              View in codes list →
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">
            Select a rule and quantity, then generate.
            <br />
            Results appear here.
          </div>
        )}
      </div>
    </div>
  );
}
