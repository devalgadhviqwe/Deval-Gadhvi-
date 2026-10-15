import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Eye,
  Plus
} from 'lucide-react';
import { GlobalSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export const AdminSettings: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { refreshData } = useClinic();

  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Logo upload & picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'logoUrl' | 'logoDarkUrl'>('logoUrl');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'logoDarkUrl') => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    if (!hasRole(['super_admin', 'editor'])) {
      alert('Only administrators or editors can upload logo assets.');
      return;
    }

    try {
      setUploadingLogo(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'general');
      formData.append('alt', `${settings.practiceName || 'Practice'} Logo`);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to upload logo file');
      }

      const asset = await res.json();
      setSettings((prev) => prev ? { ...prev, [field]: asset.url } : prev);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleResetLogo = (field: 'logoUrl' | 'logoDarkUrl') => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: ''
    });
  };

  const openPicker = (target: 'logoUrl' | 'logoDarkUrl') => {
    setPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!hasRole(['super_admin'])) {
      alert('Only Super Administrators can modify global practice configuration.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccess(false);

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Global Clinic Identity
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Practice Configuration &amp; Contact
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Updating these settings propagates across the entire website, headers, footers, and direct telephone links.
          </p>
        </div>

        {hasRole(['super_admin']) && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            {success ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : success ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Practice information successfully updated and published to the live website.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Website Logo & Visual Identity */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Website Logo &amp; Brand Identity
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the visual emblem and practice logo displayed across the website header, navigation, and footer.
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit ${
                settings.logoUrl
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {settings.logoUrl ? 'Custom Logo Active' : 'Default Medical Plus Emblem Active'}
            </span>
          </div>

          {/* Hidden File Inputs for Logo Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleDirectLogoUpload(e, 'logoUrl')}
            className="hidden"
          />
          <input
            ref={darkFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleDirectLogoUpload(e, 'logoDarkUrl')}
            className="hidden"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Primary Website Logo (Header & Navigation) */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Primary Logo (Header &amp; Nav)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Light Backgrounds</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  This logo appears in the top navigation bar. Transparent PNG, SVG, or high-res WebP works best.
                </p>

                {/* Live Preview Box */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center min-h-[90px] relative group overflow-hidden">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Practice Logo Preview"
                      className="max-h-12 max-w-[220px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#4380FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Plus className="w-5 h-5 stroke-[2.8]" />
                      </div>
                      <span className="text-base font-medium text-[#111111] tracking-tight">
                        {settings.practiceName || 'Newark Medical Associates'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openPicker('logoUrl')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Choose from Media</span>
                  </button>

                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleResetLogo('logoUrl')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Reset to default icon mark"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Direct Image URL / Path
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    placeholder="/uploads/my_logo.png or https://..."
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Secondary / Dark Mode Logo (Footer & Admin) */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Footer &amp; Dark Logo (Optional)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Dark Backgrounds</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Shown in the dark website footer &amp; CMS sidebar. Falls back to the primary logo if left empty.
                </p>

                {/* Dark Live Preview Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-2xs flex items-center justify-center min-h-[90px] relative group overflow-hidden">
                  {settings.logoDarkUrl || settings.logoUrl ? (
                    <img
                      src={settings.logoDarkUrl || settings.logoUrl}
                      alt="Footer Logo Preview"
                      className="max-h-12 max-w-[220px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-base font-serif shadow-xs">
                        NMA
                      </div>
                      <span className="text-base font-bold text-white tracking-tight">
                        {settings.practiceName || 'Newark Medical Associates'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => darkFileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Dark Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openPicker('logoDarkUrl')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Choose from Media</span>
                  </button>

                  {settings.logoDarkUrl && (
                    <button
                      type="button"
                      onClick={() => handleResetLogo('logoDarkUrl')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Clear dark logo override"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Direct Dark Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={settings.logoDarkUrl || ''}
                    placeholder="Optional: /uploads/my_dark_logo.png"
                    onChange={(e) => setSettings({ ...settings, logoDarkUrl: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Logo Preferences */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLogoText !== false}
                onChange={(e) => setSettings({ ...settings, showLogoText: e.target.checked })}
                className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-800"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Display practice name text alongside logo
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Uncheck this if your uploaded logo already contains the full practice name/typography.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Basic Practice Details */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Practice Name &amp; Tagline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Practice Legal Name</label>
              <input
                type="text"
                required
                value={settings.practiceName}
                onChange={(e) => setSettings({ ...settings, practiceName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Location */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Contact Details &amp; Physical Clinic
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Phone Number</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Email Address</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office &amp; Lab Working Hours</label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Direct URL</label>
              <input
                type="text"
                value={settings.googleMapsUrl}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Global CTAs & Notice */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Global Call-To-Action &amp; Medical Disclaimer
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button Label</label>
              <input
                type="text"
                value={settings.primaryCtaLabel}
                onChange={(e) => setSettings({ ...settings, primaryCtaLabel: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA URL Destination</label>
              <input
                type="text"
                value={settings.primaryCtaUrl}
                onChange={(e) => setSettings({ ...settings, primaryCtaUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Notice Banner Text</label>
              <textarea
                rows={2}
                value={settings.emergencyNotice}
                onChange={(e) => setSettings({ ...settings, emergencyNotice: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Practice Description</label>
              <textarea
                rows={3}
                value={settings.footerDescription}
                onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        </div>
      </form>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(selectedUrl) => {
          setSettings((prev) => prev ? { ...prev, [pickerTarget]: selectedUrl } : prev);
          setMediaPickerOpen(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }}
        currentImage={pickerTarget === 'logoDarkUrl' ? settings.logoDarkUrl : settings.logoUrl}
        categoryFilter="general"
      />
    </div>
  );
};
