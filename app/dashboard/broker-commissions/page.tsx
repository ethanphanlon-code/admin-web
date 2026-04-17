'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function BrokerCommissionsPage() {
  const [brokers, setBrokers] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Broker Commissions</h1>
        <p className="text-slate-600 mt-1">Manage broker payouts and commission tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Total Commissions (YTD)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">$0</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-slate-500">Year to date</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Pending Payouts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">$0</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-slate-500">Awaiting processing</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Active Brokers</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-slate-500">With commissions</p>
        </div>
      </div>

      {/* Brokers List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Broker</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Commission Rate</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">YTD Earnings</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Last Payout</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                  No brokers found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
          Process Payouts
        </button>
        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">
          Download Report
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Commission Processing:</strong> Commissions are calculated based on completed transactions and processed monthly. Brokers receive payouts within 5-7 business days.
        </p>
      </div>
    </div>
  );
}
