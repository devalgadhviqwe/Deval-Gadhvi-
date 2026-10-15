import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Activity, Check, X, AlertCircle } from 'lucide-react';
import { DiagnosticService } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

export const AdminDiagnostics: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { refreshData } = useClinic();

  const [diagnostics, setDiagnostics] = useState<DiagnosticService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiag, setEditingDiag] = useState<DiagnosticService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/diagnostics', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error('Failed to load diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDiag({
      id: '',
      slug: '',
      name: '',
      shortDesc: '',
      fullDesc: '',
      iconName: 'Activity',
      turnaroundTime: '24–48 hours',
      requirements: ['Valid photo ID'],
      displayOrder: diagnostics.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (diag: DiagnosticService) => {
    setEditingDiag({ ...diag });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiag) return;

    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const isNew = !editingDiag.id;
      const url = isNew ? '/api/admin/diagnostics' : `/api/admin/diagnostics/${editingDiag.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editingDiag)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save diagnostic test');
      }

      setIsModalOpen(false);
      await fetchDiagnostics();
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Admin can delete diagnostic items.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/diagnostics/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchDiagnostics();
        await refreshData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Diagnostic &amp; Lab Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Diagnostic Solutions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage tests performed on-site (EKG, blood labs, stress testing, echocardiograms, and clearances).
          </p>
        </div>

        {hasRole(['super_admin', 'editor']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Diagnostic Test</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {diagnostics.map((diag) => (
          <div
            key={diag.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-900 rounded">
                  Order #{diag.displayOrder}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    diag.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {diag.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{diag.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                {diag.shortDesc}
              </p>
              <div className="text-[11px] text-blue-900 font-semibold mt-3">
                Turnaround: {diag.turnaroundTime}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {hasRole(['super_admin', 'editor']) && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit(diag)}
                  className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg"
                  title="Edit test"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {hasRole(['super_admin']) && (
                <button
                  type="button"
                  onClick={() => handleDelete(diag.id, diag.name)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingDiag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingDiag.id ? `Edit ${editingDiag.name}` : 'New Diagnostic Test'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={editingDiag.name}
                  onChange={(e) => setEditingDiag({ ...editingDiag, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Turnaround Time</label>
                <input
                  type="text"
                  value={editingDiag.turnaroundTime}
                  onChange={(e) => setEditingDiag({ ...editingDiag, turnaroundTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingDiag.shortDesc}
                  onChange={(e) => setEditingDiag({ ...editingDiag, shortDesc: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs"
                >
                  {saving ? 'Saving...' : 'Save Diagnostic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
