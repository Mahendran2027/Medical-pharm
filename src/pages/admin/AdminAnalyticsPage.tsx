import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import { AdminAnalyticsResponseDto } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
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
        setError(res.message || 'Failed to retrieve admin analytics.');
      }
    } catch {
      setError('An error occurred while fetching platform analytics.');
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Platform Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time platform metrics, user distribution, search trends, and activity logs.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            🔄 Refresh Metrics
          </button>
        </div>

        {loading && (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Computing system metrics..." />
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

        {!loading && !error && data && (
          <>
            {/* Overview Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Users
                </span>
                <span className="text-3xl font-black text-slate-900 mt-2 block">
                  {data.totalUsers}
                </span>
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                  <span>Customers: <strong className="text-slate-800">{data.totalCustomers}</strong></span>
                  <span>Pharmacies: <strong className="text-slate-800">{data.totalPharmacies}</strong></span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Pharmacy Verification Queue
                </span>
                <span className="text-3xl font-black text-amber-600 mt-2 block">
                  {data.pendingPharmacyApprovals}
                </span>
                <p className="mt-2 text-xs text-slate-500">
                  Pending review out of {data.totalPharmacies} registered stores
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Catalog & Inventory
                </span>
                <span className="text-3xl font-black text-indigo-600 mt-2 block">
                  {data.totalMedicinesInCatalog}
                </span>
                <p className="mt-2 text-xs text-slate-500">
                  Medicines in catalog • <strong className="text-slate-800">{data.totalInventoryListings}</strong> active stock entries
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Reservations Created
                </span>
                <span className="text-3xl font-black text-emerald-600 mt-2 block">
                  {data.totalReservationsCreated}
                </span>
                <p className="mt-2 text-xs text-slate-500">
                  Total reservation requests processed
                </p>
              </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Searched Terms */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🔍</span> Most Searched Medicines
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search query telemetry aggregated from customer searches.
                  </p>
                </div>

                {data.mostSearchedMedicines.length === 0 ? (
                  <EmptyState title="No Search Logs" description="Search logs will appear as customers search for medicine." />
                ) : (
                  <div className="space-y-2">
                    {data.mostSearchedMedicines.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {item.searchTerm}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                          {item.searchCount} query events
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent System Activity Stream */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📜</span> System Activity Logs
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Audit trail of platform registrations, stock updates, and approvals.
                  </p>
                </div>

                {data.recentSystemActivity.length === 0 ? (
                  <EmptyState title="No Activity Logs" description="System activities will be logged here automatically." />
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {data.recentSystemActivity.map((activity, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">
                            {activity.activityType}
                          </span>
                          <span className="text-[11px] font-mono">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold">{activity.description}</p>
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

export default AdminAnalyticsPage;
