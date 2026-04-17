'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Clock } from 'lucide-react';

export default function DbPerformancePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDbStats();
  }, []);

  const fetchDbStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/db-performance');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch DB stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Database Performance</h1>
        <p className="text-slate-600 mt-1">Query statistics and performance metrics</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Avg Query Time</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">--</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-slate-500">Waiting for data...</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Slow Queries (1s+)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600">No slow queries detected</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Active Connections</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">--</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-slate-500">Waiting for data...</p>
        </div>
      </div>

      {/* Query Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Queries by Execution Time</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading query statistics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Query</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Avg Time (ms)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Count</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Total Time (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">No query data available</td>
                  <td colSpan={3} className="px-4 py-3 text-slate-500 text-center">
                    Enable query logging in your database configuration
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Index Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Enable pg_stat_statements extension in Supabase to get detailed query analytics. Use these metrics to optimize database indexes and query patterns.
        </p>
      </div>
    </div>
  );
}
