import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.profile.app_role !== 'global_admin') {
    return NextResponse.json({ error: 'Global admin required' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Cascade delete everything tied to the group (order matters for FKs)
    const a = auth.admin;
    await a.from('document_emails').delete().in('document_id',
      (await a.from('documents').select('id').eq('group_id', id)).data?.map(d => d.id) || []);
    await a.from('document_signatures').delete().in('document_id',
      (await a.from('documents').select('id').eq('group_id', id)).data?.map(d => d.id) || []);
    await a.from('documents').delete().eq('group_id', id);
    await a.from('revenue_ledger').delete().eq('group_id', id);
    await a.from('expense_votes').delete().in('expense_id',
      (await a.from('expenses').select('id').eq('group_id', id)).data?.map(e => e.id) || []);
    await a.from('payments').delete().eq('group_id', id);
    await a.from('expense_splits').delete().in('expense_id',
      (await a.from('expenses').select('id').eq('group_id', id)).data?.map(e => e.id) || []);
    await a.from('expenses').delete().eq('group_id', id);
    await a.from('notifications').delete().eq('group_id', id);
    await a.from('audit_log').delete().eq('group_id', id);
    await a.from('broker_referrals').delete().eq('group_id', id);
    await a.from('broker_reviews').delete().eq('group_id', id);
    await a.from('voucher_redemptions').delete().eq('group_id', id);
    await a.from('group_payments').delete().eq('group_id', id);
    await a.from('group_invites').delete().eq('group_id', id);
    await a.from('group_members').delete().eq('group_id', id);
    await a.from('groups').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
