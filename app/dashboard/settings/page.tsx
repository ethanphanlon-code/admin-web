import { requireAdmin } from '@/lib/supabase';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: settings } = await auth.admin.from('site_settings').select('*').order('key');

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Global configuration and feature flags</p>
      </div>

      <SettingsForm settings={settings || []} />
    </div>
  );
}
