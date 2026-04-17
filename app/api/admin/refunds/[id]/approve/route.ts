import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * POST /api/admin/refunds/[id]/approve
 * Approve a refund request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

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

    const refundId = params.id;

    // Update refund status
    const { error } = await supabase
      .from('refunds')
      .update({
        status: 'processing',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', refundId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Refund approved and will be processed',
    });
  } catch (error) {
    console.error('Approve refund error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
