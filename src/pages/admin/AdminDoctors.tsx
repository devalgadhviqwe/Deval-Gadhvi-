import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  AlertCircle
} from 'lucide-react';
import { Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export const AdminDoctors: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { refreshData, setCustomImage } = useClinic();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Media picker modal for doctor image
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/doctors', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoctor({
      id: '',
      slug: '',
      name: '',
      title: '',
      qualifications: '',
      experienceYears: '10+ Years Experience',
      specialties: ['Primary Care', 'Internal Medicine'],
      education: '',
      hospitalAffiliations: '',
      bio: '',
      clinicLocation: '337 Bloomfield Avenue, Newark, NJ 07107',
      phone: '(973) 412-9404',
      email: 'medicalnewark@gmail.com',
      availability: 'Monday – Friday: 9:00 AM – 5:00 PM',
      imageUrl: '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
      displayOrder: doctors.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const isNew = !editingDoctor.id;
      const url = isNew ? '/api/admin/doctors' : `/api/admin/doctors/${editingDoctor.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editingDoctor)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save doctor');
      }

      if (editingDoctor.id && editingDoctor.imageUrl) {
        await setCustomImage('doctor', editingDoctor.id, editingDoctor.imageUrl);
      }
      setIsModalOpen(false);
      await fetchDoctors();
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving doctor profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Administrators can delete doctor records.');
      return;
    }

    if (!window.confirm(`Are you certain you want to permanently delete ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        await fetchDoctors();
        await refreshData();
      } else {
        alert('Failed to delete doctor');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    if (!hasRole(['super_admin', 'editor'])) return;
    try {
      const updated = { ...doctor, active: !doctor.active };
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        await fetchDoctors();
        await refreshData();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Clinical Team Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Doctors &amp; Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain provider directory profiles, biographies, qualifications, and photography.
          </p>
        </div>

        {hasRole(['super_admin', 'editor']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Provider</span>
          </button>
        )}
      </div>

      {/* Doctor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex gap-5 items-start">
              {/* Doctor Thumbnail */}
              <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Doctor Details */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doctor.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {doctor.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-900">{doctor.title}</div>
                <div className="text-[11px] text-slate-500">{doctor.qualifications}</div>
                <p className="text-xs text-slate-600 line-clamp-2 pt-1">{doctor.bio}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  URL slug: <code className="bg-slate-100 px-1 py-0.5 rounded">/providers/{doctor.slug}</code>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/providers/${doctor.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-500 hover:text-blue-900 inline-flex items-center gap-1"
              >
                <span>Preview Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(doctor)}
                  title={doctor.active ? 'Hide from public site' : 'Publish to public site'}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {doctor.active ? <Eye className="w-4 h-4 text-emerald-700" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>

                {hasRole(['super_admin', 'editor']) && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(doctor)}
                    className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Doctor Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {hasRole(['super_admin']) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(doctor.id, doctor.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Doctor Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Doctor Modal */}
      {isModalOpen && editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDoctor.id ? `Edit ${editingDoctor.name}` : 'Add New Doctor Profile'}
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
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.title}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, title: e.target.value })}
                    placeholder="e.g. Primary Care Physician"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical Qualifications
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.qualifications}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, qualifications: e.target.value })}
                    placeholder="e.g. MD, Board Certified Internal Medicine"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.experienceYears}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experienceYears: e.target.value })}
                    placeholder="e.g. 20+ Years Experience"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug (e.g. dr-prahlad-gadhavi)
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.slug}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, slug: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingDoctor.displayOrder}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              {/* Photo Selector */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img
                      src={editingDoctor.imageUrl}
                      alt={editingDoctor.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Doctor Portrait</span>
                    <span className="text-slate-500 block truncate max-w-xs">{editingDoctor.imageUrl}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg shadow-2xs"
                >
                  Change Photo
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingDoctor.specialties.join(', ')}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Biography
                </label>
                <textarea
                  rows={4}
                  value={editingDoctor.bio}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Education &amp; Training
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.education}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, education: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Affiliations
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.hospitalAffiliations}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, hospitalAffiliations: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
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
                  {saving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        categoryFilter="doctors"
        onSelect={(url) => {
          if (editingDoctor) {
            setEditingDoctor({ ...editingDoctor, imageUrl: url });
          }
        }}
      />
    </div>
  );
};
