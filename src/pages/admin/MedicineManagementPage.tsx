import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import adminService from '../../services/adminService';
import medicineService from '../../services/medicineService';
import {
  CreateMedicineDto,
  MedicineCategoryDto,
  MedicineResponseDto,
  PagedResponse,
  UpdateMedicineDto,
} from '../../types';

export const MedicineManagementPage: React.FC = () => {
  const [pagedData, setPagedData] = useState<PagedResponse<MedicineResponseDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [categories, setCategories] = useState<MedicineCategoryDto[]>([]);
  const [page, setPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add / Edit Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineResponseDto | null>(null);

  // Form State
  const [pharmacies, setPharmacies] = useState<{ id: string; name: string; city?: string }[]>([]);
  const [formData, setFormData] = useState<{
    categoryId: string;
    name: string;
    genericName: string;
    brandName: string;
    manufacturer: string;
    dosageForm: string;
    strength: string;
    price: number | string;
    stockQuantity: number | string;
    pharmacyId: string;
    description: string;
    requiresPrescription: boolean;
    isActive: boolean;
  }>({
    categoryId: '',
    name: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    price: 35,
    stockQuantity: 100,
    pharmacyId: 'all',
    description: '',
    requiresPrescription: false,
    isActive: true,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingMedicine, setDeletingMedicine] = useState<MedicineResponseDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategoriesAndPharmacies = async () => {
    try {
      const [catRes, pharmRes] = await Promise.all([
        medicineService.getCategories(),
        adminService.getAllPharmacies(1, 50),
      ]);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (pharmRes.success && pharmRes.data?.items) {
        setPharmacies(
          pharmRes.data.items.map((p: any) => ({
            id: p.id,
            name: p.pharmacyName || p.name,
            city: p.city,
          }))
        );
      }
    } catch {
      // Silently handle
    }
  };

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicineService.getMedicines(
        page,
        10,
        selectedCategoryId || undefined,
        searchTerm || undefined
      );
      if (res.success && res.data) {
        setPagedData(res.data);
      } else {
        setError(res.message || 'Failed to fetch medicine catalog.');
      }
    } catch {
      setError('An error occurred while loading medicines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndPharmacies();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [page, selectedCategoryId, searchTerm]);

  const openCreateModal = () => {
    setFormError(null);
    setEditingMedicine(null);
    setFormData({
      categoryId: categories[0]?.id || 'cat-1',
      name: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      dosageForm: 'Tablet',
      strength: '500mg',
      price: 35,
      stockQuantity: 100,
      pharmacyId: pharmacies[0]?.id || 'all',
      description: '',
      requiresPrescription: false,
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (med: MedicineResponseDto) => {
    setFormError(null);
    setEditingMedicine(med);
    setFormData({
      categoryId: med.categoryId,
      name: med.name,
      genericName: med.genericName || '',
      brandName: med.brandName || '',
      manufacturer: med.manufacturer || '',
      dosageForm: med.dosageForm || 'Tablet',
      strength: med.strength || '500mg',
      price: 35,
      stockQuantity: 100,
      pharmacyId: 'all',
      description: med.description || '',
      requiresPrescription: med.requiresPrescription,
      isActive: med.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setFormError('Please select a medicine category.');
      return;
    }
    if (!formData.name.trim() || !formData.dosageForm.trim() || !formData.strength.trim()) {
      setFormError('Medicine name, dosage form, and strength are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingMedicine) {
        // Update
        const updateDto: UpdateMedicineDto = {
          categoryId: formData.categoryId,
          name: formData.name.trim(),
          genericName: formData.genericName.trim(),
          brandName: formData.brandName.trim(),
          manufacturer: formData.manufacturer.trim(),
          dosageForm: formData.dosageForm.trim(),
          strength: formData.strength.trim(),
          price: Number(formData.price) || 0,
          stockQuantity: Number(formData.stockQuantity) || 0,
          pharmacyId: formData.pharmacyId,
          description: formData.description.trim(),
          requiresPrescription: formData.requiresPrescription,
          isActive: formData.isActive,
        };

        const res = await adminService.updateMedicine(editingMedicine.id, updateDto);
        if (res.success) {
          setSuccessMsg(`Medicine "${formData.name}" updated successfully.`);
          setIsCreateModalOpen(false);
          fetchMedicines();
        } else {
          setFormError(res.message || 'Failed to update medicine.');
        }
      } else {
        // Create
        const createDto: CreateMedicineDto = {
          categoryId: formData.categoryId,
          name: formData.name.trim(),
          genericName: formData.genericName.trim() || formData.name.trim(),
          brandName: formData.brandName.trim(),
          manufacturer: formData.manufacturer.trim(),
          dosageForm: formData.dosageForm.trim(),
          strength: formData.strength.trim(),
          price: Number(formData.price) || 0,
          stockQuantity: Number(formData.stockQuantity) || 0,
          pharmacyId: formData.pharmacyId,
          description: formData.description.trim(),
          requiresPrescription: formData.requiresPrescription,
        };

        const res = await adminService.createMedicine(createDto);
        if (res.success) {
          setSuccessMsg(`Medicine "${formData.name}" added and stock updated across stores.`);
          setIsCreateModalOpen(false);
          fetchMedicines();
        } else {
          setFormError(res.message || 'Failed to create medicine.');
        }
      }
    } catch {
      setFormError('Error communicating with server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMedicine) return;
    setDeleteLoading(true);
    try {
      const res = await adminService.deleteMedicine(deletingMedicine.id);
      if (res.success) {
        setSuccessMsg(`Medicine "${deletingMedicine.name}" was removed from the catalog.`);
        setDeletingMedicine(null);
        fetchMedicines();
      } else {
        setError(res.message || 'Failed to delete medicine.');
      }
    } catch {
      setError('An error occurred while deleting medicine.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medicine Catalog</h1>
            <p className="text-sm text-slate-500 mt-1">
              Global medicine directory, categories, dosage forms, and prescription mandates.
            </p>
          </div>
          <Button leftIcon="➕" onClick={openCreateModal}>
            Add Medicine
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

        {/* Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, generic, or brand..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchMedicines} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading catalog..." />
          </div>
        ) : pagedData.items.length === 0 ? (
          <EmptyState
            title="No Medicines Found"
            description="No medicine entries match the selected category or search filter."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Medicine Name</th>
                    <th className="px-4 py-3">Generic / Brand</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Dosage & Strength</th>
                    <th className="px-4 py-3">Prescription</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pagedData.items.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {med.name}
                        {med.manufacturer && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {med.manufacturer}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{med.genericName || '—'}</div>
                        {med.brandName && (
                          <div className="text-[10px] text-slate-400">Brand: {med.brandName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">
                        {med.categoryName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="font-semibold">{med.dosageForm}</span> ({med.strength})
                      </td>
                      <td className="px-4 py-3">
                        {med.requiresPrescription ? (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold rounded-md">
                            Prescription Req.
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                            OTC
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={med.isActive ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(med)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingMedicine(med)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagedData.totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Page {pagedData.pageNumber} of {pagedData.totalPages} ({pagedData.totalCount} total)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagedData.hasPreviousPage}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagedData.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Medicine Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingMedicine ? 'Edit Medicine Entry' : 'Add New Medicine'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && <ErrorMessage message={formError} />}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <Select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      options={[
                        { value: '', label: '-- Select Category --' },
                        ...categories.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign to Pharmacy Store *</label>
                    <Select
                      value={formData.pharmacyId}
                      onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
                      options={[
                        { value: 'all', label: '🌐 All Stores' },
                        ...pharmacies.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.city || 'Karur'})`,
                        })),
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medicine Name *</label>
                    <Input
                      placeholder="e.g., Paracetamol, Dolo 650, Limcee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand / Manufacturer</label>
                    <Input
                      placeholder="e.g., Micro Labs / Crocin"
                      value={formData.brandName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandName: e.target.value,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price in ₹ (INR) *</label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g., 35.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage Form *</label>
                    <Input
                      placeholder="e.g., Tablet, Capsule, Syrup"
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Strength *</label>
                    <Input
                      placeholder="e.g., 500mg, 650mg, 100ml"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Usage notes, indications, storage details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.requiresPrescription}
                      onChange={(e) =>
                        setFormData({ ...formData, requiresPrescription: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Requires Prescription</span>
                  </label>

                  {editingMedicine && (
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span>Is Active</span>
                    </label>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={formSubmitting}
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={formSubmitting}>
                    {editingMedicine ? 'Save Changes' : 'Create Medicine'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Delete Medicine</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-900">"{deletingMedicine.name}"</span>?
                This action will remove the item from the central catalog.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteLoading}
                  onClick={() => setDeletingMedicine(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deleteLoading}
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MedicineManagementPage;
