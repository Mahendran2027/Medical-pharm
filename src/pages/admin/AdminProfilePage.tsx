import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { UpdateUserDto, UserResponseDto } from '../../types';

export const AdminProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserDto>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getCurrentUserProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phoneNumber: res.data.phoneNumber || '',
        });
      } else {
        setError(res.message || 'Failed to fetch admin profile.');
      }
    } catch {
      setError('An error occurred while loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await userService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMsg('Profile updated successfully.');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch {
      setError('Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your administrator account personal details and contact information.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex justify-between items-center">
            <span>✅ {successMsg}</span>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchProfile} />}

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading profile..." />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
            {/* Account Card Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {profile?.firstName?.[0] || authUser?.firstName?.[0] || 'A'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={profile?.role || 'Admin'} />
                  <StatusBadge status={profile?.isActive ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Email Address</label>
                <Input value={profile?.email || ''} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                <p className="text-[10px] text-slate-400 mt-1">
                  System email address cannot be changed directly from profile.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" isLoading={submitting}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
