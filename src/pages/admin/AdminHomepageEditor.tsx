import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { SectionContent } from '../../types';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export const AdminHomepageEditor: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { sections: clinicSections, setCustomImage } = useClinic();
  const homeSections = clinicSections.filter((s) => s.pageSlug === 'home');

  const [sections, setSections] = useState<SectionContent[]>(homeSections);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Media picker modal state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (homeSections.length > 0) {
      setSections(homeSections);
    }
  }, [clinicSections]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sections?pageSlug=home', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setSections(data);
          return;
        }
      }
      setSections(homeSections);
    } catch {
      setSections(homeSections);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof SectionContent, value: any) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec))
    );
  };

  const handleSaveSection = async (section: SectionContent) => {
    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setSavingId(section.id);
      setErrorMsg(null);

      try {
        const res = await fetch(`/api/admin/sections/${section.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(section)
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await res.json();
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, saving locally:', err);
      }

      if (section.imageUrl) {
        await setCustomImage('section', section.id, section.imageUrl);
      }

      setSuccessId(section.id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving changes');
    } finally {
      setSavingId(null);
    }
  };

  const openMediaPicker = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (imageUrl: string) => {
    if (activeSectionId) {
      handleFieldChange(activeSectionId, 'imageUrl', imageUrl);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-slate-500">Loading homepage sections...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Visual Page Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Homepage Section Editor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage text, imagery, action buttons, and visibility for every homepage section without code edits.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((section) => {
          const isSaving = savingId === section.id;
          const isSuccess = successId === section.id;

          return (
            <div
              key={section.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-900 rounded-md">
                    {section.sectionKey}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {section.title || `${section.sectionKey.toUpperCase()} Section`}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldChange(section.id, 'isVisible', !section.isVisible)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      section.isVisible
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{section.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveSection(section)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-2xs transition-colors"
                  >
                    {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving...' : isSuccess ? 'Saved!' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Text Fields */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleFieldChange(section.id, 'title', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subheading / Lead Text
                    </label>
                    <textarea
                      rows={2}
                      value={section.subtitle || ''}
                      onChange={(e) => handleFieldChange(section.id, 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {section.sectionKey === 'hero' ? 'Appointment Indicator Label' : 'Extended Body Prose'}
                    </label>
                    {section.sectionKey === 'hero' ? (
                      <input
                        type="text"
                        placeholder="e.g. 1000+ Appointments"
                        value={section.bodyText || ''}
                        onChange={(e) => handleFieldChange(section.id, 'bodyText', e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                      />
                    ) : (
                      <textarea
                        rows={3}
                        value={section.bodyText || ''}
                        onChange={(e) => handleFieldChange(section.id, 'bodyText', e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                      />
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block uppercase">
                        Primary CTA Button
                      </span>
                      <input
                        type="text"
                        placeholder="Button Label"
                        value={section.primaryButtonLabel || ''}
                        onChange={(e) => handleFieldChange(section.id, 'primaryButtonLabel', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Link Destination (e.g. /contact)"
                        value={section.primaryButtonUrl || ''}
                        onChange={(e) => handleFieldChange(section.id, 'primaryButtonUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block uppercase">
                        Secondary CTA Button
                      </span>
                      <input
                        type="text"
                        placeholder="Button Label"
                        value={section.secondaryButtonLabel || ''}
                        onChange={(e) => handleFieldChange(section.id, 'secondaryButtonLabel', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Link Destination (e.g. /providers)"
                        value={section.secondaryButtonUrl || ''}
                        onChange={(e) => handleFieldChange(section.id, 'secondaryButtonUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Image Column */}
                <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Section Featured Image
                    </label>

                    {section.imageUrl ? (
                      <div className="relative rounded-lg overflow-hidden aspect-4/3 bg-slate-200 border border-slate-300 mb-3">
                        <img
                          src={section.imageUrl}
                          alt="Section image"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg aspect-4/3 bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 mb-3">
                        No image assigned
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openMediaPicker(section.id)}
                      className="w-full py-2 px-3 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{section.imageUrl ? 'Change Image' : 'Select Image'}</span>
                    </button>

                    {section.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange(section.id, 'imageUrl', '')}
                        className="w-full py-1.5 px-3 text-[11px] font-semibold text-slate-500 hover:text-red-700 transition-colors"
                      >
                        Remove Image Reference
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};
