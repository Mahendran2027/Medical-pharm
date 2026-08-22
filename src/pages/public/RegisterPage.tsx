import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CustomerRegisterDto, PharmacyRegisterDto } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerCustomer, registerPharmacy, login } = useAuth();

  const [accountType, setAccountType] = useState<'Customer' | 'Pharmacy'>('Customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Common User Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // Pharmacy Specific Fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('Mon-Sat: 8:00 AM - 8:00 PM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    // Validate common fields
    const errors: string[] = [];
    if (!firstName.trim()) errors.push('First name is required.');
    if (!lastName.trim()) errors.push('Last name is required.');
    if (!email.trim()) errors.push('Email address is required.');
    else if (!/\S+@\S+\.\S+/.test(email)) errors.push('Valid email address is required.');
    if (!phoneNumber.trim()) errors.push('Phone number is required.');
    if (!password) errors.push('Password is required.');
    else if (password.length < 6) errors.push('Password must be at least 6 characters.');

    if (accountType === 'Pharmacy') {
      if (!pharmacyName.trim()) errors.push('Pharmacy name is required.');
      if (!licenseNumber.trim()) errors.push('License number is required.');
      if (!address.trim()) errors.push('Pharmacy street address is required.');
      if (!city.trim()) errors.push('City is required.');
      if (!state.trim()) errors.push('State is required.');
      if (!contactPhone.trim()) errors.push('Pharmacy contact phone is required.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (accountType === 'Customer') {
        const payload: CustomerRegisterDto = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          password,
        };

        const res = await registerCustomer(payload);
        if (res && res.success) {
          setSuccessMessage('Customer account created successfully! Logging you in...');
          try {
            const loginRes = await login(email.trim(), password);
            if (loginRes && loginRes.success) {
              navigate('/customer/dashboard', { replace: true });
            } else {
              navigate('/login', { replace: true });
            }
          } catch {
            navigate('/login', { replace: true });
          }
        } else {
          const msg = res?.message || 'Registration failed.';
          setErrorMessage(msg);
          if (res?.errors) setValidationErrors(res.errors);
        }
      } else {
        const payload: PharmacyRegisterDto = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          password,
          pharmacyName: pharmacyName.trim(),
          licenseNumber: licenseNumber.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim() || undefined,
          contactPhone: contactPhone.trim() || phoneNumber.trim(),
          contactEmail: contactEmail.trim() || email.trim(),
          operatingHours: operatingHours.trim() || undefined,
        };

        const res = await registerPharmacy(payload);
        if (res && res.success) {
          setSuccessMessage('Pharmacy account created successfully! Logging you in...');
          try {
            const loginRes = await login(email.trim(), password);
            if (loginRes && loginRes.success) {
              navigate('/pharmacy/dashboard', { replace: true });
            } else {
              navigate('/login', { replace: true });
            }
          } catch {
            navigate('/login', { replace: true });
          }
        } else {
          const msg = res?.message || 'Pharmacy registration failed.';
          setErrorMessage(msg);
          if (res?.errors) setValidationErrors(res.errors);
        }
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Registration could not be completed. Please check your account details.';
      const serverErrors = err?.response?.data?.errors || [];
      setErrorMessage(serverMsg);
      setValidationErrors(serverErrors.length > 0 ? serverErrors : [serverMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="w-full max-w-2xl space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create a MediFind Account</h1>
            <p className="text-xs text-slate-600">
              Select your account type to register on the MediFind platform
            </p>
          </div>

          {/* Account Type Selector Tab */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAccountType('Customer');
                setValidationErrors([]);
                setErrorMessage(null);
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                accountType === 'Customer'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('Pharmacy');
                setValidationErrors([]);
                setErrorMessage(null);
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                accountType === 'Pharmacy'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pharmacy Partner
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
              {successMessage}
            </div>
          )}

          {(errorMessage || validationErrors.length > 0) && (
            <ErrorMessage
              title="Registration Error"
              message={errorMessage || undefined}
              errors={validationErrors}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                User Account Representative
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Pharmacy Specific Fields */}
            {accountType === 'Pharmacy' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pharmacy Store Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Pharmacy Business Name"
                    placeholder="CareFirst Pharmacy"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="License / Permit Number"
                    placeholder="PH-889021"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Input
                  label="Street Address"
                  placeholder="123 Health Ave, Suite 100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="e.g. Karur, Chennai, Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="State"
                    placeholder="Tamil Nadu"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="Zip Code"
                    placeholder="600006"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Store Contact Phone"
                    placeholder="+1 (555) 123-4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="Store Contact Email"
                    type="email"
                    placeholder="info@carefirstpharmacy.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <Input
                  label="Operating Hours"
                  placeholder="Mon-Sat: 8am - 8pm, Sun: Closed"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              Register {accountType === 'Pharmacy' ? 'Pharmacy Partner' : 'Customer Account'}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;
