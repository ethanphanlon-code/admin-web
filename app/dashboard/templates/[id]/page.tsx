import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TemplateForm from './TemplateForm';

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: tpl } = await auth.admin.from('region_documents').select('*').eq('id', id).single();
  if (!tpl) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/templates" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Back</Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Template</h1>
      <TemplateForm template={tpl} />
    </div>
  );
}
