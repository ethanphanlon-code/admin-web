import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

/**
 * GET /api/admin/db-performance
 * Get database performance statistics
 */
export async function GET(request: NextRequest) {
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

    // Query database statistics (requires pg_stat_statements extension enabled)
    // This is a placeholder - actual implementation depends on your database setup
    const stats = {
      avgQueryTime: 0,
      slowQueriesCount: 0,
      activeConnections: 0,
      topQueries: [],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('DB performance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
