import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import SchemeForm from '../SchemeForm';

export default async function EditSchemePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: scheme } = await auth.admin.from('region_schemes').select('*').eq('id', id).single();
  if (!scheme) notFound();
  const { data: regions } = await auth.admin.from('region_config').select('region_code, region_name').order('region_code');

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Scheme</h1>
      <SchemeForm regions={regions || []} scheme={scheme} />
    </div>
  );
}
