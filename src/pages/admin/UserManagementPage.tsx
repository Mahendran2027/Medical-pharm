import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import adminService from '../../services/adminService';
import { PagedResponse, UserResponseDto } from '../../types';

export const UserManagementPage: React.FC = () => {
  const [pagedData, setPagedData] = useState<PagedResponse<UserResponseDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers(page, 10, roleFilter || undefined);
      if (res.success && res.data) {
        setPagedData(res.data);
      } else {
        setError(res.message || 'Failed to fetch user directory.');
      }
    } catch {
      setError('An error occurred while communicating with the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleViewDetails = async (id: string) => {
    try {
      const res = await adminService.getUserById(id);
      if (res.success && res.data) {
        setSelectedUser(res.data);
        setViewModalOpen(true);
      }
    } catch {
      // fallback
    }
  };

  // Client-side search filtering on current page items if search is entered
  const filteredItems = pagedData.items.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phoneNumber.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Registered customers, pharmacy managers, and administrators.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Notice on supported operations */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            Showing system registered users. Filter by role or search name and email.
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'Customer', label: 'Customer' },
                { value: 'Pharmacy', label: 'Pharmacy' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading users list..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="No user records match the selected role or search criteria."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">User Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{user.phoneNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
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

        {/* View Details Modal */}
        {viewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">User Details</h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">User ID</span>
                  <span className="text-slate-800 font-mono text-[11px]">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Full Name</span>
                  <span className="text-slate-900 font-bold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="text-slate-800">{selectedUser.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Role</span>
                  <StatusBadge status={selectedUser.role} />
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Account Status</span>
                  <StatusBadge status={selectedUser.isActive ? 'Active' : 'Inactive'} />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Registration Date</span>
                  <span className="text-slate-800">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;
