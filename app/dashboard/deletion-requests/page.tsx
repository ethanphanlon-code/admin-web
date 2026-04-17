'use client';

import { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/deletion-requests/${requestId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setRequests(
          requests.map((req) =>
            req.id === requestId ? { ...req, status: 'approved' } : req
          )
        );
      }
    } catch (error: unknown) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/deletion-requests/${requestId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        setRequests(
          requests.map((req) =>
            req.id === requestId ? { ...req, status: 'rejected' } : req
          )
        );
      }
    } catch (error: unknown) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Deletion Requests</h1>
        <p className="text-slate-600 mt-1">Manage GDPR right-to-be-forgotten requests</p>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No deletion requests</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{request.user_email}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Requested {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Approve Deletion
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                    User account and associated data will be permanently deleted within 30 days.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Legal Notice:</strong> All deletion requests must be processed within 30 days per GDPR requirements. Approved deletions are irreversible.
        </p>
      </div>
    </div>
  );
}
