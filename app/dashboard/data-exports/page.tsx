'use client';

import { useState } from 'react';
import { Download, Check, Clock, AlertCircle } from 'lucide-react';

export default function DataExportsPage() {
  const [exports, setExports] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const resources = [
    { id: 'users', label: 'Users & Profiles', description: 'All user account data' },
    { id: 'groups', label: 'Groups & Members', description: 'All co-ownership groups' },
    { id: 'documents', label: 'Documents', description: 'All shared documents' },
    { id: 'payments', label: 'Payments', description: 'All payment records' },
    { id: 'expenses', label: 'Expenses', description: 'All expense entries' },
  ];

  const handleRequestExport = async () => {
    try {
      const response = await fetch('/api/admin/data-exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources: selectedResources,
          format: 'csv',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExports([data.export, ...exports]);
        setShowForm(false);
        setSelectedResources([]);
      }
    } catch (error: unknown) {
      console.error('Failed to request export:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Exports</h1>
        <p className="text-slate-600 mt-1">Request and manage data exports for compliance</p>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Request New Export</h2>

          <div className="space-y-4 mb-6">
            {resources.map((resource) => (
              <label key={resource.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(resource.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedResources([...selectedResources, resource.id]);
                    } else {
                      setSelectedResources(selectedResources.filter((r) => r !== resource.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{resource.label}</p>
                  <p className="text-sm text-slate-600">{resource.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRequestExport}
              disabled={selectedResources.length === 0}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Request Export
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
        >
          Request New Export
        </button>
      )}

      {/* Exports List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Exports</h2>
        </div>

        {exports.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No exports requested yet</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {exports.map((exp, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {exp.resources?.join(', ') || 'Export'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Requested {new Date(exp.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(exp.status)}
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(exp.status)}`}>
                      {exp.status}
                    </span>
                  </div>
                  {exp.status === 'completed' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Privacy:</strong> Data exports are encrypted and securely delivered. Access logs are maintained for compliance auditing.
        </p>
      </div>
    </div>
  );
}
