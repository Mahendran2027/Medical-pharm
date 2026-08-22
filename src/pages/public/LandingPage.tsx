import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide">
              <span>Healthcare Supply Transparency</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Real-Time Medicine Availability Across Local Pharmacies
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              MediFind connects participating pharmacies so you can check live medicine availability, view location details, and request holds before making the trip.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Link to="/search">
                <Button size="lg" className="w-full sm:w-auto">
                  Search Medicine Availability
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Register Your Pharmacy
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              * Stock information is updated directly by participating local pharmacies.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Problem Card */}
            <div className="bg-rose-50/60 rounded-2xl p-8 border border-rose-100 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                !
              </div>
              <h2 className="text-2xl font-bold text-slate-900">The Problem</h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                Patients and caregivers often waste crucial hours traveling from one pharmacy to another, calling around, or waiting in line only to discover that prescribed medicines are out of stock.
              </p>
            </div>

            {/* Solution Card */}
            <div className="bg-emerald-50/60 rounded-2xl p-8 border border-emerald-100 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-slate-900">The MediFind Solution</h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                MediFind unites participating pharmacies in a single searchable network. Search for essential prescriptions or over-the-counter products, view stock status, and request temporary holds with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How MediFind Works</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Connecting customers with participating pharmacy inventories in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Search for Medicine</h3>
              <p className="text-xs text-slate-600">
                Enter the medicine brand or generic name and optional city location filter.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">View Stock & Pricing</h3>
              <p className="text-xs text-slate-600">
                Browse participating pharmacies with verified available stock, address, and unit prices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Request Reservation</h3>
              <p className="text-xs text-slate-600">
                Submit a reservation request for your required quantity directly to the pharmacy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pharmacy Confirms</h3>
              <p className="text-xs text-slate-600">
                The pharmacy reviews and approves your reservation hold, ready for pickup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Designed specifically for healthcare consumers, pharmacy operators, and system administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Stock-Aware Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter medicine listings by live quantity-on-hand values, location distance, and dosage forms.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Participating Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify licensed local pharmacies with approved platform accounts, store contact info, and hours.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Reservation Requests</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hold necessary medicines for up to 24 hours with unique reservation tracking codes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Low-Stock Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated inventory monitoring alerts pharmacy managers when critical items fall below thresholds.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Pharmacy Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlined batch updates, price adjustments, stock logs, and reservation status changes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
              <h3 className="font-bold text-slate-900">Secure Role-Based Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                JWT-secured access with granular role permissions for Customers, Pharmacy Managers, and Admins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Find or List Medicines?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join MediFind today to search for essential medications or onboard your pharmacy store to help local patients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link to="/search">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white">
                Search Medicine Catalog
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-slate-700 bg-slate-800 hover:bg-slate-700">
                Register as a Pharmacy
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
