import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import AnnouncementForm from '../AnnouncementForm';

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: announcement } = await auth.admin.from('announcements').select('*').eq('id', id).single();
  if (!announcement) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Announcement</h1>
      <AnnouncementForm announcement={announcement} />
    </div>
  );
}
