import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get return URL from location state if user was redirected from a protected route
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationErrors([]);

    // Client-side validation
    const errors: string[] = [];
    if (!email.trim()) errors.push('Email address is required.');
    else if (!/\S+@\S+\.\S+/.test(email)) errors.push('Please enter a valid email address.');

    if (!password) errors.push('Password is required.');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(email.trim(), password);

      if (response && response.success && response.data) {
        const role = response.data.user.role;
        
        if (fromLocation) {
          navigate(fromLocation, { replace: true });
        } else if (role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'Pharmacy') {
          navigate('/pharmacy/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      } else {
        const msg = response?.message || 'Login failed. Please check your credentials.';
        setErrorMessage(msg);
        if (response?.errors && response.errors.length > 0) {
          setValidationErrors(response.errors);
        }
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Invalid login credentials. Please check your email address and password.';
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
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In to MediFind</h1>
            <p className="text-xs text-slate-600">Access your customer account or pharmacy portal</p>
          </div>

          {(errorMessage || validationErrors.length > 0) && (
            <ErrorMessage
              title="Authentication Error"
              message={errorMessage || undefined}
              errors={validationErrors}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
                Create an Account
              </Link>
            </p>
            <p className="text-slate-400">
              Are you a pharmacy owner? Register to list your inventory.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
