/**
 * Cron Jobs Management System
 * Centralized cron job definitions and utilities
 */

export enum CronJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  DISABLED = 'disabled',
}

export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  handler: string; // function name
  last_run: string | null;
  next_run: string | null;
  last_status: CronJobStatus;
  is_enabled: boolean;
  timeout_ms: number;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface CronJobLog {
  id: string;
  job_id: string;
  status: CronJobStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  result: Record<string, any> | null;
}

export interface CronJobRun {
  success: boolean;
  message: string;
  duration?: number;
  errors?: string[];
}

/**
 * Standard cron jobs for CoHomed
 */
export const STANDARD_CRON_JOBS: CronJob[] = [
  {
    id: 'archive-audit-logs',
    name: 'Archive Audit Logs',
    description: 'Archive audit logs older than 7 years for compliance',
    schedule: '0 2 1 * *', // 2 AM on first day of month
    handler: 'archiveAuditLogs',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 300000,
    retry_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cleanup-expired-sessions',
    name: 'Cleanup Expired Sessions',
    description: 'Remove expired authentication sessions',
    schedule: '0 3 * * *', // 3 AM daily
    handler: 'cleanupExpiredSessions',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 60000,
    retry_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'process-payment-retries',
    name: 'Process Payment Retries',
    description: 'Retry failed payments',
    schedule: '0 */6 * * *', // Every 6 hours
    handler: 'processPaymentRetries',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 600000,
    retry_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'generate-invoices',
    name: 'Generate Monthly Invoices',
    description: 'Generate invoices for co-ownership groups',
    schedule: '0 1 1 * *', // 1 AM on first day of month
    handler: 'generateMonthlyInvoices',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 900000,
    retry_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'send-pending-notifications',
    name: 'Send Pending Notifications',
    description: 'Send queued notifications to users',
    schedule: '*/5 * * * *', // Every 5 minutes
    handler: 'sendPendingNotifications',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 120000,
    retry_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'update-group-statistics',
    name: 'Update Group Statistics',
    description: 'Update cached statistics for all groups',
    schedule: '0 4 * * *', // 4 AM daily
    handler: 'updateGroupStatistics',
    last_run: null,
    next_run: null,
    last_status: CronJobStatus.PENDING,
    is_enabled: true,
    timeout_ms: 1800000,
    retry_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Cron Job Repository for managing cron jobs in database
 */
export class CronJobRepository {
  constructor(private supabase: any) {}

  async getAllJobs(): Promise<CronJob[]> {
    const { data, error } = await this.supabase
      .from('cron_jobs')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getJobById(id: string): Promise<CronJob> {
    const { data, error } = await this.supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateJobStatus(jobId: string, status: CronJobStatus, lastRun?: string): Promise<void> {
    const update: any = { last_status: status };
    if (lastRun) update.last_run = lastRun;

    const { error } = await this.supabase
      .from('cron_jobs')
      .update(update)
      .eq('id', jobId);

    if (error) throw error;
  }

  async logJobRun(jobId: string, log: Partial<CronJobLog>): Promise<void> {
    const { error } = await this.supabase
      .from('cron_job_logs')
      .insert({
        job_id: jobId,
        ...log,
      });

    if (error) throw error;
  }

  async getJobLogs(jobId: string, limit: number = 50): Promise<CronJobLog[]> {
    const { data, error } = await this.supabase
      .from('cron_job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async toggleJob(jobId: string, enabled: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('cron_jobs')
      .update({ is_enabled: enabled })
      .eq('id', jobId);

    if (error) throw error;
  }
}
