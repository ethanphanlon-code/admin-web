'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function PricingEditor({ region }: { region: any }) {
  const router = useRouter();
  const defaults = region.pricing_defaults || {
    setupFees: { starter: 99, standard: 259, premium: 499 },
    transactionRates: { starter: 0.03, standard: 0.015, premium: 0.005 },
    transactionCaps: { starter: 40, standard: 25, premium: 15 },
  };

  const [pricing, setPricing] = useState(defaults);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('region_config')
        .update({ pricing_defaults: pricing }).eq('region_code', region.region_code);
      if (error) throw error;
      router.refresh();
      alert('Pricing saved for ' + region.region_name);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  const tiers = ['starter', 'standard', 'premium'] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{region.region_name}</h3>
          <p className="text-xs text-slate-500 font-mono">{region.region_code}</p>
        </div>
        <button onClick={save} disabled={loading}
          className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tiers.map(tier => (
          <div key={tier} className="border border-slate-200 rounded-lg p-3">
            <div className="font-semibold text-sm capitalize mb-3">{tier}</div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Setup Fee ({region.currency_symbol})</label>
                <input type="number" value={pricing.setupFees[tier]}
                  onChange={e => setPricing({ ...pricing, setupFees: { ...pricing.setupFees, [tier]: parseFloat(e.target.value) || 0 }})}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Txn Rate (0.015 = 1.5%)</label>
                <input type="number" step="0.001" value={pricing.transactionRates[tier]}
                  onChange={e => setPricing({ ...pricing, transactionRates: { ...pricing.transactionRates, [tier]: parseFloat(e.target.value) || 0 }})}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Txn Cap ({region.currency_symbol})</label>
                <input type="number" value={pricing.transactionCaps[tier]}
                  onChange={e => setPricing({ ...pricing, transactionCaps: { ...pricing.transactionCaps, [tier]: parseFloat(e.target.value) || 0 }})}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
