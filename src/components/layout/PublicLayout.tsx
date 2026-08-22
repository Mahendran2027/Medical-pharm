import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin/dashboard';
    if (user.role === 'Pharmacy') return '/pharmacy/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-emerald-700 transition-colors">
                  M
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    MediFind
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
                    Pharmacy Stock Network
                  </span>
                </div>
              </Link>

              {/* Desktop Links */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/search"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/search' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Search Medicine
                </Link>
              </nav>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to={getDashboardPath()}>
                    <Button variant="outline" size="sm">
                      Dashboard ({user?.firstName})
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
            >
              Search Medicine
            </Link>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      My Dashboard ({user?.firstName})
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                  M
                </div>
                <span className="text-lg font-bold text-slate-900">MediFind</span>
              </div>
              <p className="text-sm font-medium text-slate-700">
                Find medicine availability from participating pharmacies.
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                Disclaimer: MediFind displays real-time inventory information submitted by participating licensed pharmacies. Availability is subject to change at the store level.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
                <li><Link to="/search" className="hover:text-emerald-600">Find Medicine</Link></li>
                <li><Link to="/login" className="hover:text-emerald-600">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600">Pharmacy Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Roles & Access</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Customer Medicine Search</li>
                <li>Pharmacy Inventory Dashboard</li>
                <li>Reservation Management</li>
                <li>Admin Oversight & Approvals</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MediFind. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Real-Time Healthcare Stock Visibility Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
