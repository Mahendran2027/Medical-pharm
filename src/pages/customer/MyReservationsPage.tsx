import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import reservationService from '../../services/reservationService';
import { ReservationResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Select from '../../components/common/Select';

export const MyReservationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Cancel Modal State
  const [selectedForCancel, setSelectedForCancel] = useState<ReservationResponseDto | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // View Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<ReservationResponseDto | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filterArg = statusFilter === 'All' ? undefined : statusFilter;
      const response = await reservationService.getMyReservations(1, 50, filterArg);
      if (response.success && response.data) {
        setReservations(response.data.items || []);
      } else {
        setErrorMessage(response.message || 'Failed to fetch reservations.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with reservation service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedForCancel) return;

    setIsCancelling(true);
    setErrorMessage(null);

    try {
      const res = await reservationService.cancelReservation(
        selectedForCancel.id,
        cancelReason.trim() || 'Cancelled by customer'
      );

      if (res.success) {
        setActionSuccessMessage(`Reservation ${selectedForCancel.reservationCode} was cancelled.`);
        setSelectedForCancel(null);
        setCancelReason('');
        fetchReservations();
      } else {
        setErrorMessage(res.message || 'Failed to cancel reservation.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">In-Store Pickup Reservations</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              View your store pickup codes, shop locations, contact numbers, and payment details.
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

        {actionSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{actionSuccessMessage}</span>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-xs text-emerald-700 underline font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchReservations} />}

        {isLoading ? (
          <LoadingSpinner label="Loading your pickup reservations..." />
        ) : reservations.length === 0 ? (
          <EmptyState
            title="No Reservations Found"
            description={
              statusFilter === 'All'
                ? 'You have not submitted any in-store pickup reservations yet. Search a medicine and city to find matching pharmacies.'
                : `No reservations found matching status filter "${statusFilter}".`
            }
          />
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const isEligibleForCancel = ['Pending', 'Approved'].includes(res.status);

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-lg">
                          Code: {res.reservationCode}
                        </span>
                        <StatusBadge status={res.status} />
                        <span className="text-xs text-slate-500">
                          Reserved for In-Store Collection
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-2">{res.medicineName}</h2>
                      {res.strength && (
                        <span className="text-xs font-medium text-slate-500">
                          Strength / Form: {res.strength}
                        </span>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Total Due at Pickup Counter</p>
                      <p className="text-xl font-extrabold text-emerald-700">
                        ₹{(res.totalEstimatedPrice || res.totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">🏬 Store Pickup Location</p>
                      <p className="font-bold text-slate-800">{res.pharmacyName}</p>
                      <p className="text-slate-600 mt-0.5">{res.pharmacyAddress || 'Central Market, Karur'}</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        📞 Phone: <a href={`tel:${res.pharmacyPhone}`} className="text-emerald-700 hover:underline">{res.pharmacyPhone || '+91 4324 260 100'}</a>
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 mb-1">📋 Request Details</p>
                      <p>Quantity Reserved: <strong className="text-slate-900">{res.quantityRequested} units</strong></p>
                      <p>Submitted: {new Date(res.requestedAt || res.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      {res.expiresAt && (
                        <p className="text-amber-700 font-medium">
                          Held Until: {new Date(res.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 mb-1">💬 Customer Note & Info</p>
                      {res.customerNote ? (
                        <p className="italic text-slate-700">"{res.customerNote}"</p>
                      ) : (
                        <p className="text-slate-400">No notes attached.</p>
                      )}
                      {res.rejectionReason && (
                        <p className="text-rose-700 font-medium mt-1">
                          Reason: "{res.rejectionReason}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingReceipt(res)}
                      className="text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                    >
                      🧾 View Pickup Confirmation Details
                    </Button>

                    {isEligibleForCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-xs"
                        onClick={() => {
                          setSelectedForCancel(res);
                          setCancelReason('');
                        }}
                      >
                        Cancel Reservation
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Pickup Receipt Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    In-Store Pickup Confirmation
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    Store Pickup Pass
                  </h3>
                </div>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Code Box */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center space-y-1">
                <div className="text-xs text-emerald-800 font-bold uppercase">Pickup PIN / Code</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-950">
                    {viewingReceipt.reservationCode}
                  </span>
                  <button
                    onClick={() => copyCode(viewingReceipt.reservationCode)}
                    className="px-2.5 py-1 bg-white border border-emerald-300 rounded-md text-xs font-bold text-emerald-800"
                  >
                    {isCopied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Show this code at the pharmacy billing counter
                </div>
              </div>

              {/* Shop Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  🏬 {viewingReceipt.pharmacyName}
                </div>
                <div className="text-slate-700 leading-relaxed">
                  📍 {viewingReceipt.pharmacyAddress || 'Karur, Tamil Nadu'}
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span>📞 Phone: <strong>{viewingReceipt.pharmacyPhone || '+91 4324 260 100'}</strong></span>
                  <a
                    href={`tel:${viewingReceipt.pharmacyPhone}`}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Call Store
                  </a>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Medicine:</span>
                  <span className="font-bold text-slate-900">{viewingReceipt.medicineName} ({viewingReceipt.strength || 'Standard'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantity Reserved:</span>
                  <span className="font-bold text-slate-900">{viewingReceipt.quantityRequested} Units</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold">
                  <span className="text-slate-900">Total Payable at Counter:</span>
                  <span className="text-emerald-700">₹{(viewingReceipt.totalEstimatedPrice || viewingReceipt.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setViewingReceipt(null)}
                  className="font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {selectedForCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Cancel In-Store Reservation</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your reservation for{' '}
                <strong>{selectedForCancel.medicineName}</strong> (Code:{' '}
                {selectedForCancel.reservationCode})? This will return the held stock back to the store inventory.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Purchased elsewhere, no longer needed..."
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedForCancel(null)}
                  disabled={isCancelling}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmCancel}
                  isLoading={isCancelling}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default MyReservationsPage;
