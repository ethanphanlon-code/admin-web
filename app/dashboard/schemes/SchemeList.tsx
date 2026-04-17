'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function SchemeList({ schemes }: { schemes: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete scheme "${name}"?`)) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('region_schemes').delete().eq('id', id);
      if (error) throw error;
      router.refresh();
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Scheme</th>
            <th>Max Applicants</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schemes.length > 0 ? schemes.map((s: any) => (
            <tr key={s.id}>
              <td className="font-mono text-xs">{s.region_code}</td>
              <td>
                <div className="font-medium">{s.name}</div>
                {s.short_name && <div className="text-xs text-slate-500">{s.short_name}</div>}
              </td>
              <td>{s.max_applicants || '—'}</td>
              <td className="text-slate-600 text-xs max-w-md">{s.description}</td>
              <td>
                <div className="flex gap-2">
                  <Link href={`/dashboard/schemes/${s.id}`} className="text-brand-500 text-sm">Edit</Link>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 text-sm">Delete</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={5} className="text-center py-12 text-slate-400">No schemes configured</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
