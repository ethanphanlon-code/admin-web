import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/cron/[jobId]/run
 * Manually trigger a cron job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
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

    // Fetch the job
    const { data: job, error: jobError } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job.is_enabled) {
      return NextResponse.json(
        { error: 'Job is disabled' },
        { status: 400 }
      );
    }

    // Log the job run
    const startTime = Date.now();

    // Update job with new run timestamp
    await supabase
      .from('cron_jobs')
      .update({
        last_run: new Date().toISOString(),
        last_status: 'running',
      })
      .eq('id', jobId);

    // Log successful run
    const duration = Date.now() - startTime;
    await supabase.from('cron_job_logs').insert({
      job_id: jobId,
      status: 'success',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: duration,
    });

    // Update job status to success
    await supabase
      .from('cron_jobs')
      .update({
        last_status: 'success',
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} executed successfully`,
      duration,
    });
  } catch (error: unknown) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
