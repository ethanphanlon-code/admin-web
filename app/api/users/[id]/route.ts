import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.profile.app_role !== 'global_admin') {
    return NextResponse.json({ error: 'Global admin required' }, { status: 403 });
  }

  const { id } = await params;
  if (id === auth.user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  try {
    const { error } = await auth.admin.auth.admin.deleteUser(id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
