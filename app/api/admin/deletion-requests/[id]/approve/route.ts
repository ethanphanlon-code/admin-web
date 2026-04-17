import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/admin/deletion-requests/[id]/approve
 * Approve a user deletion request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('app_role')
      .eq('id', user.id)
      .single();

    if (profile?.app_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestId = id;

    // Update deletion request status
    const { error } = await supabase
      .from('deletion_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', requestId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Deletion request approved',
    });
  } catch (error) {
    console.error('Approve deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
