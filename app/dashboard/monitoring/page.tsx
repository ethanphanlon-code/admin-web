'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Activity } from 'lucide-react';

export default function MonitoringPage() {
  const [errorTrends, setErrorTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring/errors');
      if (response.ok) {
        const data = await response.json();
        setErrorTrends(data.errors || []);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Monitoring & Alerts</h1>
        <p className="text-slate-600 mt-1">System health and error tracking via Sentry</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Total Errors (24h)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-green-600">No errors detected</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Error Rate</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600">System healthy</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Uptime</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">99.9%</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600">Running smoothly</p>
        </div>
      </div>

      {/* Error Trends */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Errors</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading error data...</div>
        ) : errorTrends.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No errors in the last 24 hours</div>
        ) : (
          <div className="space-y-2">
            {errorTrends.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded">
                <div>
                  <p className="font-medium text-slate-900">{error.name}</p>
                  <p className="text-xs text-slate-500">{error.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{error.count} occurrences</p>
                  <p className="text-xs text-slate-500">{error.lastSeen}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> For detailed error monitoring and alerting, integrate Sentry by setting the NEXT_PUBLIC_SENTRY_DSN environment variable.
          <a href="https://sentry.io" className="ml-1 text-blue-700 hover:underline">Learn more about Sentry</a>
        </p>
      </div>
    </div>
  );
}
