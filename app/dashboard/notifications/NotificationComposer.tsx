'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationComposer() {
  const router = useRouter();
  const [audience, setAudience] = useState<'all' | 'region' | 'user'>('all');
  const [region, setRegion] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('announcement');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!title || !body) {
      alert('Title and body are required');
      return;
    }
    if (!confirm(`Send notification to ${audience === 'all' ? 'ALL users' : audience === 'region' ? `users in ${region}` : userEmail}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, region, userEmail, title, body, type }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Send failed');
      const data = await res.json();
      alert(`Sent to ${data.count} users`);
      setTitle(''); setBody('');
      router.refresh();
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-semibold">Compose Notification</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
        <div className="flex gap-2">
          {(['all', 'region', 'user'] as const).map(a => (
            <button key={a} onClick={() => setAudience(a)}
              className={`px-3 py-1.5 rounded-lg text-sm ${audience === a ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {a === 'all' ? 'All Users' : a === 'region' ? 'By Region' : 'Single User'}
            </button>
          ))}
        </div>
      </div>

      {audience === 'region' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Region Code</label>
          <input value={region} onChange={e => setRegion(e.target.value)}
            placeholder="AU-QLD" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      )}

      {audience === 'user' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">User Email</label>
          <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="announcement">Announcement</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="reminder">Reminder</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" maxLength={100} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" maxLength={500} />
      </div>

      <button onClick={send} disabled={loading || !title || !body}
        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
    </div>
  );
}
