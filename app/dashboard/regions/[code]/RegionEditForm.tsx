'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function RegionEditForm({ region }: { region: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    region_name: region.region_name || '',
    short_name: region.short_name || '',
    currency_code: region.currency_code || '',
    currency_symbol: region.currency_symbol || '',
    property_tax_name: region.property_tax_name || '',
    lawyer_term: region.lawyer_term || '',
    mortgage_term: region.mortgage_term || '',
    co_ownership_structure: region.co_ownership_structure || '',
    factoids: (region.factoids || []).join('\n'),
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('region_config').update({
        ...form,
        factoids: form.factoids.split('\n').filter(f => f.trim()),
      }).eq('region_code', region.region_code);
      if (error) throw error;
      router.refresh();
      alert('Saved');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  const Input = ({ label, name }: { label: string; name: keyof typeof form }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold mb-4">Region Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Input label="Region Name" name="region_name" />
        <Input label="Short Name" name="short_name" />
        <Input label="Currency Code" name="currency_code" />
        <Input label="Currency Symbol" name="currency_symbol" />
        <Input label="Property Tax Name" name="property_tax_name" />
        <Input label="Co-Ownership Structure" name="co_ownership_structure" />
        <Input label="Lawyer Term" name="lawyer_term" />
        <Input label="Mortgage Term" name="mortgage_term" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Factoids (one per line)</label>
        <textarea value={form.factoids} onChange={e => setForm({ ...form, factoids: e.target.value })}
          rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <button onClick={save} disabled={loading}
        className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
