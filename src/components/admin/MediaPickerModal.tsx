import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Image as ImageIcon, Search } from 'lucide-react';
import { MediaAsset } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, altText?: string) => void;
  currentImage?: string;
  categoryFilter?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  categoryFilter
}) => {
  const { getAuthHeaders } = useAuth();
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImage || '');
  const [selectedAlt, setSelectedAlt] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentImage || '');
      fetchMedia();
    }
  }, [isOpen, currentImage]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', categoryFilter || 'general');
      formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (res.ok) {
        const newAsset = await res.json();
        setMediaList([newAsset, ...mediaList]);
        setSelectedUrl(newAsset.url);
        setSelectedAlt(newAsset.alt);
      } else {
        const data = await res.json().catch(() => null);
        const errorMsg = data?.error || 'Image upload failed. Please ensure the file is a valid image under 25MB.';
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-lg text-slate-900">Select or Upload Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search media by filename or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading library media...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No images found matching your search. Upload an image above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedAlt(item.alt);
                    }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-4/3 group ${
                      isSelected
                        ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Overlay info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-2 text-white text-[11px] truncate">
                      <span className="font-medium truncate block">{item.filename}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 truncate max-w-sm">
            {selectedUrl ? `Selected: ${selectedUrl}` : 'No image selected'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl, selectedAlt);
                  onClose();
                }
              }}
              disabled={!selectedUrl}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-2xs transition-colors"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
