import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import RuleForm from '../RuleForm';

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: rule } = await auth.admin.from('voucher_rules').select('*').eq('id', id).single();
  if (!rule) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Rule</h2>
      <RuleForm rule={rule} />
    </div>
  );
}
