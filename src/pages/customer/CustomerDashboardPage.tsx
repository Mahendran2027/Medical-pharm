import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservationService';
import { ReservationResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await reservationService.getMyReservations(1, 20);
      if (response.success && response.data) {
        setReservations(response.data.items || []);
      } else {
        setErrorMessage(response.message || 'Failed to load dashboard data.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with reservation service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Derive statistical summaries from real reservation data
  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;
  const approvedCount = reservations.filter((r) => r.status === 'Approved').length;
  const fulfilledCount = reservations.filter((r) => r.status === 'Fulfilled').length;
  const activeCount = pendingCount + approvedCount;

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5);

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Patient Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Search available pharmacy stock in real time, monitor hold requests, and manage your medicine reservations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/search">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                  🔍 Find Medicine
                </Button>
              </Link>
              <Link to="/customer/reservations">
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  📋 View All Requests
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchDashboardData} />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Holds
            </span>
            <p className="text-3xl font-extrabold text-slate-900">{activeCount}</p>
            <p className="text-xs text-slate-500">Pending approval or awaiting pickup</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <p className="text-3xl font-extrabold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-slate-500">Awaiting pharmacy review</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Holds
            </span>
            <p className="text-3xl font-extrabold text-emerald-600">{approvedCount}</p>
            <p className="text-xs text-slate-500">Ready for store pickup</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fulfilled
            </span>
            <p className="text-3xl font-extrabold text-indigo-600">{fulfilledCount}</p>
            <p className="text-xs text-slate-500">Completed pickups</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Reservation Requests</h2>
              <p className="text-xs text-slate-500">Your latest medicine hold submissions</p>
            </div>
            <Link
              to="/customer/reservations"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading reservation history..." />
          ) : recentReservations.length === 0 ? (
            <EmptyState
              title="No Reservations Yet"
              description="You have not requested any medicine reservations. Search participating pharmacy inventory to request a hold."
              action={
                <Link to="/search">
                  <Button variant="primary" size="sm">
                    Search Medicines Now
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Medicine</th>
                    <th className="px-5 py-3">Pharmacy</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Est. Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Requested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">
                        {res.reservationCode}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{res.medicineName}</td>
                      <td className="px-5 py-3">{res.pharmacyName}</td>
                      <td className="px-5 py-3 font-medium">{res.quantityRequested}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        ₹{res.totalEstimatedPrice?.toFixed(2) || '0.00'}
                      </td>
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
    </CustomerLayout>
  );
};

export default CustomerDashboardPage;
