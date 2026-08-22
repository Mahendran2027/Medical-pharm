import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import { useAuth } from '../../context/AuthContext';
import pharmacyService from '../../services/pharmacyService';
import reservationService from '../../services/reservationService';
import inventoryService from '../../services/inventoryService';
import { PharmacyAnalyticsResponseDto, ReservationResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

export const PharmacyDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PharmacyAnalyticsResponseDto | null>(null);
  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Parallelize calls
      const [analyticsRes, reservationsRes] = await Promise.allSettled([
        pharmacyService.getPharmacyAnalytics(),
        reservationService.getPharmacyReservations(1, 10),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value.data);
      }

      if (reservationsRes.status === 'fulfilled' && reservationsRes.value.success) {
        setReservations(reservationsRes.value.data?.items || []);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error loading pharmacy dashboard information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount =
    analytics?.pendingReservationsCount ??
    reservations.filter((r) => r.status === 'Pending').length;

  const approvedCount =
    analytics?.approvedReservationsCount ??
    reservations.filter((r) => r.status === 'Approved').length;

  return (
    <PharmacyLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Pharmacy Manager
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Manage live stock availability, process customer reservation requests, and monitor low-stock thresholds.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/pharmacy/inventory">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                  ➕ Manage Inventory
                </Button>
              </Link>
              <Link to="/pharmacy/reservations">
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  📋 Review Requests ({pendingCount})
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchDashboardData} />}

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inventory Items
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              {analytics?.totalInventoryItems ?? '—'}
            </p>
            <p className="text-xs text-slate-500">Active medicine listings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <p className="text-3xl font-extrabold text-amber-600">
              {analytics?.lowStockItemsCount ?? '—'}
            </p>
            <Link
              to="/pharmacy/low-stock"
              className="text-xs text-amber-700 font-bold hover:underline inline-block mt-0.5"
            >
              View low stock items &rarr;
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Holds
            </span>
            <p className="text-3xl font-extrabold text-emerald-600">{pendingCount}</p>
            <p className="text-xs text-slate-500">Awaiting store confirmation</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Holds
            </span>
            <p className="text-3xl font-extrabold text-indigo-600">{approvedCount}</p>
            <p className="text-xs text-slate-500">Ready for customer pickup</p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/pharmacy/inventory"
            className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs text-center transition-colors block"
          >
            <span className="text-2xl block mb-1">💊</span>
            <span className="text-xs font-bold text-slate-800">Inventory</span>
          </Link>
          <Link
            to="/pharmacy/low-stock"
            className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs text-center transition-colors block"
          >
            <span className="text-2xl block mb-1">⚠️</span>
            <span className="text-xs font-bold text-slate-800">Low Stock</span>
          </Link>
          <Link
            to="/pharmacy/reservations"
            className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs text-center transition-colors block"
          >
            <span className="text-2xl block mb-1">📋</span>
            <span className="text-xs font-bold text-slate-800">Reservations</span>
          </Link>
          <Link
            to="/pharmacy/analytics"
            className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs text-center transition-colors block"
          >
            <span className="text-2xl block mb-1">📈</span>
            <span className="text-xs font-bold text-slate-800">Analytics</span>
          </Link>
        </div>

        {/* Recent Reservations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Hold Requests</h2>
              <p className="text-xs text-slate-500">Customer requests pending or recently updated</p>
            </div>
            <Link
              to="/pharmacy/reservations"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Manage All
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading reservation requests..." />
          ) : reservations.length === 0 ? (
            <EmptyState
              title="No Reservation Requests"
              description="No customers have submitted medicine hold requests for your store yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Medicine</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Requested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">
                        {res.reservationCode}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-900">{res.customerName}</p>
                        <p className="text-[11px] text-slate-400">{res.customerPhone}</p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{res.medicineName}</td>
                      <td className="px-5 py-3 font-bold text-slate-800">{res.quantityRequested}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(res.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyDashboardPage;
