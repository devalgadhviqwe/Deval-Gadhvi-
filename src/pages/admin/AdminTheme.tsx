import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { ThemeSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

import defaultClinicData from '../../../data/clinic_data.json';

export const AdminTheme: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { theme: clinicTheme } = useClinic();

  const getInitialTheme = (): ThemeSettings => {
    try {
      const stored = localStorage.getItem('nma_custom_theme');
      if (stored) return JSON.parse(stored);
    } catch {}
    if (clinicTheme) return clinicTheme;
    return (defaultClinicData.themeSettings as any) || {
      primaryColor: '#4380FF',
      secondaryColor: '#0284c7',
      accentColor: '#0d9488',
      backgroundColor: '#f8fafc',
      fontFamily: 'Plus Jakarta Sans',
      borderRadius: '0.5rem'
    };
  };

  const [theme, setTheme] = useState<ThemeSettings>(getInitialTheme);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/admin/theme', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setTheme(data);
          try {
            localStorage.setItem('nma_custom_theme', JSON.stringify(data));
          } catch {}
        }
      }
    } catch {
      // Fallback already initialized
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasRole(['super_admin'])) {
      alert('Only Super Administrators can adjust global theme tokens.');
      return;
    }

    try {
      setSaving(true);
      try {
        await fetch('/api/admin/theme', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(theme)
        });
      } catch (err) {
        console.warn('Backend unavailable, saving locally:', err);
      }

      try {
        localStorage.setItem('nma_custom_theme', JSON.stringify(theme));
      } catch {}

      // Apply theme CSS variables to page
      const root = document.documentElement;
      if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor);
      if (theme.secondaryColor) root.style.setProperty('--secondary', theme.secondaryColor);
      if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
      if (theme.backgroundColor) root.style.setProperty('--background', theme.backgroundColor);
      if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultTheme = {
      primaryColor: '#4380FF',
      secondaryColor: '#0284c7',
      accentColor: '#0d9488',
      backgroundColor: '#f8fafc',
      fontFamily: 'Plus Jakarta Sans',
      borderRadius: '0.5rem'
    };
    setTheme(defaultTheme);
    try {
      localStorage.setItem('nma_custom_theme', JSON.stringify(defaultTheme));
    } catch {}
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading theme tokens...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Design System &amp; Tokens
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Theme &amp; Visual Styling
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure primary brand colors, typography pairings, and corner radius presets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {hasRole(['super_admin']) && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Applying...' : saved ? 'Applied!' : 'Save & Apply'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Color Palette Configuration
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Primary Brand Color (Navigation &amp; Primary Buttons)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="w-32 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Secondary Healthcare Accent Color (Badges &amp; Highlights)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="w-32 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Background Canvas Tint
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                className="w-32 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Border Radius Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Subtle (0.375rem)', val: '0.375rem' },
                { label: 'Medium (0.5rem)', val: '0.5rem' },
                { label: 'Rounded (0.75rem)', val: '0.75rem' }
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setTheme({ ...theme, borderRadius: r.val })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                    theme.borderRadius === r.val
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Live Token Preview */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Live Preview
          </span>

          <div
            className="p-6 rounded-xl border border-slate-200 space-y-4"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius }}
              >
                NMA
              </div>
              <span className="font-bold text-sm text-slate-900">Newark Medical Associates</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Experience compassionate clinical healthcare focused on early detection, wellness, and patient comfort.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold text-white shadow-2xs"
                style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius }}
              >
                Contact Us
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold text-white"
                style={{ backgroundColor: theme.secondaryColor, borderRadius: theme.borderRadius }}
              >
                Our Providers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
