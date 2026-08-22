import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import notificationService from '../../services/notificationService';
import { NotificationResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await notificationService.getNotifications();
      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray((response.data as any)?.items)
          ? (response.data as any).items
          : [];
        setNotifications(items);
      } else {
        setErrorMessage(response.message || 'Failed to load notifications.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with notification service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {
      // Silently handle error or display toast
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Stay updated on status changes, store approvals, and hold expiration warnings.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            🔄 Refresh
          </Button>
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchNotifications} />}

        {isLoading ? (
          <LoadingSpinner label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You currently have no notification alerts."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.isRead ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    🔔
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          !n.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!n.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-100/60"
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default NotificationsPage;
