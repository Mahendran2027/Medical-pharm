import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import inventoryService from '../../services/inventoryService';
import medicineService from '../../services/medicineService';
import pharmacyService from '../../services/pharmacyService';
import {
  CreateInventoryDto,
  InventoryResponseDto,
  MedicineResponseDto,
  PharmacyResponseDto,
  UpdateInventoryDto,
} from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const InventoryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyResponseDto | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryResponseDto | null>(null);

  // Add Inventory Form State
  const [medicinesCatalog, setMedicinesCatalog] = useState<MedicineResponseDto[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [isCustomMedicine, setIsCustomMedicine] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedBrand, setCustomMedBrand] = useState('');
  const [addForm, setAddForm] = useState<CreateInventoryDto>({
    medicineId: '',
    quantityOnHand: 10,
    unitPrice: 5.0,
    lowStockThreshold: 5,
    batchNumber: '',
    expiryDate: '',
  });

  // Edit Inventory Form State
  const [editForm, setEditForm] = useState<UpdateInventoryDto>({
    quantityOnHand: 0,
    unitPrice: 0,
    lowStockThreshold: 5,
    batchNumber: '',
    expiryDate: '',
    isActive: true,
    adjustmentNote: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchPharmacyProfile();
  }, []);

  const fetchPharmacyProfile = async () => {
    try {
      const res = await pharmacyService.getMyPharmacyProfile();
      if (res.success && res.data) {
        setPharmacyProfile(res.data);
      }
    } catch {
      // Non-critical fallback
    }
  };

  const fetchInventory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await inventoryService.getInventory(1, 100, searchQuery || undefined);
      if (response.success && response.data) {
        setInventoryItems(response.data.items || []);
      } else {
        setErrorMessage(response.message || 'Failed to fetch inventory items.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with inventory service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoadingMedicines(true);

    try {
      const res = await medicineService.getMedicines(1, 100);
      if (res.success && res.data) {
        setMedicinesCatalog(res.data.items || []);
        if (res.data.items?.length > 0) {
          setAddForm((prev) => ({ ...prev, medicineId: res.data.items[0].id }));
        }
      }
    } catch {
      setErrorMessage('Failed to load medicine catalog for selection.');
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isCustomMedicine || medicinesCatalog.length === 0) {
      if (!customMedName.trim()) {
        setErrorMessage('Please enter the medicine name.');
        return;
      }
    } else if (!addForm.medicineId) {
      setErrorMessage('Please select a medicine.');
      return;
    }

    if (addForm.quantityOnHand < 0 || addForm.unitPrice < 0 || addForm.lowStockThreshold < 0) {
      setErrorMessage('Quantities, prices, and thresholds cannot be negative.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        ...addForm,
        quantityOnHand: Number(addForm.quantityOnHand),
        unitPrice: Number(addForm.unitPrice),
        lowStockThreshold: Number(addForm.lowStockThreshold),
      };

      if (isCustomMedicine || medicinesCatalog.length === 0) {
        payload.medicineName = customMedName.trim();
        payload.name = customMedName.trim();
        payload.brandName = customMedBrand.trim();
        payload.genericName = customMedName.trim();
      }

      const response = await inventoryService.addInventory(payload);

      if (response.success) {
        setSuccessMessage(`Medicine added directly to ${pharmacyProfile?.name || 'your shop'} (${pharmacyProfile?.city || 'Karur'}) inventory!`);
        setIsAddModalOpen(false);
        setCustomMedName('');
        setCustomMedBrand('');
        fetchInventory();
      } else {
        setErrorMessage(response.message || 'Failed to add item to inventory.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to add item to inventory.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditModal = (item: InventoryResponseDto) => {
    setEditingItem(item);
    setEditForm({
      quantityOnHand: item.quantityOnHand,
      unitPrice: item.unitPrice,
      lowStockThreshold: item.lowStockThreshold,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      isActive: item.isActive,
      adjustmentNote: '',
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editForm.quantityOnHand < 0 || editForm.unitPrice < 0 || editForm.lowStockThreshold < 0) {
      setErrorMessage('Quantities, prices, and thresholds cannot be negative.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await inventoryService.updateInventory(editingItem.id, {
        ...editForm,
        quantityOnHand: Number(editForm.quantityOnHand),
        unitPrice: Number(editForm.unitPrice),
        lowStockThreshold: Number(editForm.lowStockThreshold),
      });

      if (response.success) {
        setSuccessMessage(`Updated stock for ${editingItem.medicineName} successfully.`);
        setEditingItem(null);
        fetchInventory();
      } else {
        setErrorMessage(response.message || 'Failed to update inventory.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to update inventory.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(q) ||
      item.genericName?.toLowerCase().includes(q) ||
      item.batchNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <PharmacyLayout>
      <div className="space-y-6">
        {/* Header Bar with Store & City location details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {pharmacyProfile?.name || 'Pharmacy'} Inventory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                📍 {pharmacyProfile?.city || 'Karur'}, {pharmacyProfile?.state || 'Tamil Nadu'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Store Address: <span className="font-medium text-slate-800">{pharmacyProfile?.address || '15 Jawahar Bazaar, Karur'}</span> • Phone: <span className="font-medium text-slate-800">{pharmacyProfile?.contactPhone || '+91 4324 260 100'}</span>
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            ➕ Add Medicine to Stock
          </Button>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs text-emerald-700 underline font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchInventory} />}

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Filter by medicine name or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredItems.length}</span> items
          </div>
        </div>

        {/* Table / List */}
        {isLoading ? (
          <LoadingSpinner label="Loading pharmacy inventory..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Inventory Found"
            description={
              searchQuery
                ? `No inventory items match search criteria "${searchQuery}".`
                : 'Your pharmacy inventory is currently empty. Click "Add Stock Item" to add medicines.'
            }
            action={
              <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                Add Stock Item
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Medicine</th>
                    <th className="px-5 py-3">Batch / Expiry</th>
                    <th className="px-5 py-3">On Hand</th>
                    <th className="px-5 py-3">Reserved</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Unit Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const isLow = item.availableQuantity <= item.lowStockThreshold;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-slate-900">{item.medicineName}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.genericName} {item.strength ? `• ${item.strength}` : ''}
                          </p>
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-600">
                          {item.batchNumber || 'N/A'}
                          {item.expiryDate && (
                            <p className="text-[10px] text-slate-400">
                              Exp: {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">{item.quantityOnHand}</td>
                        <td className="px-5 py-3 text-amber-600 font-semibold">
                          {item.reservedQuantity}
                        </td>
                        <td className="px-5 py-3 font-bold text-emerald-700">
                          {item.availableQuantity}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                              ⚠️ Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            Edit / Adjust
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Medicine to Inventory</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingMedicines ? (
              <LoadingSpinner label="Loading medicine catalog..." />
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {medicinesCatalog.length > 0 && !isCustomMedicine ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Select Medicine Catalog Item</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomMedicine(true)}
                        className="text-xs text-emerald-600 font-bold hover:underline"
                      >
                        + Add Custom Medicine
                      </button>
                    </div>
                    <Select
                      value={addForm.medicineId}
                      onChange={(e) => setAddForm({ ...addForm, medicineId: e.target.value })}
                      options={medicinesCatalog.map((m) => ({
                        value: m.id,
                        label: `${m.name} (${m.strength || m.dosageForm}) - ${m.categoryName || 'General'}`,
                      }))}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">New Medicine Entry</span>
                      {medicinesCatalog.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCustomMedicine(false)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Select Existing
                        </button>
                      )}
                    </div>
                    <Input
                      label="Medicine Name *"
                      placeholder="e.g., Paracetamol, Dolo 650, Limcee"
                      value={customMedName}
                      onChange={(e) => setCustomMedName(e.target.value)}
                      required
                    />
                    <Input
                      label="Brand / Manufacturer"
                      placeholder="e.g., Micro Labs / Crocin"
                      value={customMedBrand}
                      onChange={(e) => setCustomMedBrand(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity On Hand"
                    type="number"
                    min="0"
                    value={addForm.quantityOnHand}
                    onChange={(e) =>
                      setAddForm({ ...addForm, quantityOnHand: Number(e.target.value) })
                    }
                    required
                  />

                  <Input
                    label="Unit Price (₹)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={addForm.unitPrice}
                    onChange={(e) =>
                      setAddForm({ ...addForm, unitPrice: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    min="0"
                    value={addForm.lowStockThreshold}
                    onChange={(e) =>
                      setAddForm({ ...addForm, lowStockThreshold: Number(e.target.value) })
                    }
                    required
                  />

                  <Input
                    label="Batch Number (Optional)"
                    value={addForm.batchNumber || ''}
                    onChange={(e) => setAddForm({ ...addForm, batchNumber: e.target.value })}
                  />
                </div>

                <Input
                  label="Expiry Date (Optional)"
                  type="date"
                  value={addForm.expiryDate || ''}
                  onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                    Save Stock Item
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Adjust Stock Item</h3>
                <p className="text-xs text-slate-500">{editingItem.medicineName}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantity On Hand"
                  type="number"
                  min="0"
                  value={editForm.quantityOnHand}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantityOnHand: Number(e.target.value) })
                  }
                  required
                />

                <Input
                  label="Unit Price (₹)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.unitPrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unitPrice: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Low Stock Threshold"
                  type="number"
                  min="0"
                  value={editForm.lowStockThreshold}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lowStockThreshold: Number(e.target.value) })
                  }
                  required
                />

                <Input
                  label="Batch Number"
                  value={editForm.batchNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })}
                />
              </div>

              <Input
                label="Expiry Date"
                type="date"
                value={editForm.expiryDate || ''}
                onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
              />

              <Input
                label="Adjustment Reason / Note"
                placeholder="e.g. Received new shipment, stock correction..."
                value={editForm.adjustmentNote || ''}
                onChange={(e) => setEditForm({ ...editForm, adjustmentNote: e.target.value })}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Update Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PharmacyLayout>
  );
};

export default InventoryPage;
