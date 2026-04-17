'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AnnouncementForm({ announcement }: { announcement?: any }) {
  const router = useRouter();
  const isEdit = !!announcement;
  const [form, setForm] = useState({
    title: announcement?.title || '',
    body: announcement?.body || '',
    icon: announcement?.icon || '📢',
    style: announcement?.style || 'info',
    audience: announcement?.audience || 'all',
    region_code: announcement?.region_code || '',
    expires_at: announcement?.expires_at ? announcement.expires_at.split('T')[0] : '',
    is_active: announcement?.is_active ?? true,
    is_dismissible: announcement?.is_dismissible ?? true,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        title: form.title, body: form.body, icon: form.icon,
        style: form.style, audience: form.audience,
        region_code: form.audience === 'region' ? form.region_code : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
        is_dismissible: form.is_dismissible,
      };
      const { error } = isEdit
        ? await supabase.from('announcements').update(payload).eq('id', announcement.id)
        : await supabase.from('announcements').insert(payload);
      if (error) throw error;
      router.push('/dashboard/announcements');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
          <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
          rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Style</label>
          <select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="info">Info (blue)</option>
            <option value="success">Success (green)</option>
            <option value="warning">Warning (amber)</option>
            <option value="danger">Danger (red)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
          <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="all">All Users</option>
            <option value="region">Specific Region</option>
          </select>
        </div>
      </div>
      {form.audience === 'region' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Region Code</label>
          <input value={form.region_code} onChange={e => setForm({ ...form, region_code: e.target.value })}
            placeholder="AU-QLD" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Expires On (optional)</label>
        <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <span className="text-sm">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_dismissible} onChange={e => setForm({ ...form, is_dismissible: e.target.checked })} />
          <span className="text-sm">User can dismiss</span>
        </label>
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={loading || !form.title || !form.body}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}
