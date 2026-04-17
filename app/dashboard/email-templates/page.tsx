'use client';

import { useState } from 'react';
import { Mail, Edit, Eye } from 'lucide-react';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const defaultTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to CoHomed',
      category: 'onboarding',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'group-invite',
      name: 'Group Invitation',
      subject: 'You\'ve been invited to join a co-ownership group',
      category: 'invitations',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      subject: 'Upcoming payment due',
      category: 'payments',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'document-signed',
      name: 'Document Signed Notification',
      subject: 'Document has been signed',
      category: 'documents',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'payment-received',
      name: 'Payment Received',
      subject: 'Payment received confirmation',
      category: 'payments',
      lastUpdated: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
        <p className="text-slate-600 mt-1">Manage and customize email templates</p>
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {defaultTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-2">{template.subject}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Category: {template.category}</span>
                  <span>Updated: {new Date(template.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedTemplate.name} - Preview
                </h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Subject:</p>
                <p className="font-medium text-slate-900 mb-4">{selectedTemplate.subject}</p>
                <hr className="my-4" />
                <p className="text-sm text-slate-600 mb-2">Body:</p>
                <div className="text-slate-700 leading-relaxed">
                  <p>Dear Recipient,</p>
                  <p className="mt-4">[Email content would be displayed here]</p>
                  <p className="mt-4">Best regards,<br />The CoHomed Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
