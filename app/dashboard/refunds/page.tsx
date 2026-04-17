'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setRefunds(
          refunds.map((r) =>
            r.id === refundId ? { ...r, status: 'processing' } : r
          )
        );
      }
    } catch (error: unknown) {
      console.error('Failed to approve refund:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Refunds</h1>
        <p className="text-slate-600 mt-1">Manage payment refunds and reversals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Pending Approval</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Processing</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {refunds.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No refunds to display</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Payment ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Reason</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                    No refunds found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Refunds require approval and are processed within 2-5 business days depending on the payment method.
        </p>
      </div>
    </div>
  );
}
