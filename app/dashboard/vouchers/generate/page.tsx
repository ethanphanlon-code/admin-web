import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import GenerateForm from './GenerateForm';

export default async function GeneratePage({ searchParams }: { searchParams: Promise<{ rule?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const params = await searchParams;

  const { data: rules } = await auth.admin.from('voucher_rules')
    .select('*').eq('is_active', true).order('name');

  if (!rules || rules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600 mb-4">No active rules available.</p>
        <Link href="/dashboard/vouchers/rules/new"
          className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          Create your first rule →
        </Link>
        <p className="text-xs text-slate-400 mt-3">Rules define the discount and code shape. Generate codes from them in bulk.</p>
      </div>
    );
  }

  return <GenerateForm rules={rules} selectedRuleId={params.rule} />;
}
