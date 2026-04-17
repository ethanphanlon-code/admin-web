import { requireAdmin } from '@/lib/supabase';
import SchemeForm from '../SchemeForm';

export default async function NewSchemePage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { data: regions } = await auth.admin.from('region_config').select('region_code, region_name').order('region_code');

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">New Scheme</h1>
      <SchemeForm regions={regions || []} />
    </div>
  );
}
