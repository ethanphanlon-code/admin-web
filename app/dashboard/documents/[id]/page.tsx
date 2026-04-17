import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return null;
  const { id } = await params;

  const { data: doc } = await auth.admin.from('documents').select('*, group:groups(id, name)').eq('id', id).single();
  if (!doc) notFound();

  const { data: sigs } = await auth.admin.from('document_signatures')
    .select('*, signer:profiles(full_name, email)')
    .eq('document_id', id).order('signed_at');

  const { data: emails } = await auth.admin.from('document_emails')
    .select('*').eq('document_id', id).order('sent_at', { ascending: false });

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/documents" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Back</Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{doc.title}</h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200">{doc.document_type}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full border ${
            doc.status === 'executed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            'bg-slate-50 border-slate-200 text-slate-600'
          }`}>{doc.status}</span>
          <span className="px-2 py-0.5 text-xs rounded-full border bg-slate-50 border-slate-200">v{doc.version}</span>
          <Link href={`/dashboard/groups/${doc.group?.id}`} className="px-2 py-0.5 text-xs rounded-full border bg-brand-50 border-brand-200 text-brand-700">
            {doc.group?.name}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Content</h3>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans max-h-[600px] overflow-auto bg-slate-50 p-4 rounded-lg">
            {doc.content_markdown || 'No content'}
          </pre>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-3">Signatures ({sigs?.length || 0})</h3>
            {sigs && sigs.length > 0 ? sigs.map((s: any) => (
              <div key={s.id} className="py-2 border-b border-slate-100 last:border-0">
                <div className="font-medium text-sm">{s.signer?.full_name}</div>
                <div className="text-xs text-slate-500">
                  {new Date(s.signed_at).toLocaleString('en-AU')}
                </div>
                <div className="text-xs text-slate-400 italic mt-1">
                  Typed: "{s.typed_name}"
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">No signatures yet</p>}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-3">Email History</h3>
            {emails && emails.length > 0 ? emails.map((e: any) => (
              <div key={e.id} className="py-2 border-b border-slate-100 last:border-0">
                <div className="text-sm font-medium">{e.subject}</div>
                <div className="text-xs text-slate-500">
                  {e.recipient_count} recipients · {new Date(e.sent_at).toLocaleString('en-AU')}
                </div>
                <div className="text-xs text-slate-400">{e.status} · {e.trigger_type}</div>
              </div>
            )) : <p className="text-sm text-slate-400">No emails sent</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
