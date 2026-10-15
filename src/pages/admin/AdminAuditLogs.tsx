import React, { useState, useEffect } from 'react';
import { FileText, Search, Clock, User, ShieldCheck, Activity } from 'lucide-react';
import { AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';

import defaultClinicData from '../../../data/clinic_data.json';

export const AdminAuditLogs: React.FC = () => {
  const { getAuthHeaders } = useAuth();

  const getInitialLogs = (): AuditLog[] => {
    try {
      const stored = localStorage.getItem('nma_audit_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return (defaultClinicData.auditLogs as any[]) || [];
  };

  const [logs, setLogs] = useState<AuditLog[]>(getInitialLogs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setLogs(data);
          try {
            localStorage.setItem('nma_audit_logs', JSON.stringify(data));
          } catch {}
        }
      }
    } catch {
      // Fallback already initialized
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
          Compliance &amp; Security
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Audit Activity Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable server-side logging of all clinical profile edits, content modifications, and administrative logins.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No activity logs recorded.</td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.userEmail}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
