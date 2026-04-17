import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import AnnouncementList from './AnnouncementList';

export default async function AnnouncementsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;

  const { data: announcements } = await auth.admin.from('announcements')
    .select('*').order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">In-app banner messages shown to users</p>
        </div>
        <Link href="/dashboard/announcements/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg">
          + New Announcement
        </Link>
      </div>

      <AnnouncementList announcements={announcements || []} />
    </div>
  );
}
