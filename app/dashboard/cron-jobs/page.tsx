'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { CronJobRepository, CronJobStatus, CronJob, STANDARD_CRON_JOBS } from '@/lib/cron';

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>(STANDARD_CRON_JOBS);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();
  const repository = new CronJobRepository(supabase);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await repository.getAllJobs();
      if (data && data.length > 0) {
        setJobs(data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch cron jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async (jobId: string) => {
    setRunning(jobId);
    try {
      const response = await fetch(`/api/cron/${jobId}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchJobs();
      }
    } catch (error: unknown) {
      console.error('Failed to run job:', error);
    } finally {
      setRunning(null);
    }
  };

  const handleToggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await repository.toggleJob(jobId, !enabled);
      await fetchJobs();
    } catch (error: unknown) {
      console.error('Failed to toggle job:', error);
    }
  };

  const getStatusIcon = (status: CronJobStatus) => {
    switch (status) {
      case CronJobStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case CronJobStatus.FAILED:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case CronJobStatus.RUNNING:
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CronJobStatus) => {
    switch (status) {
      case CronJobStatus.SUCCESS:
        return 'bg-green-100 text-green-800';
      case CronJobStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case CronJobStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cron Jobs</h1>
        <p className="text-slate-600 mt-1">Manage automated background tasks</p>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          Loading cron jobs...
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{job.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{job.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.last_status)}
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(job.last_status)}`}>
                    {job.last_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase">Schedule</div>
                  <div className="text-sm font-mono text-slate-700 mt-1">{job.schedule}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase">Last Run</div>
                  <div className="text-sm text-slate-700 mt-1">
                    {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase">Next Run</div>
                  <div className="text-sm text-slate-700 mt-1">
                    {job.next_run ? new Date(job.next_run).toLocaleString() : 'Pending'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase">Status</div>
                  <div className="text-sm text-slate-700 mt-1">
                    {job.is_enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRunJob(job.id)}
                  disabled={running === job.id || !job.is_enabled}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <Play className="w-4 h-4" />
                  Run Now
                </button>
                <button
                  onClick={() => handleToggleJob(job.id, job.is_enabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    job.is_enabled
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {job.is_enabled ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Enable
                    </>
                  )}
                </button>
                <a
                  href={`/dashboard/cron-jobs/${job.id}/logs`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  View Logs
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
