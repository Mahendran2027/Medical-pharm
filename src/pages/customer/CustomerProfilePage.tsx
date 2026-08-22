import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getCurrentUserProfile();
      if (res.success && res.data) {
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phoneNumber: res.data.phoneNumber || '',
        });
      }
    } catch {
      // Fallback to authContext user data
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await userService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      if (response.success) {
        setSuccessMessage('Profile information updated successfully.');
      } else {
        setErrorMessage(response.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error updating profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your contact information used by pharmacies for order updates.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {successMessage}
          </div>
        )}

        {errorMessage && <ErrorMessage message={errorMessage} />}

        {isLoading ? (
          <LoadingSpinner label="Loading profile..." />
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-full bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center">
                {user?.firstName?.[0] || 'C'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                  Role: {user?.role || 'Customer'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email Address (Account ID)"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  helperText="Email address cannot be changed."
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  helperText="Pharmacies will use this number to contact you regarding medicine pickup."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfilePage;
