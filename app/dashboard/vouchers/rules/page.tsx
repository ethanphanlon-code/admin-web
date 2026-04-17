import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import RulesList from './RulesList';

export default async function RulesPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: rules } = await auth.admin.from('voucher_rules')
    .select('*, vouchers(count)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">Templates that define the shape of generated codes</p>
        <Link href="/dashboard/vouchers/rules/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          + New Rule
        </Link>
      </div>
      <RulesList rules={rules || []} />
    </div>
  );
}
