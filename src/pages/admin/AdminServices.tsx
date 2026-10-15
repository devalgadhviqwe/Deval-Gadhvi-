import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Service, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export const AdminServices: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { services: clinicServices, doctors, refreshData, setCustomImage } = useClinic();

  const [services, setServices] = useState<Service[]>(clinicServices);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (clinicServices.length > 0) {
      setServices(clinicServices);
    }
  }, [clinicServices]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setServices(data);
          return;
        }
      }
      setServices(clinicServices);
    } catch {
      setServices(clinicServices);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService({
      id: '',
      slug: '',
      name: '',
      shortDesc: '',
      fullDesc: '',
      features: ['Detailed consultation', 'Specialist follow-up', 'Custom care plan'],
      treatments: ['Evaluation', 'Monitoring'],
      doctorId: doctors[0]?.id || '',
      iconName: 'Stethoscope',
      imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
      displayOrder: services.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService({ ...srv });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const isNew = !editingService.id;
      const srvId = editingService.id || `srv-${Date.now()}`;
      const savedSrv = { ...editingService, id: srvId };
      const url = isNew ? '/api/admin/services' : `/api/admin/services/${srvId}`;
      const method = isNew ? 'POST' : 'PUT';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(savedSrv)
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

      if (savedSrv.id && savedSrv.imageUrl) {
        await setCustomImage('service', savedSrv.id, savedSrv.imageUrl);
      }
      setServices((prev) => {
        const exists = prev.some((s) => s.id === savedSrv.id);
        if (exists) {
          return prev.map((s) => (s.id === savedSrv.id ? savedSrv : s));
        }
        return [...prev, savedSrv];
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Admin can delete services.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchServices();
        await refreshData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Clinical Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Medical Services Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure primary, urgent, preventative, cardiology, and therapy services with full dynamic routing.
          </p>
        </div>

        {hasRole(['super_admin', 'editor']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Services Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => {
          const doc = doctors.find((d) => d.id === srv.doctorId);
          return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{srv.name}</h3>
                    <div className="text-[11px] text-slate-500">
                      URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-950">/services/{srv.slug}</code>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {srv.active ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {srv.shortDesc}
                </p>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-medium text-slate-700">Attending Doctor:</span>
                  <span>{doc ? doc.name : 'General Clinic Staff'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/services/${srv.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  {hasRole(['super_admin', 'editor']) && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {hasRole(['super_admin']) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(srv.id, srv.name)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Service Modal */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingService.id ? `Edit ${editingService.name}` : 'Create New Service'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.slug}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    placeholder="e.g. primary-urgent-care"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Doctor
                  </label>
                  <select
                    value={editingService.doctorId || ''}
                    onChange={(e) => setEditingService({ ...editingService, doctorId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  >
                    <option value="">None / All Clinicians</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingService.displayOrder}
                    onChange={(e) => setEditingService({ ...editingService, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Summary / Card Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingService.shortDesc}
                  onChange={(e) => setEditingService({ ...editingService, shortDesc: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Detailed Clinical Scope
                </label>
                <textarea
                  rows={4}
                  value={editingService.fullDesc}
                  onChange={(e) => setEditingService({ ...editingService, fullDesc: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              {/* Service Image */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img
                      src={editingService.imageUrl}
                      alt={editingService.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Header Image</span>
                    <span className="text-slate-500 block truncate max-w-xs">{editingService.imageUrl}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg shadow-2xs"
                >
                  Change Image
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingService.features.join(', ')}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conditions Evaluated &amp; Treatments (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingService.treatments.join(', ')}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      treatments: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-2xs"
                >
                  {saving ? 'Saving...' : 'Save & Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        categoryFilter="services"
        onSelect={(url) => {
          if (editingService) {
            setEditingService({ ...editingService, imageUrl: url });
          }
        }}
      />
    </div>
  );
};
