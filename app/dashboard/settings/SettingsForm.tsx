'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function SettingsForm({ settings }: { settings: any[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(settings.map(s => [s.key, s.value]))
  );
  const [saving, setSaving] = useState<string>('');

  const save = async (key: string) => {
    setSaving(key);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('site_settings').update({
        value: values[key], updated_at: new Date().toISOString(),
      }).eq('key', key);
      if (error) throw error;
      router.refresh();
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setSaving(''); }
  };

  if (settings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500 mb-4">No settings configured yet.</p>
        <p className="text-xs text-slate-400">
          Run migration 013 to seed default site settings, or insert rows into the <code>site_settings</code> table.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settings.map(s => {
        const isBoolean = typeof s.value === 'boolean';
        const isNumber = typeof s.value === 'number';
        const isObject = typeof s.value === 'object' && s.value !== null;
        return (
          <div key={s.key} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-medium text-sm font-mono">{s.key}</div>
                {s.description && <div className="text-xs text-slate-500 mt-1">{s.description}</div>}
              </div>
              <button onClick={() => save(s.key)} disabled={saving === s.key}
                className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded disabled:opacity-50">
                {saving === s.key ? '...' : 'Save'}
              </button>
            </div>

            {isBoolean ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!values[s.key]}
                  onChange={e => setValues({ ...values, [s.key]: e.target.checked })} />
                <span className="text-sm">{values[s.key] ? 'Enabled' : 'Disabled'}</span>
              </label>
            ) : isNumber ? (
              <input type="number" value={values[s.key] || 0}
                onChange={e => setValues({ ...values, [s.key]: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            ) : isObject ? (
              <textarea value={JSON.stringify(values[s.key], null, 2)}
                onChange={e => { try { setValues({ ...values, [s.key]: JSON.parse(e.target.value) }); } catch {} }}
                rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono" />
            ) : (
              <input type="text" value={values[s.key] || ''}
                onChange={e => setValues({ ...values, [s.key]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            )}
          </div>
        );
      })}
    </div>
  );
}
