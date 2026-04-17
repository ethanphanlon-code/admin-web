import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    if (auth.reason === 'not_authenticated') redirect('/login');
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar profile={auth.profile} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
