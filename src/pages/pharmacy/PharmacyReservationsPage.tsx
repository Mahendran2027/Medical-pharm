import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import reservationService from '../../services/reservationService';
import { ReservationResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Select from '../../components/common/Select';

export const PharmacyReservationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Action Modal State
  const [actionItem, setActionItem] = useState<{
    reservation: ReservationResponseDto;
    action: 'approve' | 'reject' | 'fulfill' | 'cancel';
  } | null>(null);

  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const filter = statusFilter === 'All' ? undefined : statusFilter;
      const response = await reservationService.getPharmacyReservations(1, 50, filter);
      if (response.success && response.data) {
        setReservations(response.data.items || []);
      } else {
        setErrorMessage(response.message || 'Failed to fetch pharmacy reservations.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with reservation service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionItem) return;

    const { reservation, action } = actionItem;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await reservationService.updateReservationStatus(reservation.id, action, {
        reasonOrNote: actionReason.trim() || `Processed as ${action} by pharmacy staff`,
      });

      if (res.success) {
        setSuccessMessage(
          `Reservation ${reservation.reservationCode} was successfully ${action}d.`
        );
        setActionItem(null);
        setActionReason('');
        fetchReservations();
      } else {
        setErrorMessage(res.message || `Failed to ${action} reservation.`);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          `Failed to ${action} reservation. Stock may no longer be available.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reservation Requests</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Review incoming patient hold requests, confirm stock availability, and fulfill pickups.
            </p>
          </div>

          <div className="w-full sm:w-48">
            <Select
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Fulfilled', label: 'Fulfilled' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Expired', label: 'Expired' },
              ]}
            />
          </div>
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

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchReservations} />}

        {/* List of Reservations */}
        {isLoading ? (
          <LoadingSpinner label="Loading reservation requests..." />
        ) : reservations.length === 0 ? (
          <EmptyState
            title="No Reservation Requests"
            description={
              statusFilter === 'All'
                ? 'No medicine hold requests have been submitted for your store yet.'
                : `No reservations found matching status filter "${statusFilter}".`
            }
          />
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const isPending = res.status === 'Pending';
              const isApproved = res.status === 'Approved';

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                          {res.reservationCode}
                        </span>
                        <StatusBadge status={res.status} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-2">{res.medicineName}</h2>
                      {res.strength && (
                        <p className="text-xs text-slate-500 font-medium">Strength: {res.strength}</p>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Requested Quantity</p>
                      <p className="text-xl font-extrabold text-slate-900">
                        {res.quantityRequested} Unit{res.quantityRequested > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-emerald-700 font-bold">
                        Est. Total: ₹{res.totalEstimatedPrice?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">Customer Information</p>
                      <p className="font-bold text-slate-800">{res.customerName}</p>
                      <p>Phone: {res.customerPhone}</p>
                      <p>Email: {res.customerEmail}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 mb-1">Time & Expiry</p>
                      <p>Requested: {new Date(res.requestedAt).toLocaleString()}</p>
                      {res.expiresAt && (
                        <p className="text-amber-700 font-medium">
                          Expires: {new Date(res.expiresAt).toLocaleString()}
                        </p>
                      )}
                      {res.approvedAt && (
                        <p className="text-emerald-700 font-medium">
                          Approved: {new Date(res.approvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 mb-1">Notes & Reasons</p>
                      {res.customerNote && <p>Customer Note: "{res.customerNote}"</p>}
                      {res.rejectionReason && (
                        <p className="text-rose-700 font-medium">
                          Rejection Reason: "{res.rejectionReason}"
                        </p>
                      )}
                      {!res.customerNote && !res.rejectionReason && (
                        <p className="text-slate-400 italic">No notes recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {(isPending || isApproved) && (
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      {isPending && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setActionItem({ reservation: res, action: 'reject' });
                              setActionReason('');
                            }}
                          >
                            Reject Request
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setActionItem({ reservation: res, action: 'approve' });
                              setActionReason('');
                            }}
                          >
                            Approve & Reserve Stock
                          </Button>
                        </>
                      )}

                      {isApproved && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                          onClick={() => {
                            setActionItem({ reservation: res, action: 'fulfill' });
                            setActionReason('Completed customer pickup at pharmacy counter');
                          }}
                        >
                          Mark as Fulfilled
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {actionItem.action} Reservation
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Confirm action for code{' '}
                <span className="font-mono font-bold text-slate-900">
                  {actionItem.reservation.reservationCode}
                </span>{' '}
                ({actionItem.reservation.medicineName}).
              </p>
              {actionItem.action === 'approve' && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                  ⚠️ Note: Approval will attempt to allocate stock. Approval will fail if available quantity is insufficient.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Reason / Internal Note
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                rows={2}
                placeholder="e.g. Verified prescription and reserved on shelf..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionItem(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={actionItem.action === 'reject' ? 'danger' : 'primary'}
                size="sm"
                isLoading={isProcessing}
                onClick={handleConfirmAction}
              >
                Confirm {actionItem.action}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PharmacyLayout>
  );
};

export default PharmacyReservationsPage;

