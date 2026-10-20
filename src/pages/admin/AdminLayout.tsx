import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  Stethoscope,
  Activity,
  Image as ImageIcon,
  Inbox,
  Settings,
  Palette,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const { settings } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Website Images', path: '/admin/images', icon: ImageIcon },
    { label: 'Homepage Editor', path: '/admin/homepage', icon: Home },
    { label: 'Doctors Management', path: '/admin/doctors', icon: Users },
    { label: 'Services Management', path: '/admin/services', icon: Stethoscope },
    { label: 'Diagnostic Solutions', path: '/admin/diagnostics', icon: Activity },
    { label: 'Blog Articles', path: '/admin/blogs', icon: BookOpen },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'Patient Inquiries', path: '/admin/inquiries', icon: Inbox },
    { label: 'Practice Settings', path: '/admin/settings', icon: Settings },
    { label: 'Theme Settings', path: '/admin/theme', icon: Palette },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {settings?.logoDarkUrl || settings?.logoUrl ? (
            <img
              src={settings.logoDarkUrl || settings.logoUrl}
              alt="Logo"
              className="h-7 w-auto max-w-[120px] object-contain rounded bg-white/10 p-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              NMA
            </div>
          )}
          <span className="font-bold text-sm tracking-tight">Admin CMS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 md:z-auto w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Practice Branding */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              {settings?.logoDarkUrl || settings?.logoUrl ? (
                <img
                  src={settings.logoDarkUrl || settings.logoUrl}
                  alt="Logo"
                  className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  NMA
                </div>
              )}
              <div className="overflow-hidden">
                <span className="text-sm font-bold text-white block leading-tight truncate">
                  {settings?.practiceName || 'Newark Medical'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Clinical CMS Portal
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-semibold text-white block truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
                {user?.role?.replace('_', ' ') || 'Editor'}
              </span>
            </div>
            <Link
              to="/"
              target="_blank"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="View Public Site"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-red-950/80 hover:text-red-300 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="p-5 sm:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
