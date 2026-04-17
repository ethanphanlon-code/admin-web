import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { audience, region, userEmail, title, body, type } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    let targetUsers: { id: string }[] = [];

    if (audience === 'all') {
      const { data } = await auth.admin.from('profiles').select('id');
      targetUsers = data || [];
    } else if (audience === 'region') {
      if (!region) return NextResponse.json({ error: 'Region is required' }, { status: 400 });
      const { data } = await auth.admin.from('profiles').select('id').eq('region', region);
      targetUsers = data || [];
    } else if (audience === 'user') {
      if (!userEmail) return NextResponse.json({ error: 'User email is required' }, { status: 400 });
      const { data } = await auth.admin.from('profiles').select('id').eq('email', userEmail);
      targetUsers = data || [];
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'No users matched the audience' }, { status: 400 });
    }

    const notifications = targetUsers.map(u => ({
      user_id: u.id,
      type,
      title,
      body,
      data: { sent_by_admin: auth.user.id, audience },
    }));

    const { error } = await auth.admin.from('notifications').insert(notifications);
    if (error) throw error;

    return NextResponse.json({ success: true, count: targetUsers.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
