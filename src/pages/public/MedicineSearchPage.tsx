import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import medicineService from '../../services/medicineService';
import reservationService from '../../services/reservationService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { MedicineSearchResponseDto, PharmacyStockAvailabilityDto } from '../../types';

interface ConfirmedReservationDetails {
  reservationCode: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  pharmacyCity: string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  quantityRequested: number;
  unitPrice: number;
  totalAmount: number;
  requestedAt: string;
  expiresAt: string;
  customerName: string;
  customerPhone?: string;
  customerNote?: string;
}

export const MedicineSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MedicineSearchResponseDto[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reservation Modal State
  const [selectedStockForPickup, setSelectedStockForPickup] = useState<{
    medicine: MedicineSearchResponseDto;
    pharmacy: PharmacyStockAvailabilityDto;
  } | null>(null);

  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [customerNote, setCustomerNote] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [reservationModalError, setReservationModalError] = useState<string | null>(null);

  // Confirmed Receipt Modal State
  const [confirmedReservation, setConfirmedReservation] = useState<ConfirmedReservationDetails | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const popularCities = ['Karur', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'];
  const popularMedicines = ['Paracetamol', 'Amoxicillin', 'Metformin', 'Dolo', 'Azithromycin', 'Omeprazole', 'Cetirizine'];

  const executeSearch = async (targetQuery?: string, targetCity?: string) => {
    setErrorMessage(null);

    const q = targetQuery !== undefined ? targetQuery : query;
    const c = targetCity !== undefined ? targetCity : city;

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setIsSearching(true);
    setSearched(true);

    try {
      const response = await medicineService.searchMedicines(q.trim(), c.trim() || undefined);
      if (response && response.success && response.data) {
        setResults(response.data);
      } else {
        setErrorMessage(response?.message || 'Failed to retrieve stock data.');
        setResults([]);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'An error occurred while communicating with the inventory search service.'
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Update URL query params
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city.trim()) params.set('city', city.trim());
    navigate(`/search?${params.toString()}`, { replace: true });
    executeSearch(query, city);
  };

  // Perform search on mount or URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const qParam = searchParams.get('q') || '';
    const cParam = searchParams.get('city') || '';

    if (qParam) setQuery(qParam);
    if (cParam) setCity(cParam);

    if (qParam.trim()) {
      executeSearch(qParam, cParam);
    } else {
      setResults([]);
      setSearched(false);
    }
  }, [location.search]);

  const handleInitiatePickup = (
    medicine: MedicineSearchResponseDto,
    pharmacy: PharmacyStockAvailabilityDto
  ) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (user?.role !== 'Customer') {
      setErrorMessage(
        'In-store pickup reservations are designed for Customer accounts. Please sign in with a Customer account.'
      );
      return;
    }

    setSelectedStockForPickup({ medicine, pharmacy });
    setRequestedQuantity(1);
    setCustomerNote('');
    setReservationModalError(null);
  };

  const handleConfirmReservation = async () => {
    if (!selectedStockForPickup) return;

    const { medicine, pharmacy } = selectedStockForPickup;

    if (requestedQuantity < 1) {
      setReservationModalError('Quantity must be at least 1 unit.');
      return;
    }

    if (requestedQuantity > pharmacy.availableQuantity) {
      setReservationModalError(
        `Quantity cannot exceed live available store stock of ${pharmacy.availableQuantity} units.`
      );
      return;
    }

    setIsReserving(true);
    setReservationModalError(null);

    try {
      const response = await reservationService.createReservation({
        pharmacyInventoryId: pharmacy.pharmacyInventoryId,
        quantityRequested: requestedQuantity,
        customerNote: customerNote.trim() || undefined,
      });

      if (response.success && response.data) {
        const data = response.data;
        // Build confirmed receipt data
        const receipt: ConfirmedReservationDetails = {
          reservationCode: data.reservationCode || `RES-${Math.floor(100000 + Math.random() * 900000)}`,
          pharmacyName: data.pharmacyName || pharmacy.pharmacyName,
          pharmacyAddress: data.pharmacyAddress || `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zipCode || ''}`.trim(),
          pharmacyPhone: data.pharmacyPhone || pharmacy.contactPhone || '+91 4324 260 100',
          pharmacyCity: data.pharmacyCity || pharmacy.city,
          medicineName: data.medicineName || medicine.name,
          strength: medicine.strength,
          dosageForm: medicine.dosageForm,
          quantityRequested: data.quantityRequested || requestedQuantity,
          unitPrice: data.unitPrice || pharmacy.unitPrice || 0,
          totalAmount: (data.unitPrice || pharmacy.unitPrice || 0) * (data.quantityRequested || requestedQuantity),
          requestedAt: data.requestedAt || new Date().toISOString(),
          expiresAt: data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
          customerName: data.customerName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
          customerPhone: user?.phoneNumber,
          customerNote: customerNote.trim() || undefined,
        };

        setConfirmedReservation(receipt);
        setSelectedStockForPickup(null);

        // Re-execute search to reflect live updated stock
        executeSearch();
      } else {
        setReservationModalError(response.message || 'Failed to place in-store pickup reservation.');
      }
    } catch (err: any) {
      setReservationModalError(
        err?.response?.data?.message || 'Error occurred while confirming in-store pickup reservation.'
      );
    } finally {
      setIsReserving(false);
    }
  };

  const copyReservationCode = () => {
    if (!confirmedReservation?.reservationCode) return;
    navigator.clipboard.writeText(confirmedReservation.reservationCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Search Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                🏬 Live Pharmacy Network
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Search Medicines by Store & City
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Find matching pharmacies in your city with real-time stock, live unit prices, full store addresses, contact numbers, and reserve for immediate in-store pickup.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <Input
                  label="Medicine / Brand / Generic Name *"
                  placeholder="e.g. Paracetamol, Amoxicillin, Dolo 650, Limcee"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-4">
                <Input
                  label="City / Location (Optional)"
                  placeholder="e.g. Karur (Leave blank for all nearby shops)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full h-[42px] font-bold shadow-xs"
                  isLoading={isSearching}
                >
                  🔍 Search Stock
                </Button>
              </div>
            </form>

            {/* Quick Filter Tags */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700">Filter by City:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCity('');
                    if (query.trim()) {
                      executeSearch(query, '');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    !city
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌐 All Nearby Stores
                </button>
                {popularCities.map((cityName) => (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => {
                      setCity(cityName);
                      if (query.trim()) {
                        executeSearch(query, cityName);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      city.toLowerCase() === cityName.toLowerCase()
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📍 {cityName}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700">Suggested:</span>
                {popularMedicines.slice(0, 4).map((medName) => (
                  <button
                    key={medName}
                    type="button"
                    onClick={() => {
                      setQuery(medName);
                      executeSearch(medName, city);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                    {medName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && <ErrorMessage message={errorMessage} onRetry={() => executeSearch()} />}

          {/* Results Section */}
          {isSearching ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
              <LoadingSpinner label={`Checking real-time stock for "${query}" ${city ? `in ${city}` : 'across all nearby stores'}...`} />
            </div>
          ) : !searched ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                💊
              </div>
              <h2 className="text-lg font-bold text-slate-900">Enter a Medicine Name to Search</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Search for medicines like <span className="font-semibold text-emerald-700">"Paracetamol"</span>, <span className="font-semibold text-emerald-700">"Limcee"</span>, or <span className="font-semibold text-emerald-700">"Amoxicillin"</span> to query all pharmacies in the active database and see matching shops with live stock.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery('Paracetamol');
                    setCity('Karur');
                    executeSearch('Paracetamol', 'Karur');
                  }}
                >
                  Try "Paracetamol" in "Karur"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery('Amoxicillin');
                    setCity('');
                    executeSearch('Amoxicillin', '');
                  }}
                >
                  Try "Amoxicillin" (All Nearby Stores)
                </Button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title={city ? `No pharmacies found with stock in "${city}"` : `No pharmacies found with stock for "${query}"`}
              description={
                city
                  ? `We could not find matching stock for "${query}" in ${city}. Try searching without a city filter to see all nearby shops.`
                  : `We could not find matching active stock (quantity > 0) for "${query}" across participating pharmacies.`
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setCity('');
                    setSearched(false);
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Search Results {city ? <span>in <span className="text-emerald-700 font-extrabold">{city}</span></span> : <span className="text-emerald-700 font-extrabold">(All Nearby Stores)</span>} ({results.length} medicine{results.length > 1 ? 's' : ''})
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Live Stock & Price verified from store inventories
                </span>
              </div>

              {results.map((medicine) => (
                <div
                  key={medicine.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                >
                  {/* Medicine Header Bar */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          {medicine.name}
                        </h3>
                        {medicine.strength && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded-md">
                            {medicine.strength}
                          </span>
                        )}
                        {medicine.dosageForm && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-md font-medium">
                            {medicine.dosageForm}
                          </span>
                        )}
                        {medicine.categoryName && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium rounded-md">
                            {medicine.categoryName}
                          </span>
                        )}
                        {medicine.requiresPrescription && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-md">
                            ⚠️ Rx Required
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap">
                        {medicine.genericName && (
                          <span>Generic: <strong className="text-slate-800">{medicine.genericName}</strong></span>
                        )}
                        {medicine.brandName && (
                          <span>• Brand: <strong className="text-slate-800">{medicine.brandName}</strong></span>
                        )}
                        {medicine.manufacturer && (
                          <span>• Mfr: <span className="text-slate-700">{medicine.manufacturer}</span></span>
                        )}
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <div className="text-xs text-slate-500 font-medium">
                        Matching Stores {city ? `in ${city}` : 'Nearby'}
                      </div>
                      <div className="text-base font-bold text-emerald-700">
                        {medicine.availablePharmacies?.length || 0} Pharmac{medicine.availablePharmacies?.length === 1 ? 'y' : 'ies'} with Stock
                      </div>
                    </div>
                  </div>

                  {/* Matching Pharmacies List */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Participating Shops {city ? `in ${city}` : 'with Available Stock'}
                    </h4>

                    {(!medicine.availablePharmacies || medicine.availablePharmacies.length === 0) ? (
                      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                        No pharmacies currently have live stock of this medicine {city ? `in ${city}` : ''}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {medicine.availablePharmacies.map((pharmacy) => {
                          const isLowStock = pharmacy.isLowStock || pharmacy.availableQuantity <= 5;

                          return (
                            <div
                              key={pharmacy.pharmacyInventoryId}
                              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                            >
                              <div className="space-y-3">
                                {/* Store Title & Verification Badge */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-base font-bold text-slate-900">
                                        {pharmacy.pharmacyName}
                                      </h5>
                                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                                        ✓ Verified Store
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      🕒 Hours: {pharmacy.operatingHours || 'Mon-Sat: 7:30 AM - 10:30 PM'}
                                    </p>
                                  </div>

                                  {/* Price Tag */}
                                  <div className="text-right shrink-0">
                                    <div className="text-xs text-slate-500">Unit Price</div>
                                    <div className="text-lg font-black text-slate-900">
                                      ₹{Number(pharmacy.unitPrice).toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                {/* Full Store Address & Phone Number */}
                                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700 border border-slate-100">
                                  <div className="flex items-start gap-2">
                                    <span className="text-slate-400 shrink-0 mt-0.5">📍</span>
                                    <span className="leading-relaxed">
                                      <strong className="text-slate-900">Address:</strong>{' '}
                                      {pharmacy.address}, {pharmacy.city}, {pharmacy.state}{pharmacy.zipCode ? ` - ${pharmacy.zipCode}` : ''}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 shrink-0">📞</span>
                                    <span>
                                      <strong className="text-slate-900">Contact:</strong>{' '}
                                      <a
                                        href={`tel:${pharmacy.contactPhone}`}
                                        className="text-emerald-700 font-bold hover:underline"
                                      >
                                        {pharmacy.contactPhone || '+91 4324 260 100'}
                                      </a>
                                    </span>
                                  </div>
                                </div>

                                {/* Stock Quantity Badge */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                                        isLowStock
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                        }`}
                                      />
                                      {pharmacy.availableQuantity} Units Live in Stock
                                    </span>
                                    {isLowStock && (
                                      <span className="text-amber-700 text-xs font-semibold">
                                        Limited Stock
                                      </span>
                                    )}
                                  </div>

                                  {pharmacy.lastStockUpdate && (
                                    <span className="text-[11px] text-slate-400">
                                      Stock Updated Recently
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Store Pickup / Reservation Button */}
                              <div className="pt-3 border-t border-slate-100">
                                <Button
                                  variant="primary"
                                  size="md"
                                  className="w-full flex items-center justify-center gap-2 font-bold shadow-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => handleInitiatePickup(medicine, pharmacy)}
                                >
                                  <span>🛍️</span>
                                  <span>Reserve for In-Store Pickup</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. In-Store Pickup Reservation Modal                                      */}
      {/* ========================================================================= */}
      {selectedStockForPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                  🏬 In-Store Pickup Request
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Reserve at {selectedStockForPickup.pharmacy.pharmacyName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStockForPickup(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            {/* Error in modal */}
            {reservationModalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {reservationModalError}
              </div>
            )}

            {/* Medicine & Store Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {selectedStockForPickup.medicine.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {selectedStockForPickup.medicine.strength || ''} {selectedStockForPickup.medicine.dosageForm || ''} • {selectedStockForPickup.medicine.genericName || ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Unit Price</div>
                  <div className="text-base font-bold text-slate-900">
                    ₹{Number(selectedStockForPickup.pharmacy.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-400">📍</span>
                  <span>
                    <strong className="text-slate-800">Shop Address:</strong>{' '}
                    {selectedStockForPickup.pharmacy.address}, {selectedStockForPickup.pharmacy.city}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">📞</span>
                  <span>
                    <strong className="text-slate-800">Phone:</strong>{' '}
                    {selectedStockForPickup.pharmacy.contactPhone || '+91 4324 260 100'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">
                  Select Pickup Quantity
                </label>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedStockForPickup.pharmacy.availableQuantity} Units Available
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setRequestedQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={requestedQuantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedStockForPickup.pharmacy.availableQuantity}
                    value={requestedQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) {
                        setRequestedQuantity(1);
                      } else {
                        setRequestedQuantity(Math.min(val, selectedStockForPickup.pharmacy.availableQuantity));
                      }
                    }}
                    className="w-16 h-11 text-center font-bold text-slate-900 border-x border-slate-200 focus:outline-hidden text-base"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRequestedQuantity((prev) =>
                        Math.min(selectedStockForPickup.pharmacy.availableQuantity, prev + 1)
                      )
                    }
                    disabled={requestedQuantity >= selectedStockForPickup.pharmacy.availableQuantity}
                    className="w-11 h-11 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-xs text-slate-500">Estimated Total Due at Counter</div>
                  <div className="text-xl font-extrabold text-emerald-700">
                    ₹{(requestedQuantity * (selectedStockForPickup.pharmacy.unitPrice || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Pickup Note / Instructions */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Pickup Notes (Optional)
              </label>
              <textarea
                placeholder="e.g. Will collect today by 5 PM, please keep packaged..."
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* In-Store Pickup Details Info Box */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> In-Store Pickup Terms:
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-emerald-800">
                <li>Your medicine is held securely for <strong>24 hours</strong>.</li>
                <li>Pay the total amount (<strong>₹{(requestedQuantity * (selectedStockForPickup.pharmacy.unitPrice || 0)).toFixed(2)}</strong>) directly at the shop counter upon pickup.</li>
                {selectedStockForPickup.medicine.requiresPrescription && (
                  <li className="font-semibold text-amber-900">Please bring your valid Doctor's Prescription slip to the store.</li>
                )}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedStockForPickup(null)}
                disabled={isReserving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={handleConfirmReservation}
                isLoading={isReserving}
              >
                Confirm In-Store Pickup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Pickup Confirmation & Store Receipt Details Modal                       */}
      {/* ========================================================================= */}
      {confirmedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

            {/* Success Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
                ✓
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Pickup Reservation Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Your medicines are reserved. Show your pickup code at the store counter to collect directly at the shop.
              </p>
            </div>

            {/* Highlighted Reservation Code */}
            <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Your Store Pickup Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-950 tracking-wider">
                  {confirmedReservation.reservationCode}
                </span>
                <button
                  type="button"
                  onClick={copyReservationCode}
                  className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold text-emerald-800 transition-colors shadow-2xs"
                >
                  {isCopied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700">
                Held until: <strong>{new Date(confirmedReservation.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
              </p>
            </div>

            {/* Shop Details Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Store Pickup Location
              </h4>

              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 text-base">
                  🏬 {confirmedReservation.pharmacyName}
                </div>
                <div className="text-slate-700 leading-relaxed">
                  📍 {confirmedReservation.pharmacyAddress}
                </div>
                <div className="text-slate-700 pt-1 flex items-center justify-between">
                  <span>
                    📞 Phone: <strong className="text-slate-900">{confirmedReservation.pharmacyPhone}</strong>
                  </span>
                  <a
                    href={`tel:${confirmedReservation.pharmacyPhone}`}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Call Store
                  </a>
                </div>
              </div>
            </div>

            {/* Item & Price Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider">
                Reserved Items
              </h4>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="font-medium text-slate-800">
                  {confirmedReservation.medicineName} ({confirmedReservation.strength || 'Standard'}) × {confirmedReservation.quantityRequested}
                </span>
                <span className="font-bold text-slate-900">
                  ₹{(confirmedReservation.quantityRequested * confirmedReservation.unitPrice).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 font-bold text-sm text-slate-900">
                <span>Total Amount Due at Counter:</span>
                <span className="text-emerald-700 text-base">
                  ₹{confirmedReservation.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step by step Instructions */}
            <div className="text-xs text-slate-600 bg-slate-100/70 p-3.5 rounded-xl space-y-1">
              <div className="font-bold text-slate-800">How to collect your medicine:</div>
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>Visit <strong>{confirmedReservation.pharmacyName}</strong> in <strong>{confirmedReservation.pharmacyCity}</strong>.</li>
                <li>Provide your Pickup Code (<strong>{confirmedReservation.reservationCode}</strong>) at the billing counter.</li>
                <li>Verify your medicines and pay <strong>₹{confirmedReservation.totalAmount.toFixed(2)}</strong> via Cash, UPI, or Card.</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to="/customer/reservations"
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                View in My Reservations
              </Link>
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-1/2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setConfirmedReservation(null)}
              >
                Done / Search More
              </Button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default MedicineSearchPage;
