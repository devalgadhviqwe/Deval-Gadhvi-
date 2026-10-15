import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Image as ImageIcon,
  Inbox,
  Activity,
  ArrowRight,
  Clock,
  Plus,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import defaultClinicData from '../../../data/clinic_data.json';

interface StatsData {
  totalDoctors: number;
  activeDoctors: number;
  totalServices: number;
  activeServices: number;
  totalDiagnostics: number;
  totalMedia: number;
  totalInquiries: number;
  unreadInquiries: number;
  recentInquiries: any[];
  recentAudits: any[];
}

export const AdminDashboard: React.FC = () => {
  const { user, getAuthHeaders } = useAuth();
  const { doctors, services, diagnostics } = useClinic();

  const getFallbackStats = (): StatsData => {
    let savedInquiries: any[] = defaultClinicData.contactSubmissions as any[];
    try {
      const stored = localStorage.getItem('nma_contact_submissions');
      if (stored) savedInquiries = JSON.parse(stored);
    } catch {}

    let savedAudits: any[] = defaultClinicData.auditLogs as any[];
    try {
      const stored = localStorage.getItem('nma_audit_logs');
      if (stored) savedAudits = JSON.parse(stored);
    } catch {}

    const docs = doctors.length > 0 ? doctors : (defaultClinicData.doctors as any[]);
    const srvs = services.length > 0 ? services : (defaultClinicData.services as any[]);
    const diags = diagnostics.length > 0 ? diagnostics : (defaultClinicData.diagnosticServices as any[]);

    return {
      totalDoctors: docs.length,
      activeDoctors: docs.filter((d) => d.active).length,
      totalServices: srvs.length,
      activeServices: srvs.filter((s) => s.active).length,
      totalDiagnostics: diags.length,
      totalMedia: 14,
      totalInquiries: savedInquiries.length,
      unreadInquiries: savedInquiries.filter((i) => i.status === 'new').length,
      recentInquiries: savedInquiries.slice(0, 5),
      recentAudits: savedAudits.slice(0, 5)
    };
  };

  const [stats, setStats] = useState<StatsData>(getFallbackStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setStats(data);
          return;
        }
      }
    } catch {
      // Fallback already loaded
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Newark Medical Associates Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Practice CMS active · Role: <span className="font-bold text-slate-700 capitalize">{user?.role?.replace('_', ' ')}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/images"
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Manage Images</span>
          </Link>
          <Link
            to="/admin/homepage"
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>Edit Content</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doctors Stat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Clinical Doctors</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : stats?.totalDoctors || 4}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{stats?.activeDoctors || 4} active</span> in directory
          </div>
        </div>

        {/* Services Stat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Medical Services</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : stats?.totalServices || 8}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{stats?.activeServices || 8} published</span> on website
          </div>
        </div>

        {/* Media Stat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Media Assets</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : stats?.totalMedia || 7}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Portraits, facility photos &amp; labs
          </div>
        </div>

        {/* Inquiries Stat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Patient Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : stats?.totalInquiries || 2}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {stats?.unreadInquiries || 0} unread / pending action
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Inquiries & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Inquiries */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">Recent Patient Inquiries</h2>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-bold text-blue-900 hover:text-blue-800"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading inquiries...</div>
            ) : !stats?.recentInquiries || stats.recentInquiries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No submissions recorded.</div>
            ) : (
              stats.recentInquiries.map((inq: any) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{inq.fullName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          inq.status === 'new'
                            ? 'bg-amber-100 text-amber-800'
                            : inq.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{inq.message}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>{inq.phone}</span>
                      <span>·</span>
                      <span>{inq.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(inq.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Activity / Audit Trail */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">Recent CMS Activity</h2>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-blue-900 hover:text-blue-800"
            >
              Full Log &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading activity...</div>
            ) : !stats?.recentAudits || stats.recentAudits.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No logs yet.</div>
            ) : (
              stats.recentAudits.map((log: any) => (
                <div key={log.id} className="text-xs space-y-0.5 pb-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{log.details}</p>
                  <div className="text-[10px] text-slate-400">by {log.userEmail}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
