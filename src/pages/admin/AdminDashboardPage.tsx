import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import { AdminAnalyticsResponseDto } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAdminAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load system analytics.');
      }
    } catch {
      setError('An error occurred while fetching platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              System overview, pharmacy verification queue, and platform statistics.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            🔄 Refresh Data
          </button>
        </div>

        {loading && (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading platform stats..." />
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

        {!loading && !error && data && (
          <>
            {/* Urgent Alerts Banner if Pending Approvals */}
            {data.pendingPharmacyApprovals > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xl shrink-0">
                    ⏳
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      {data.pendingPharmacyApprovals} Pharmacy Registration{data.pendingPharmacyApprovals > 1 ? 's' : ''} Pending Review
                    </h3>
                    <p className="text-xs text-amber-700">
                      Pharmacies are waiting for administrator approval before listing inventory.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/pharmacies"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0 text-center"
                >
                  Review Approvals →
                </Link>
              </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Users
                  </span>
                  <span className="text-lg">👥</span>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{data.totalUsers}</div>
                <p className="mt-1 text-xs text-slate-500">
                  {data.totalCustomers} Customers • {data.totalPharmacies} Pharmacies
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pending Approvals
                  </span>
                  <span className="text-lg">🏬</span>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-600">
                  {data.pendingPharmacyApprovals}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Out of {data.totalPharmacies} total stores
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Medicine Catalog
                  </span>
                  <span className="text-lg">💊</span>
                </div>
                <div className="mt-2 text-2xl font-black text-indigo-600">
                  {data.totalMedicinesInCatalog}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Across {data.totalInventoryListings} pharmacy stock entries
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Reservations
                  </span>
                  <span className="text-lg">📋</span>
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {data.totalReservationsCreated}
                </div>
                <p className="mt-1 text-xs text-slate-500">Created across all stores</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">Quick Platform Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  to="/admin/pharmacies"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center gap-3 text-sm font-semibold text-slate-800"
                >
                  <span>🏬</span>
                  <span>Pharmacy Approvals</span>
                </Link>
                <Link
                  to="/admin/users"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center gap-3 text-sm font-semibold text-slate-800"
                >
                  <span>👥</span>
                  <span>User Directory</span>
                </Link>
                <Link
                  to="/admin/medicines"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center gap-3 text-sm font-semibold text-slate-800"
                >
                  <span>💊</span>
                  <span>Manage Catalog</span>
                </Link>
                <Link
                  to="/admin/categories"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center gap-3 text-sm font-semibold text-slate-800"
                >
                  <span>🏷️</span>
                  <span>Categories</span>
                </Link>
              </div>
            </div>

            {/* Content Split: Most Searched & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Searched Medicines */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🔥</span> Most Searched Medicines
                </h2>
                {data.mostSearchedMedicines.length === 0 ? (
                  <EmptyState title="No Search Analytics" description="No search query records logged yet." />
                ) : (
                  <div className="space-y-3 flex-1">
                    {data.mostSearchedMedicines.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {item.searchTerm}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                          {item.searchCount} searches
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent System Activity */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>📜</span> Recent System Activity
                </h2>
                {data.recentSystemActivity.length === 0 ? (
                  <EmptyState title="No Recent Activity" description="System activity logs will appear here." />
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
                    {data.recentSystemActivity.map((activity, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-bold text-indigo-600 uppercase tracking-wider text-[10px]">
                            {activity.activityType}
                          </span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 font-medium text-xs">
                          {activity.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
