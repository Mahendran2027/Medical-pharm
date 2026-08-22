import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import adminService from '../../services/adminService';
import { PagedResponse, PharmacyResponseDto } from '../../types';

export const PharmacyManagementPage: React.FC = () => {
  const [pagedData, setPagedData] = useState<PagedResponse<PharmacyResponseDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Selected Pharmacy Modal
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyResponseDto | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    pharmacy: PharmacyResponseDto | null;
    actionType: 'approve' | 'deactivate' | null;
  }>({
    open: false,
    pharmacy: null,
    actionType: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPharmacies = async () => {
    setLoading(true);
    setError(null);
    try {
      let isApprovedParam: boolean | undefined = undefined;
      if (statusFilter === 'pending') isApprovedParam = false;
      if (statusFilter === 'approved') isApprovedParam = true;

      const res = await adminService.getAllPharmacies(page, 10, isApprovedParam);
      if (res.success && res.data) {
        setPagedData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve pharmacies.');
      }
    } catch {
      setError('An error occurred while fetching pharmacies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [page, statusFilter]);

  const handleApprove = async () => {
    if (!confirmModal.pharmacy) return;
    setActionLoading(true);
    try {
      const res = await adminService.approvePharmacy(confirmModal.pharmacy.id);
      if (res.success) {
        setActionSuccessMsg(`Pharmacy "${confirmModal.pharmacy.name}" has been approved.`);
        setConfirmModal({ open: false, pharmacy: null, actionType: null });
        fetchPharmacies();
      } else {
        setError(res.message || 'Failed to approve pharmacy.');
      }
    } catch {
      setError('Error communicating with server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmModal.pharmacy) return;
    setActionLoading(true);
    try {
      const res = await adminService.deactivatePharmacy(confirmModal.pharmacy.id);
      if (res.success) {
        setActionSuccessMsg(`Pharmacy "${confirmModal.pharmacy.name}" has been deactivated.`);
        setConfirmModal({ open: false, pharmacy: null, actionType: null });
        fetchPharmacies();
      } else {
        setError(res.message || 'Failed to deactivate pharmacy.');
      }
    } catch {
      setError('Error communicating with server.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = pagedData.items.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.licenseNumber.toLowerCase().includes(q) ||
      p.contactPhone.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pharmacy Approval & Oversight
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify pharmacy license details, approve new registrations, and manage operational status.
            </p>
          </div>
          <button
            onClick={fetchPharmacies}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            🔄 Refresh List
          </button>
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by store name, city, license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stores
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => {
                setStatusFilter('approved');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchPharmacies} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading pharmacies..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Pharmacies Found"
            description="No pharmacy stores match the current filter or search query."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Pharmacy Name</th>
                    <th className="px-4 py-3">License No.</th>
                    <th className="px-4 py-3">City / State</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Approval</th>
                    <th className="px-4 py-3">Active Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {pharmacy.name}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {pharmacy.operatingHours || 'Hours not listed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 font-semibold">
                        {pharmacy.licenseNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {pharmacy.city}, {pharmacy.state}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{pharmacy.contactPhone}</div>
                        <div className="text-[10px] text-slate-400">{pharmacy.contactEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pharmacy.isApproved ? 'Approved' : 'Pending'} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pharmacy.isActive ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPharmacy(pharmacy);
                              setDetailsModalOpen(true);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          {!pharmacy.isApproved && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  pharmacy,
                                  actionType: 'approve',
                                })
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}

                          {pharmacy.isActive && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  pharmacy,
                                  actionType: 'deactivate',
                                })
                              }
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagedData.totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Page {pagedData.pageNumber} of {pagedData.totalPages} ({pagedData.totalCount} total)
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

        {/* View Pharmacy Details Modal */}
        {detailsModalOpen && selectedPharmacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPharmacy.name}</h3>
                  <p className="text-xs text-slate-500">Pharmacy ID: {selectedPharmacy.id}</p>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Approval</span>
                    <StatusBadge status={selectedPharmacy.isApproved ? 'Approved' : 'Pending'} />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                    <StatusBadge status={selectedPharmacy.isActive ? 'Active' : 'Inactive'} />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">License Number</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">
                    {selectedPharmacy.licenseNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Full Address</span>
                  <p className="text-slate-800 font-medium">
                    {selectedPharmacy.address}, {selectedPharmacy.city}, {selectedPharmacy.state} {selectedPharmacy.zipCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">Phone</span>
                    <p className="text-slate-800">{selectedPharmacy.contactPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">Email</span>
                    <p className="text-slate-800">{selectedPharmacy.contactEmail || 'None'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">Operating Hours</span>
                    <p className="text-slate-800">{selectedPharmacy.operatingHours || 'Not listed'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">Inventory Count</span>
                    <p className="text-slate-800 font-bold">{selectedPharmacy.totalInventoryItems} items</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.open && confirmModal.pharmacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Confirm {confirmModal.actionType === 'approve' ? 'Approval' : 'Deactivation'}
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to {confirmModal.actionType === 'approve' ? 'approve' : 'deactivate'} store{' '}
                <span className="font-bold text-slate-900">"{confirmModal.pharmacy.name}"</span>?
                {confirmModal.actionType === 'approve'
                  ? ' This will enable the pharmacy to log inventory and accept reservation requests.'
                  : ' Deactivating will prevent the pharmacy from managing inventory or processing orders.'}
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => setConfirmModal({ open: false, pharmacy: null, actionType: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmModal.actionType === 'approve' ? 'primary' : 'danger'}
                  size="sm"
                  isLoading={actionLoading}
                  onClick={confirmModal.actionType === 'approve' ? handleApprove : handleDeactivate}
                >
                  Confirm {confirmModal.actionType === 'approve' ? 'Approve' : 'Deactivate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PharmacyManagementPage;
