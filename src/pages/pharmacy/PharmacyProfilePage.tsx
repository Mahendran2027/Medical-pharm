import React, { useEffect, useState } from 'react';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import pharmacyService from '../../services/pharmacyService';
import { PharmacyResponseDto, UpdatePharmacyDto } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export const PharmacyProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pharmacy, setPharmacy] = useState<PharmacyResponseDto | null>(null);
  const [formData, setFormData] = useState<UpdatePharmacyDto>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    contactEmail: '',
    operatingHours: 'Mon-Fri 8:00 AM - 8:00 PM',
  });

  useEffect(() => {
    fetchPharmacyProfile();
  }, []);

  const fetchPharmacyProfile = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await pharmacyService.getMyPharmacyProfile();
      if (response.success && response.data) {
        const p = response.data;
        setPharmacy(p);
        setFormData({
          name: p.name || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          zipCode: p.zipCode || '',
          latitude: p.latitude,
          longitude: p.longitude,
          contactPhone: p.contactPhone || '',
          contactEmail: p.contactEmail || '',
          operatingHours: p.operatingHours || 'Mon-Fri 8:00 AM - 8:00 PM',
        });
      } else {
        setErrorMessage(response.message || 'Failed to load pharmacy profile.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error communicating with pharmacy profile service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.contactPhone) {
      setErrorMessage('Please fill in all required pharmacy contact and location fields.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await pharmacyService.updateMyPharmacyProfile(formData);
      if (response.success && response.data) {
        setPharmacy(response.data);
        setSuccessMessage('Pharmacy profile updated successfully.');
      } else {
        setErrorMessage(response.message || 'Failed to update pharmacy profile.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Error updating pharmacy profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PharmacyLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy Profile Settings</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Update your public store location, operating hours, and customer contact information.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {successMessage}
          </div>
        )}

        {errorMessage && <ErrorMessage message={errorMessage} onRetry={fetchPharmacyProfile} />}

        {isLoading ? (
          <LoadingSpinner label="Loading pharmacy details..." />
        ) : !pharmacy ? (
          <EmptyState title="Profile Not Found" description="Could not load pharmacy details." />
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            {/* Top Store Identity & Status Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{pharmacy.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  License #: <span className="font-bold text-slate-800">{pharmacy.licenseNumber}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {pharmacy.isApproved ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    ✅ Admin Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
                    ⏳ Approval Pending
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Pharmacy Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Operating Hours"
                name="operatingHours"
                placeholder="e.g. Mon-Fri 8:00 AM - 8:00 PM, Sat 9:00 AM - 5:00 PM"
                value={formData.operatingHours || ''}
                onChange={handleChange}
                helperText="Displayed to customers on medicine stock listings."
              />

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default PharmacyProfilePage;
