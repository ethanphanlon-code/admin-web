import VouchersTabs from './VouchersTabs';

export default function VouchersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Vouchers</h1>
        <p className="text-sm text-slate-500 mt-1">Discount rules and generated codes</p>
      </div>
      <VouchersTabs />
      {children}
    </div>
  );
}
