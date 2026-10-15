import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  Calendar
} from 'lucide-react';
import { ContactSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';

import defaultClinicData from '../../../data/clinic_data.json';

export const AdminInquiries: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();

  const getInitialInquiries = (): ContactSubmission[] => {
    try {
      const stored = localStorage.getItem('nma_contact_submissions');
      if (stored) return JSON.parse(stored);
    } catch {}
    return (defaultClinicData.contactSubmissions as any[]) || [];
  };

  const [inquiries, setInquiries] = useState<ContactSubmission[]>(getInitialInquiries);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setInquiries(data);
          try {
            localStorage.setItem('nma_contact_submissions', JSON.stringify(data));
          } catch {}
        }
      }
    } catch {
      // Fallback already initialized
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'in_progress' | 'resolved', notes?: string) => {
    if (!hasRole(['super_admin', 'editor'])) return;

    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus, adminNotes: notes })
      });
    } catch (err) {
      console.warn('Backend unavailable, updating locally:', err);
    }

    setInquiries((prev) => {
      const updated = prev.map((inq) =>
        inq.id === id ? { ...inq, status: newStatus, adminNotes: notes ?? inq.adminNotes } : inq
      );
      try {
        localStorage.setItem('nma_contact_submissions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeInquiry && activeInquiry.id === id) {
      setActiveInquiry({ ...activeInquiry, status: newStatus, adminNotes: notes ?? activeInquiry.adminNotes });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Admin can delete inquiry records.');
      return;
    }

    if (!window.confirm(`Permanently delete inquiry from "${name}"?`)) return;

    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.warn('Backend unavailable, deleting locally:', err);
    }

    setInquiries((prev) => {
      const updated = prev.filter((inq) => inq.id !== id);
      try {
        localStorage.setItem('nma_contact_submissions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activeInquiry?.id === id) setActiveInquiry(null);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Preferred Date', 'Service Requested', 'Doctor Requested', 'Status', 'Submitted At', 'Message'];
    const rows = inquiries.map((inq) => [
      inq.id,
      `"${(inq.fullName || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${inq.preferredDate || ''}"`,
      `"${inq.serviceRequested || ''}"`,
      `"${inq.doctorRequested || ''}"`,
      `"${inq.status}"`,
      `"${inq.submittedAt}"`,
      `"${(inq.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newark_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone.includes(searchTerm) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Patient Communication
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Contact Inquiries &amp; Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming patient requests, assign follow-up status, and maintain secure records.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'new', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Inquiries Table */}
        <div className={`${activeInquiry ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">Loading records...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">No matching inquiries found.</td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setActiveInquiry(item)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                        activeInquiry?.id === item.id ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.fullName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-600">{item.phone}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[140px]">{item.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {hasRole(['super_admin']) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.fullName)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Inquiry Detail View */}
        {activeInquiry && (
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Inquiry Details</h3>
              <button
                onClick={() => setActiveInquiry(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Patient Name:</span>
                <span className="text-sm font-bold text-slate-900">{activeInquiry.fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-semibold">Phone:</span>
                  <a href={`tel:${activeInquiry.phone.replace(/[^0-9]/g, '')}`} className="font-bold text-blue-900 hover:underline">
                    {activeInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Email:</span>
                  <a href={`mailto:${activeInquiry.email}`} className="font-bold text-blue-900 hover:underline break-all">
                    {activeInquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Submission Date:</span>
                <span className="text-slate-700">{new Date(activeInquiry.submittedAt).toLocaleString()}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">Message Content:</span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeInquiry.message}
                </p>
              </div>

              {/* Status Updater */}
              <div className="pt-2">
                <span className="text-slate-700 font-bold block mb-2">Update Follow-up Status:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeInquiry.id, 'new')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      activeInquiry.status === 'new'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeInquiry.id, 'in_progress')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      activeInquiry.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeInquiry.id, 'resolved')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      activeInquiry.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
