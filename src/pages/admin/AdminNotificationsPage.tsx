import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import notificationService from '../../services/notificationService';
import { NotificationResponseDto, PagedResponse } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const [pagedData, setPagedData] = useState<PagedResponse<NotificationResponseDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 15,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications(page, 15, unreadOnly);
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setPagedData({
            items: res.data,
            totalCount: res.data.length,
            pageNumber: 1,
            pageSize: 15,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          });
        } else {
          setPagedData({
            items: Array.isArray(res.data.items) ? res.data.items : [],
            totalCount: res.data.totalCount || 0,
            pageNumber: res.data.pageNumber || 1,
            pageSize: res.data.pageSize || 15,
            totalPages: res.data.totalPages || 1,
            hasPreviousPage: !!res.data.hasPreviousPage,
            hasNextPage: !!res.data.hasNextPage,
          });
        }
      } else {
        setError(res.message || 'Failed to load notifications.');
      }
    } catch {
      setError('An error occurred while fetching notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, unreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setActionSuccessMsg('Notification marked as read.');
        fetchNotifications();
      }
    } catch {
      // Handle error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setActionSuccessMsg('All notifications marked as read.');
        fetchNotifications();
      }
    } catch {
      // Handle error
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              System alerts, pharmacy approval requests, and platform logs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
            <button
              onClick={fetchNotifications}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex justify-between items-center">
            <span>✅ {actionSuccessMsg}</span>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex gap-2 bg-white p-2 border border-slate-200 rounded-xl shadow-2xs w-fit">
          <button
            onClick={() => {
              setUnreadOnly(undefined);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              unreadOnly === undefined
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setUnreadOnly(true);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              unreadOnly === true
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread Only
          </button>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchNotifications} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading notifications..." />
          </div>
        ) : pagedData.items.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You have no notifications matching the selected filter."
          />
        ) : (
          <div className="space-y-3">
            {pagedData.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.isRead
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{item.title}</span>
                    <StatusBadge status={item.type || 'System'} />
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                {!item.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="shrink-0 self-start sm:self-auto"
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagedData.totalPages > 1 && (
              <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-600 font-medium">
                  Page {pagedData.pageNumber} of {pagedData.totalPages}
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
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
