'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function SchemeForm({ regions, scheme }: { regions: any[]; scheme?: any }) {
  const router = useRouter();
  const isEdit = !!scheme;
  const [form, setForm] = useState({
    region_code: scheme?.region_code || regions[0]?.region_code || '',
    name: scheme?.name || '',
    short_name: scheme?.short_name || '',
    description: scheme?.description || '',
    max_applicants: scheme?.max_applicants || '',
    requirements: (scheme?.requirements || []).join('\n'),
    gotcha: scheme?.gotcha || '',
    display_order: scheme?.display_order || 1,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        region_code: form.region_code,
        name: form.name,
        short_name: form.short_name || null,
        description: form.description,
        max_applicants: form.max_applicants ? parseInt(form.max_applicants.toString()) : null,
        requirements: form.requirements.split('\n').filter(r => r.trim()),
        gotcha: form.gotcha || null,
        display_order: parseInt(form.display_order.toString()),
      };
      const { error } = isEdit
        ? await supabase.from('region_schemes').update(payload).eq('id', scheme.id)
        : await supabase.from('region_schemes').insert(payload);
      if (error) throw error;
      router.push('/dashboard/schemes');
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
        <select value={form.region_code} onChange={e => setForm({ ...form, region_code: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
          {regions.map((r: any) => (
            <option key={r.region_code} value={r.region_code}>{r.region_code} — {r.region_name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Short Name / Acronym</label>
          <input value={form.short_name} onChange={e => setForm({ ...form, short_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Applicants</label>
          <input type="number" value={form.max_applicants} onChange={e => setForm({ ...form, max_applicants: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Leave empty for no limit" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
          <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
        <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}
          rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Gotcha / Warning</label>
        <textarea value={form.gotcha} onChange={e => setForm({ ...form, gotcha: e.target.value })}
          rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={loading || !form.name}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Scheme' : 'Create Scheme'}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}
