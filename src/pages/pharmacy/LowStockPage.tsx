import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import inventoryService from '../../services/inventoryService';
import { InventoryResponseDto, UpdateInventoryDto } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const LowStockPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryResponseDto[]>([]);

  // Restock Modal
  const [restockItem, setRestockItem] = useState<InventoryResponseDto | null>(null);
  const [additionalQty, setAdditionalQty] = useState<number>(50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await inventoryService.getLowStockInventory();
      if (response && response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray((response.data as any)?.items)
          ? (response.data as any).items
          : [];
        setLowStockItems(items);
      } else {
        setLowStockItems([]);
        setErrorMessage(response?.message || 'Failed to fetch low-stock inventory.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with inventory service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;

    if (additionalQty <= 0) {
      setErrorMessage('Please specify a positive quantity to restock.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedQty = restockItem.quantityOnHand + Number(additionalQty);
      const updatePayload: UpdateInventoryDto = {
        quantityOnHand: updatedQty,
        unitPrice: restockItem.unitPrice,
        lowStockThreshold: restockItem.lowStockThreshold,
        batchNumber: restockItem.batchNumber,
        expiryDate: restockItem.expiryDate,
        isActive: restockItem.isActive,
        adjustmentNote: `Restocked +${additionalQty} units from Low Stock Alert page`,
      };

      const res = await inventoryService.updateInventory(restockItem.id, updatePayload);
      if (res.success) {
        setSuccessMessage(
          `Successfully restocked ${restockItem.medicineName}. New quantity: ${updatedQty}`
        );
        setRestockItem(null);
        fetchLowStock();
      } else {
        setErrorMessage(res.message || 'Failed to update stock.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Error restocking item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
              {lowStockItems.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold">
                  ⚠️ {lowStockItems.length} Alert{lowStockItems.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Medicines where available quantity is at or below your defined low-stock safety threshold.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchLowStock}>
            🔄 Refresh Alerts
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

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchLowStock} />}

        {isLoading ? (
          <LoadingSpinner label="Checking stock levels..." />
        ) : lowStockItems.length === 0 ? (
          <EmptyState
            title="All Stock Levels Healthy"
            description="No items in your pharmacy inventory are currently below their low-stock safety threshold."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-amber-200 p-6 shadow-2xs space-y-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200 uppercase mb-2">
                      ⚠️ Low Stock
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{item.medicineName}</h3>
                    <p className="text-xs text-slate-500">{item.genericName}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-2xl font-black text-rose-600">{item.availableQuantity}</p>
                    <p className="text-[10px] text-slate-400">Available</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>On Hand Quantity:</span>
                    <span className="font-bold text-slate-800">{item.quantityOnHand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved for Customer Holds:</span>
                    <span className="font-bold text-amber-700">{item.reservedQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock Threshold:</span>
                    <span className="font-bold text-slate-800">{item.lowStockThreshold}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span>Last Stock Update:</span>
                    <span className="font-medium text-slate-500">
                      {new Date(item.lastStockUpdate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setRestockItem(item);
                    setAdditionalQty(50);
                  }}
                >
                  📦 Restock Medicine
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Restock Medicine</h3>
              <p className="text-xs text-slate-600 mt-0.5">{restockItem.medicineName}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <p>
                Current Quantity On Hand:{' '}
                <span className="font-bold text-slate-900">{restockItem.quantityOnHand}</span>
              </p>
              <p>
                Safety Threshold:{' '}
                <span className="font-bold text-slate-900">{restockItem.lowStockThreshold}</span>
              </p>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <Input
                label="Add Stock Quantity"
                type="number"
                min="1"
                value={additionalQty}
                onChange={(e) => setAdditionalQty(Number(e.target.value))}
                required
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRestockItem(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Confirm Restock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PharmacyLayout>
  );
};

export default LowStockPage;
