'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function UserActions({ userId, currentRole, callerRole }: {
  userId: string; currentRole: string; callerRole: string;
}) {
  const router = useRouter();
  const [newRole, setNewRole] = useState(currentRole);
  const [stage, setStage] = useState(4);
  const [loading, setLoading] = useState('');

  const isGlobal = callerRole === 'global_admin';

  const handleRoleChange = async () => {
    if (newRole === currentRole) return;
    if (!confirm(`Change role to ${newRole}?`)) return;
    setLoading('role');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('profiles').update({ app_role: newRole }).eq('id', userId);
      if (error) throw error;
      router.refresh();
      alert('Role updated.');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(''); }
  };

  const handleSetProgress = async () => {
    if (!confirm(`Reset this user to stage ${stage}? This will DELETE their data and replace it with demo data.`)) return;
    setLoading('progress');
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('admin_set_progress', {
        p_user_id: userId, p_progress_stage: stage,
      });
      if (error) throw error;
      router.refresh();
      alert('Progress set: ' + ((data as any)?.description || 'success'));
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(''); }
  };

  const handleDelete = async () => {
    if (!confirm('DELETE this user? This is permanent. Type DELETE to confirm.')) return;
    if (prompt('Type DELETE to confirm:') !== 'DELETE') return;
    setLoading('delete');
    try {
      const res = await fetch('/api/users/' + userId, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
      alert('User deleted.');
      router.push('/dashboard/users');
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setLoading(''); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <h3 className="font-semibold text-slate-900">Admin Actions</h3>

      {/* Role change */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
        <div className="flex gap-2">
          <select value={newRole} onChange={e => setNewRole(e.target.value)}
            disabled={!isGlobal}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50">
            <option value="standard_user">Standard User</option>
            <option value="regional_admin">Regional Admin</option>
            <option value="global_admin">Global Admin</option>
          </select>
          <button onClick={handleRoleChange} disabled={!isGlobal || newRole === currentRole || loading === 'role'}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading === 'role' ? '...' : 'Update'}
          </button>
        </div>
        {!isGlobal && <p className="text-xs text-slate-400 mt-1">Only global admins can change roles.</p>}
      </div>

      {/* Set Progress */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Set Demo Progress</label>
        <div className="flex gap-2">
          <select value={stage} onChange={e => setStage(parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value={0}>0. New User (wipe)</option>
            <option value={1}>1. Group Formed</option>
            <option value={2}>2. Documents Signed</option>
            <option value={3}>3. Mortgage Approved</option>
            <option value={4}>4. House Purchased</option>
            <option value={5}>5. Established (10 years)</option>
          </select>
          <button onClick={handleSetProgress} disabled={loading === 'progress'}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading === 'progress' ? '...' : 'Reset & Seed'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">⚠️ This deletes the user's current data and replaces it with demo data.</p>
      </div>

      {/* Danger zone */}
      {isGlobal && (
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-sm font-medium text-red-700 mb-2">Danger Zone</label>
          <button onClick={handleDelete} disabled={loading === 'delete'}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading === 'delete' ? '...' : 'Delete User'}
          </button>
          <p className="text-xs text-slate-400 mt-1">Permanently removes the auth user and all their data.</p>
        </div>
      )}
    </div>
  );
}
