import { requireAdmin } from '@/lib/supabase';
import PricingEditor from './PricingEditor';

export default async function PricingPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: regions } = await auth.admin.from('region_config')
    .select('region_code, region_name, currency_symbol, pricing_defaults')
    .order('region_code');

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Pricing Tiers</h1>
        <p className="text-sm text-slate-500 mt-1">Setup fees and transaction rates per region</p>
      </div>

      <div className="space-y-4">
        {regions?.map((r: any) => (
          <PricingEditor key={r.region_code} region={r} />
        ))}
      </div>
    </div>
  );
}
