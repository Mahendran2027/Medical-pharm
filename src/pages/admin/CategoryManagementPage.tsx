import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import medicineService from '../../services/medicineService';
import { MedicineCategoryDto } from '../../types';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<MedicineCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicineService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setError(res.message || 'Failed to load medicine categories.');
      }
    } catch {
      setError('An error occurred while communicating with the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const res = await adminService.createCategory(name.trim(), description.trim());
      if (res.success) {
        setSuccessMsg(`Category "${name}" created successfully.`);
        setName('');
        setDescription('');
        setIsModalOpen(false);
        fetchCategories();
      } else {
        setModalError(res.message || 'Failed to create category.');
      }
    } catch {
      setModalError('An error occurred while creating category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Medicine Categories
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Organize pharmaceutical products into standardized classification groups.
            </p>
          </div>
          <Button leftIcon="➕" onClick={() => setIsModalOpen(true)}>
            Add Category
          </Button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex justify-between items-center">
            <span>✅ {successMsg}</span>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading categories..." />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No Categories Available"
            description="Create categories like Antibiotics, Analgesics, Cardiology, etc."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-200 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold rounded-full">
                      {cat.medicineCount} {cat.medicineCount === 1 ? 'medicine' : 'medicines'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono truncate">
                  ID: {cat.id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add New Category</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalError && <ErrorMessage message={modalError} />}

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                  <Input
                    placeholder="e.g., Antibiotics, Analgesics, Vitamins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Brief description of this classification..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={submitting}>
                    Create Category
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagementPage;
