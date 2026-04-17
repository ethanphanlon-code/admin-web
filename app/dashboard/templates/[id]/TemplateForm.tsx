'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function TemplateForm({ template }: { template: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    label: template.label || '',
    icon: template.icon || '',
    description: template.description || '',
    legal_basis: template.legal_basis || '',
    requires_payment: template.requires_payment ?? true,
    display_order: template.display_order || 1,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('region_documents').update({
        ...form,
        display_order: parseInt(form.display_order.toString()),
      }).eq('id', template.id);
      if (error) throw error;
      router.push('/dashboard/templates');
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 font-mono">{template.region_code}</span>
        <span className="px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 font-mono">{template.document_type}</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
          <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" maxLength={4} />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Legal Basis</label>
        <input value={form.legal_basis} onChange={e => setForm({ ...form, legal_basis: e.target.value })}
          placeholder="Property Law Act 1974 (Qld)" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
          <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.requires_payment}
              onChange={e => setForm({ ...form, requires_payment: e.target.checked })} />
            <span className="text-sm">Requires paid plan to generate</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={loading}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : 'Update Template'}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}
