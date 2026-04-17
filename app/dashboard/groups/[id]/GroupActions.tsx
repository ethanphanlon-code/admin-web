'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function GroupActions({ groupId, currentStatus, isPaid }: {
  groupId: string; currentStatus: string; isPaid: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState('');

  const handleStatusChange = async () => {
    if (status === currentStatus) return;
    if (!confirm(`Change group status to "${status}"?`)) return;
    setLoading('status');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('groups').update({ status }).eq('id', groupId);
      if (error) throw error;
      router.refresh();
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(''); }
  };

  const togglePaid = async () => {
    if (!confirm(`${isPaid ? 'Remove paid status from' : 'Mark as paid'} this group?`)) return;
    setLoading('paid');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('groups').update({ is_paid: !isPaid }).eq('id', groupId);
      if (error) throw error;
      router.refresh();
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(''); }
  };

  const handleDelete = async () => {
    if (!confirm('DELETE this group? All members, documents, expenses, and payments will be removed.')) return;
    if (prompt('Type DELETE to confirm:') !== 'DELETE') return;
    setLoading('delete');
    try {
      const res = await fetch('/api/groups/' + groupId, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      router.push('/dashboard/groups');
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(''); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <h3 className="font-semibold">Admin Actions</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Group Status</label>
        <div className="flex gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="forming">Forming</option>
            <option value="active">Active</option>
            <option value="settled">Settled</option>
            <option value="dissolved">Dissolved</option>
          </select>
          <button onClick={handleStatusChange} disabled={status === currentStatus || loading === 'status'}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading === 'status' ? '...' : 'Update'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
        <button onClick={togglePaid} disabled={loading === 'paid'}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            isPaid ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}>
          {loading === 'paid' ? '...' : isPaid ? 'Remove Paid Status' : 'Mark as Paid (Comp)'}
        </button>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <label className="block text-sm font-medium text-red-700 mb-2">Danger Zone</label>
        <button onClick={handleDelete} disabled={loading === 'delete'}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {loading === 'delete' ? '...' : 'Delete Group'}
        </button>
      </div>
    </div>
  );
}
