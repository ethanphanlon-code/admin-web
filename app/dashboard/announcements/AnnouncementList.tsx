'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AnnouncementList({ announcements }: { announcements: any[] }) {
  const router = useRouter();

  const toggle = async (id: string, active: boolean) => {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('announcements').update({ is_active: !active }).eq('id', id);
    router.refresh();
  };

  const del = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('announcements').delete().eq('id', id);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {announcements.length > 0 ? announcements.map((a: any) => {
        const styleColors: Record<string, string> = {
          info: 'bg-blue-50 border-blue-200 text-blue-900',
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          warning: 'bg-amber-50 border-amber-200 text-amber-900',
          danger: 'bg-red-50 border-red-200 text-red-900',
        };
        return (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`px-5 py-3 border-b ${styleColors[a.style] || styleColors.info}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{a.icon} {a.title}</div>
                  <div className="text-sm mt-1">{a.body}</div>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center justify-between bg-slate-50">
              <div className="flex gap-3 text-xs text-slate-500">
                <span>Audience: {a.audience || 'all'}</span>
                {a.region_code && <span>Region: {a.region_code}</span>}
                <span>Style: {a.style}</span>
                {a.expires_at && <span>Expires: {new Date(a.expires_at).toLocaleDateString('en-AU')}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(a.id, a.is_active)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${a.is_active ? 'bg-brand-500' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${a.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <Link href={`/dashboard/announcements/${a.id}`} className="text-sm text-brand-500">Edit</Link>
                <button onClick={() => del(a.id, a.title)} className="text-sm text-red-500">Delete</button>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          No announcements yet. <Link href="/dashboard/announcements/new" className="text-brand-500">Create one</Link>.
        </div>
      )}
    </div>
  );
}
