'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function RegionToggle({ code, field, initial }: { code: string; field: string; initial: boolean }) {
  const router = useRouter();
  const [val, setVal] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('region_config').update({ [field]: !val }).eq('region_code', code);
      if (error) throw error;
      setVal(!val);
      router.refresh();
    } catch (e: unknown) { alert('Error: ' + (e instanceof Error ? e.message : 'Unknown error')); }
    finally { setLoading(false); }
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${val ? 'bg-brand-500' : 'bg-slate-200'}`}>
      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${val ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}
