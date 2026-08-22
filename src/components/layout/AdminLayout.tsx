import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    notificationService
      .getNotifications(1, 20, true)
      .then((res) => {
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
          const unread = items.filter((n) => !n.isRead).length;
          setUnreadNotificationCount(unread);
        }
      })
      .catch(() => {
        // Silently handle
      });
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'User Management', path: '/admin/users', icon: '👥' },
    { label: 'Pharmacy Approvals', path: '/admin/pharmacies', icon: '🏪' },
    { label: 'Medicine Catalog', path: '/admin/medicines', icon: '💊' },
    { label: 'Category Management', path: '/admin/categories', icon: '🏷️' },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: '📈' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔', badge: unreadNotificationCount },
    { label: 'Admin Profile', path: '/admin/profile', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            M
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">MediFind</span>
            <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
              🛡️
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg hidden sm:inline-block">
                Platform Oversight
              </span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-extrabold rounded-full uppercase tracking-wide">
                System Administrator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                {user?.firstName?.[0] || 'A'}
              </div>
              <span className="text-sm font-semibold text-slate-800 hidden sm:inline-block">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 text-white px-4 py-4 space-y-2 border-b border-slate-800">
            <div className="p-2 border-b border-slate-800 mb-2">
              <p className="text-sm font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg mt-2"
            >
              🚪 Sign Out
            </button>
          </div>
        )}

        {/* Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
