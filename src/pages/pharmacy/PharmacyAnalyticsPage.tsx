import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import pharmacyService from '../../services/pharmacyService';
import { PharmacyAnalyticsResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const PharmacyAnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PharmacyAnalyticsResponseDto | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await pharmacyService.getPharmacyAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setErrorMessage(response.message || 'Failed to load pharmacy analytics.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with analytics service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pharmacy Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Store inventory valuation, hold reservation metrics, and demand analysis.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            🔄 Refresh Analytics
          </Button>
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchAnalytics} />}

        {isLoading ? (
          <LoadingSpinner label="Calculating pharmacy metrics..." />
        ) : !analytics ? (
          <EmptyState title="Analytics Unavailable" description="No store metrics available." />
        ) : (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Inventory Value
                </span>
                <p className="text-3xl font-black text-emerald-600">
                  ₹{analytics.totalEstimatedValue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500">
                  Across {analytics.totalInventoryItems} active stock items
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Low Stock Items
                </span>
                <p className="text-3xl font-black text-amber-600">
                  {analytics.lowStockItemsCount}
                </p>
                <p className="text-xs text-slate-500">Requiring restock attention</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completed Reservations
                </span>
                <p className="text-3xl font-black text-indigo-600">
                  {analytics.completedReservationsCount}
                </p>
                <p className="text-xs text-slate-500">Fulfilled customer pickups</p>
              </div>
            </div>

            {/* Reservation Status Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Hold Requests Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Pending Review</span>
                  <p className="text-2xl font-bold text-amber-600">
                    {analytics.pendingReservationsCount}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Approved / Ready</span>
                  <p className="text-2xl font-bold text-emerald-600">
                    {analytics.approvedReservationsCount}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Fulfilled Pickups</span>
                  <p className="text-2xl font-bold text-indigo-600">
                    {analytics.completedReservationsCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Reserved Medicines */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Top Reserved Medicines</h2>
                  <p className="text-xs text-slate-500">Most requested drugs at your store</p>
                </div>

                {!analytics.topReservedMedicines || analytics.topReservedMedicines.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reservation trend data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topReservedMedicines.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{m.medicineName}</p>
                            <p className="text-[11px] text-slate-500">
                              {m.reservationCount} Reservation Requests
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">
                            {m.totalQuantityReserved} Units
                          </p>
                          <p className="text-[10px] text-slate-400">Total Reserved</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Alerts Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Critical Stock Thresholds</h2>
                  <p className="text-xs text-slate-500">Items nearing exhaustion</p>
                </div>

                {!analytics.lowStockAlerts || analytics.lowStockAlerts.length === 0 ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
                    ✅ All inventory items are currently stocked safely above safety thresholds.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.lowStockAlerts.map((item) => (
                      <div
                        key={item.inventoryId}
                        className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.medicineName}</p>
                          <p className="text-[11px] text-amber-800 font-medium">
                            Threshold: {item.lowStockThreshold} units
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-200">
                            {item.availableQuantity} left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyAnalyticsPage;
