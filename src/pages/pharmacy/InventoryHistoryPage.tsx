import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import inventoryService from '../../services/inventoryService';
import { InventoryTransactionResponseDto } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const InventoryHistoryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<InventoryTransactionResponseDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (pageNum: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await inventoryService.getInventoryHistory(pageNum, 20);
      if (response.success && response.data) {
        setTransactions(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setErrorMessage(response.message || 'Failed to load inventory transaction history.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with inventory history service.'
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
            <h1 className="text-2xl font-bold text-slate-900">Inventory Transaction History</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Audit log of all stock adjustments, reservation holds, approvals, and manual edits.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Log Entries: <span className="text-slate-900 font-bold">{totalCount}</span>
          </div>
        </div>

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={() => fetchHistory(page)} />}

        {isLoading ? (
          <LoadingSpinner label="Loading transaction logs..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No History Logs Found"
            description="There are no recorded stock transactions for your pharmacy inventory yet."
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Medicine</th>
                      <th className="px-5 py-3">Transaction Type</th>
                      <th className="px-5 py-3">Qty Change</th>
                      <th className="px-5 py-3">New On-Hand</th>
                      <th className="px-5 py-3">New Reserved</th>
                      <th className="px-5 py-3">Performed By</th>
                      <th className="px-5 py-3">Reference / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isPositive = tx.quantityChange > 0;
                      const isNegative = tx.quantityChange < 0;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3 font-mono text-slate-500 whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-900">{tx.medicineName}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                              {tx.transactionType}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono font-bold">
                            <span
                              className={
                                isPositive
                                  ? 'text-emerald-600'
                                  : isNegative
                                  ? 'text-rose-600'
                                  : 'text-slate-600'
                              }
                            >
                              {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-900">
                            {tx.newQuantityOnHand}
                          </td>
                          <td className="px-5 py-3 text-amber-700 font-semibold">
                            {tx.newReservedQuantity}
                          </td>
                          <td className="px-5 py-3 text-slate-600">{tx.performedByUserName}</td>
                          <td className="px-5 py-3 text-slate-500">
                            {tx.referenceNumber && (
                              <span className="font-mono text-slate-700 font-medium block">
                                Ref: {tx.referenceNumber}
                              </span>
                            )}
                            <span>{tx.note || '—'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &larr; Previous Page
                </Button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next Page &rarr;
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default InventoryHistoryPage;
