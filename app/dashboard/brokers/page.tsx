'use client';

import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Brokers</h1>
        <p className="text-slate-600 mt-1">Manage broker accounts and partnerships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Total Brokers</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-slate-500">Active partnerships</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Total Referrals</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-slate-500">This month</p>
        </div>
      </div>

      {/* Brokers List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Broker Accounts</h2>
          <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
            Add Broker
          </button>
        </div>

        {brokers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No brokers registered</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Referrals</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Earnings</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                    No brokers found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
