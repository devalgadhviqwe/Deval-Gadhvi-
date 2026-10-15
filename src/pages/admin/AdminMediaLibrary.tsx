import React, { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
  Tag,
  ExternalLink
} from 'lucide-react';
import { MediaAsset } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

export const AdminMediaLibrary: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { doctors, services, sections } = useClinic();

  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory === 'all' ? 'general' : selectedCategory);
      formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (res.ok) {
        await fetchMedia();
      } else {
        const data = await res.json().catch(() => null);
        const errorMsg = data?.error || 'File upload failed. Please ensure the file is a valid image under 25MB.';
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyUrl = (item: MediaAsset) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (item: MediaAsset) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Admin can delete assets.');
      return;
    }

    // Check if image is used by any doctor, service, or section
    const usedInDoctor = doctors.find((d) => d.imageUrl === item.url);
    const usedInService = services.find((s) => s.imageUrl === item.url);
    const usedInSection = sections.find((s) => s.imageUrl === item.url);

    if (usedInDoctor || usedInService || usedInSection) {
      const location = usedInDoctor ? `doctor profile "${usedInDoctor.name}"` : usedInService ? `service "${usedInService.name}"` : 'homepage section';
      if (!window.confirm(`Warning: This image is currently assigned to ${location}. Deleting it may break public display. Proceed anyway?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to permanently delete "${item.filename}"?`)) {
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchMedia();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getUsageLabel = (url: string) => {
    const doc = doctors.find((d) => d.imageUrl === url);
    if (doc) return `Doctor: ${doc.name}`;
    const srv = services.find((s) => s.imageUrl === url);
    if (srv) return `Service: ${srv.name}`;
    const sec = sections.find((s) => s.imageUrl === url);
    if (sec) return `Section: ${sec.sectionKey}`;
    return null;
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Persistent Object Storage
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Media Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload, inspect, replace, and audit images across all doctor profiles, services, and homepage sections.
          </p>
        </div>

        {hasRole(['super_admin', 'editor']) && (
          <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer shadow-2xs transition-colors shrink-0">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center ${
          dragActive
            ? 'border-blue-900 bg-blue-50/70'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-slate-900">
          Drag and drop images here, or browse from your device
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Supports JPEG, PNG, WebP, and SVG up to 10MB each
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name or alt text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'doctors', 'hero', 'clinic', 'services', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((item) => {
          const usage = getUsageLabel(item.url);
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  {usage && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-900/90 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                      {usage}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="font-bold text-xs text-slate-900 block truncate" title={item.filename}>
                    {item.filename}
                  </span>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                    <span className="capitalize text-slate-400">{item.category}</span>
                  </div>
                  {item.alt && (
                    <p className="text-[11px] text-slate-600 truncate" title={item.alt}>
                      Alt: {item.alt}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-900 flex items-center gap-1"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                </button>

                {hasRole(['super_admin']) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete media asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
