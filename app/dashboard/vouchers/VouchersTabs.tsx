'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VouchersTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: '/dashboard/vouchers/codes', label: 'Codes' },
    { href: '/dashboard/vouchers/rules', label: 'Rules' },
    { href: '/dashboard/vouchers/generate', label: 'Generate' },
  ];

  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
      {tabs.map(t => {
        const active = pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href}
            className={`px-4 py-1.5 text-sm rounded-md transition ${
              active ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
