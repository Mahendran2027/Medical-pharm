import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// LocalStorage Keys
const STORAGE_KEYS = {
  USERS: 'medifind_mock_users',
  PHARMACIES: 'medifind_mock_pharmacies',
  CATEGORIES: 'medifind_mock_categories',
  MEDICINES: 'medifind_mock_medicines',
  INVENTORY: 'medifind_mock_inventory',
  RESERVATIONS: 'medifind_mock_reservations',
  NOTIFICATIONS: 'medifind_mock_notifications',
};

// Initial Seed Data - Tamil Nadu Focus
const defaultUsers = [
  {
    id: 'u-1',
    firstName: 'Arun',
    lastName: 'Kumar',
    email: 'customer@medifind.com',
    phoneNumber: '+91 98765 43210',
    role: 'Customer',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-2',
    firstName: 'Sujatha',
    lastName: 'Raman',
    email: 'pharmacy@medifind.com',
    phoneNumber: '+91 44 2829 1000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-3',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@medifind.com',
    phoneNumber: '+91 99000 11111',
    role: 'Admin',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-4',
    firstName: 'Rajesh',
    lastName: 'Kannan',
    email: 'kovai@medifind.com',
    phoneNumber: '+91 422 252 4000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-5',
    firstName: 'Anitha',
    lastName: 'Ramesh',
    email: 'madurai@medifind.com',
    phoneNumber: '+91 452 253 9000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-6',
    firstName: 'Sundar',
    lastName: 'Rajan',
    email: 'trichy@medifind.com',
    phoneNumber: '+91 431 274 5000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-7',
    firstName: 'Karthik',
    lastName: 'Selvam',
    email: 'salem@medifind.com',
    phoneNumber: '+91 427 244 8000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-8',
    firstName: 'Muthu',
    lastName: 'Krishnan',
    email: 'nellai@medifind.com',
    phoneNumber: '+91 462 257 3000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-9',
    firstName: 'Vijay',
    lastName: 'Anand',
    email: 'erode@medifind.com',
    phoneNumber: '+91 424 222 1000',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-10',
    firstName: 'Periasamy',
    lastName: 'Natarajan',
    email: 'karur.central@medifind.com',
    phoneNumber: '+91 4324 260 100',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-11',
    firstName: 'Senthil',
    lastName: 'Murugan',
    email: 'kovai.road@medifind.com',
    phoneNumber: '+91 4324 234 500',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-12',
    firstName: 'Ganesh',
    lastName: 'Kumar',
    email: 'busstand.karur@medifind.com',
    phoneNumber: '+91 4324 220 800',
    role: 'Pharmacy',
    password: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const defaultPharmacies = [
  {
    id: 'p-1',
    userId: 'u-2',
    name: 'CareFirst Meds & Healthcare',
    pharmacyName: 'CareFirst Meds & Healthcare',
    licenseNumber: 'TN-PH-992102',
    address: '124 Anna Salai, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '600006',
    contactPhone: '+91 44 2829 1000',
    contactEmail: 'pharmacy@medifind.com',
    operatingHours: 'Mon-Sat: 8:00 AM - 10:00 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 4,
  },
  {
    id: 'p-2',
    userId: 'u-4',
    name: 'Metro Kovai Pharmacy',
    pharmacyName: 'Metro Kovai Pharmacy',
    licenseNumber: 'TN-PH-441209',
    address: '100 Cross Cut Road, Gandhipuram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    zipCode: '641012',
    contactPhone: '+91 422 252 4000',
    contactEmail: 'contact@kovaipharmacy.com',
    operatingHours: '24 Hours Open',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 4,
  },
  {
    id: 'p-3',
    userId: 'u-5',
    name: 'Meenakshi Healthcare Pharmacy',
    pharmacyName: 'Meenakshi Healthcare Pharmacy',
    licenseNumber: 'TN-PH-331002',
    address: '12 West Tower Street, Madurai Main',
    city: 'Madurai',
    state: 'Tamil Nadu',
    zipCode: '625001',
    contactPhone: '+91 452 253 9000',
    contactEmail: 'care@meenakshipharma.in',
    operatingHours: 'Mon-Sun: 7:00 AM - 11:00 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 3,
  },
  {
    id: 'p-4',
    userId: 'u-6',
    name: 'Cauvery MedStore',
    pharmacyName: 'Cauvery MedStore',
    licenseNumber: 'TN-PH-554109',
    address: '24 Thillai Nagar Main Road',
    city: 'Trichy',
    state: 'Tamil Nadu',
    zipCode: '620018',
    contactPhone: '+91 431 274 5000',
    contactEmail: 'support@cauverymeds.com',
    operatingHours: 'Mon-Sat: 8:00 AM - 9:30 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 3,
  },
  {
    id: 'p-5',
    userId: 'u-7',
    name: 'Salem Central Pharmacy',
    pharmacyName: 'Salem Central Pharmacy',
    licenseNumber: 'TN-PH-662018',
    address: '150 Omalur Main Road, Fairlands',
    city: 'Salem',
    state: 'Tamil Nadu',
    zipCode: '636016',
    contactPhone: '+91 427 244 8000',
    contactEmail: 'salemcentralrx@gmail.com',
    operatingHours: 'Mon-Sat: 8:30 AM - 10:00 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 3,
  },
  {
    id: 'p-6',
    userId: 'u-8',
    name: 'Nellai Care Pharmacy',
    pharmacyName: 'Nellai Care Pharmacy',
    licenseNumber: 'TN-PH-771802',
    address: '88 Palayamkottai High Road',
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    zipCode: '627002',
    contactPhone: '+91 462 257 3000',
    contactEmail: 'contact@nellaicarepharma.in',
    operatingHours: '24 Hours',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 3,
  },
  {
    id: 'p-7',
    userId: 'u-9',
    name: 'Kongu Wellness Pharmacy',
    pharmacyName: 'Kongu Wellness Pharmacy',
    licenseNumber: 'TN-PH-889021',
    address: '42 Brough Road',
    city: 'Erode',
    state: 'Tamil Nadu',
    zipCode: '638001',
    contactPhone: '+91 424 222 1000',
    contactEmail: 'info@konguwellness.com',
    operatingHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 9,
  },
  {
    id: 'p-8',
    userId: 'u-10',
    name: 'Karur Central Pharmacy',
    pharmacyName: 'Karur Central Pharmacy',
    licenseNumber: 'TN-PH-432001',
    address: '15 Jawahar Bazaar, Near Five Road Junction',
    city: 'Karur',
    state: 'Tamil Nadu',
    zipCode: '639001',
    contactPhone: '+91 4324 260 100',
    contactEmail: 'karur.central@medifind.com',
    operatingHours: 'Mon-Sat: 7:30 AM - 10:30 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 9,
  },
  {
    id: 'p-9',
    userId: 'u-11',
    name: 'Kovai Road Healthcare',
    pharmacyName: 'Kovai Road Healthcare',
    licenseNumber: 'TN-PH-432002',
    address: '120 Kovai Road, Opposite Municipal Office',
    city: 'Karur',
    state: 'Tamil Nadu',
    zipCode: '639002',
    contactPhone: '+91 4324 234 500',
    contactEmail: 'kovai.road@medifind.com',
    operatingHours: '24 Hours Open',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 9,
  },
  {
    id: 'p-10',
    userId: 'u-12',
    name: 'Bus Stand MedStore',
    pharmacyName: 'Bus Stand MedStore',
    licenseNumber: 'TN-PH-432003',
    address: '45 West Pradakshanam Road, Near Bus Stand',
    city: 'Karur',
    state: 'Tamil Nadu',
    zipCode: '639001',
    contactPhone: '+91 4324 220 800',
    contactEmail: 'busstand.karur@medifind.com',
    operatingHours: 'Mon-Sun: 6:00 AM - 11:00 PM',
    isApproved: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    totalInventoryItems: 9,
  },
];

const defaultCategories = [
  { id: 'cat-1', name: 'Antibiotics', description: 'Bacterial infection treatments', medicineCount: 2 },
  { id: 'cat-2', name: 'Analgesics & Pain Relief', description: 'Pain relievers and fever reducers', medicineCount: 2 },
  { id: 'cat-3', name: 'Cardiovascular', description: 'Heart and blood pressure medications', medicineCount: 2 },
  { id: 'cat-4', name: 'Antidiabetic', description: 'Blood sugar control medications', medicineCount: 1 },
  { id: 'cat-5', name: 'Antihistamines', description: 'Allergy and cold relief', medicineCount: 1 },
  { id: 'cat-6', name: 'Gastrointestinal', description: 'Acid reflux and stomach care', medicineCount: 1 },
];

const defaultMedicines: any[] = [];

const pharmacyList = [
  { id: 'p-1', name: 'CareFirst Meds & Healthcare' },
  { id: 'p-2', name: 'Metro Kovai Pharmacy' },
  { id: 'p-3', name: 'Meenakshi Healthcare Pharmacy' },
  { id: 'p-4', name: 'Cauvery MedStore' },
  { id: 'p-5', name: 'Salem Central Pharmacy' },
  { id: 'p-6', name: 'Nellai Care Pharmacy' },
  { id: 'p-7', name: 'Kongu Wellness Pharmacy' },
  { id: 'p-8', name: 'Karur Central Pharmacy' },
  { id: 'p-9', name: 'Kovai Road Healthcare' },
  { id: 'p-10', name: 'Bus Stand MedStore' },
];

const defaultInventory: any[] = [];

const defaultReservations = [
  {
    id: 'res-101',
    reservationCode: 'RES-TN-882190',
    customerId: 'u-1',
    customerName: 'Arun Kumar',
    customerEmail: 'customer@medifind.com',
    customerPhone: '+91 98765 43210',
    pharmacyId: 'p-1',
    pharmacyName: 'CareFirst Meds & Healthcare',
    medicineId: 'm-1',
    medicineName: 'Amoxicillin Trihydrate',
    quantityRequested: 2,
    unitPrice: 85.00,
    totalAmount: 170.00,
    status: 'Approved',
    customerNote: 'Will pick up from Thousand Lights branch today at 5 PM.',
    pharmacyNote: 'Hold confirmed. Please present your prescription upon pickup.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 20).toISOString(),
  },
  {
    id: 'res-102',
    reservationCode: 'RES-TN-994120',
    customerId: 'u-1',
    customerName: 'Arun Kumar',
    customerEmail: 'customer@medifind.com',
    customerPhone: '+91 98765 43210',
    pharmacyId: 'p-2',
    pharmacyName: 'Metro Kovai Pharmacy',
    medicineId: 'm-5',
    medicineName: 'Azithromycin Dihydrate',
    quantityRequested: 1,
    unitPrice: 110.00,
    totalAmount: 110.00,
    status: 'Pending',
    customerNote: 'Urgent hold request for Gandhipuram store.',
    pharmacyNote: '',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 23).toISOString(),
  },
];

const defaultNotifications = [
  {
    id: 'n-1',
    userId: 'u-1',
    title: 'Reservation Approved (Chennai Branch)',
    message: 'Your hold request RES-TN-882190 for Amoxicillin Trihydrate was approved by CareFirst Meds & Healthcare.',
    type: 'ReservationApproved',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'n-2',
    userId: 'u-2',
    title: 'Low Stock Alert',
    message: 'Stock level for requested medicine has reached threshold limit.',
    type: 'LowStockAlert',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// Helper Store Functions
function getStore<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);

    if (key === STORAGE_KEYS.MEDICINES || key === STORAGE_KEYS.INVENTORY) {
      if (!raw || raw.includes('m-1') || raw.includes('Amoxicillin') || raw.includes('TN-2026')) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }

    if (
      !raw ||
      raw.includes('Springfield') ||
      raw.includes('Chicago') ||
      raw.includes('14.5') ||
      raw.includes('8.99') ||
      ((key === STORAGE_KEYS.PHARMACIES || key === STORAGE_KEYS.USERS) && !raw.includes('Karur'))
    ) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return seed;
  }
}

function setStore<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed saving to localStorage', err);
  }
}

// Data Loaders
const getUsers = () => getStore(STORAGE_KEYS.USERS, defaultUsers);
const setUsers = (data: any[]) => setStore(STORAGE_KEYS.USERS, data);

const getPharmacies = () => getStore(STORAGE_KEYS.PHARMACIES, defaultPharmacies);
const setPharmacies = (data: any[]) => setStore(STORAGE_KEYS.PHARMACIES, data);

const getCategories = () => getStore(STORAGE_KEYS.CATEGORIES, defaultCategories);
const setCategories = (data: any[]) => setStore(STORAGE_KEYS.CATEGORIES, data);

const getMedicines = () => getStore(STORAGE_KEYS.MEDICINES, defaultMedicines);
const setMedicines = (data: any[]) => setStore(STORAGE_KEYS.MEDICINES, data);

const getInventory = () => getStore(STORAGE_KEYS.INVENTORY, defaultInventory);
const setInventory = (data: any[]) => setStore(STORAGE_KEYS.INVENTORY, data);

const getReservations = () => getStore(STORAGE_KEYS.RESERVATIONS, defaultReservations);
const setReservations = (data: any[]) => setStore(STORAGE_KEYS.RESERVATIONS, data);

const getNotifications = () => getStore(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
const setNotifications = (data: any[]) => setStore(STORAGE_KEYS.NOTIFICATIONS, data);

// Helper Response Creators
function createOkResponse<T>(data: T, message = 'Operation completed successfully.'): AxiosResponse {
  return {
    data: {
      success: true,
      message,
      data,
      errors: [],
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function createErrorResponse(message: string, status = 400, errors?: string[]): AxiosResponse {
  return {
    data: {
      success: false,
      message,
      data: null,
      errors: errors || [message],
    },
    status,
    statusText: 'Bad Request',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function getCurrentMockUser(headers: any) {
  const authHeader = headers?.Authorization || headers?.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const token = authHeader.replace('Bearer ', '').trim();
  const parts = token.split('-');
  if (parts.length >= 2) {
    const userId = parts.slice(1).join('-');
    const user = getUsers().find((u) => u.id === userId);
    if (user) return user;
  }
  return null;
}

// Main Mock Request Interceptor Handler
export async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const url = config.url || '';
  const method = (config.method || 'GET').toUpperCase();
  const rawData = config.data;
  let body: any = {};
  if (rawData) {
    try {
      body = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } catch {
      body = rawData;
    }
  }

  const params = config.params || {};

  // Clean Path
  const path = url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api/, '');

  console.log(`[MediFind Mock Engine] Routing ${method} ${path}`, body);

  // --- 1. AUTH ROUTES ---
  if (path === '/auth/login' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || body.passwordHash;
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email);

    if (!user || user.password !== password) {
      return createErrorResponse('Invalid email address or password.');
    }

    const token = `jwt-${user.id}`;
    const { password: _, ...userDto } = user;
    return createOkResponse({
      token,
      refreshToken: `ref-${user.id}`,
      expiration: new Date(Date.now() + 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user: userDto,
    });
  }

  if (path === '/auth/register/customer' && method === 'POST') {
    const { firstName, lastName, email, phoneNumber, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return createErrorResponse('Required registration fields are missing.');
    }
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return createErrorResponse('An account with this email address already exists.');
    }

    const newUser = {
      id: `u-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      role: 'Customer',
      password,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setUsers(users);

    const { password: _, ...userDto } = newUser;
    return createOkResponse(userDto, 'Customer registered successfully.');
  }

  if (path === '/auth/register/pharmacy' && method === 'POST') {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      pharmacyName,
      licenseNumber,
      address,
      city,
      state,
      zipCode,
      contactPhone,
      contactEmail,
      operatingHours,
    } = body;

    if (!firstName || !email || !password || !pharmacyName || !licenseNumber || !address || !city) {
      return createErrorResponse('Required pharmacy registration fields are missing.');
    }

    const users = getUsers();
    const pharmacies = getPharmacies();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return createErrorResponse('An account with this email address already exists.');
    }

    const userId = `u-${Date.now()}`;
    const newUser = {
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      email: cleanEmail,
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      role: 'Pharmacy',
      password,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const pName = pharmacyName.trim();
    const newPharm = {
      id: `p-${Date.now()}`,
      userId,
      name: pName,
      pharmacyName: pName,
      licenseNumber: licenseNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : '',
      zipCode: zipCode ? zipCode.trim() : '',
      contactPhone: contactPhone ? contactPhone.trim() : (phoneNumber || ''),
      contactEmail: contactEmail ? contactEmail.trim() : cleanEmail,
      operatingHours: operatingHours ? operatingHours.trim() : 'Mon-Sat: 8:00 AM - 8:00 PM',
      isApproved: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalInventoryItems: 0,
    };

    users.push(newUser);
    pharmacies.push(newPharm);

    setUsers(users);
    setPharmacies(pharmacies);

    const { password: _, ...userDto } = newUser;
    return createOkResponse(userDto, 'Pharmacy account registered successfully.');
  }

  if (path === '/auth/register' && method === 'POST') {
    const { email, password, firstName, lastName, phoneNumber, role, pharmacyDetails } = body;
    if (!email || !password || !firstName || !lastName) {
      return createErrorResponse('Required registration fields are missing.');
    }

    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return createErrorResponse('An account with this email address already exists.');
    }

    const userId = `u-${Date.now()}`;
    const userRole = role === 1 || role === 'Pharmacy' ? 'Pharmacy' : 'Customer';

    const newUser = {
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      phoneNumber: phoneNumber || '',
      role: userRole,
      password,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setUsers(users);

    if (userRole === 'Pharmacy' && pharmacyDetails) {
      const pharmacies = getPharmacies();
      const pName = pharmacyDetails.name || pharmacyDetails.pharmacyName || `${firstName}'s Pharmacy`;
      pharmacies.push({
        id: `p-${Date.now()}`,
        userId,
        name: pName,
        pharmacyName: pName,
        licenseNumber: pharmacyDetails.licenseNumber || 'LIC-' + Date.now(),
        address: pharmacyDetails.address || '',
        city: pharmacyDetails.city || '',
        state: pharmacyDetails.state || '',
        zipCode: pharmacyDetails.zipCode || '',
        contactPhone: pharmacyDetails.contactPhone || phoneNumber || '',
        contactEmail: pharmacyDetails.contactEmail || cleanEmail,
        operatingHours: pharmacyDetails.operatingHours || 'Mon-Sat: 8:00 AM - 8:00 PM',
        isApproved: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        totalInventoryItems: 0,
      });
      setPharmacies(pharmacies);
    }

    const { password: _, ...userDto } = newUser;
    return createOkResponse({
      token: `jwt-${userId}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user: userDto,
    });
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    if (!user) {
      return createErrorResponse('Unauthenticated session.', 401);
    }
    const { password: _, ...userDto } = user;
    return createOkResponse(userDto);
  }

  // --- 2. MEDICINE SEARCH ---
  if (path.startsWith('/search/medicines') && method === 'GET') {
    const qStr = (params.query || params.q || '').toString().toLowerCase().trim();
    const cStr = (params.city || '').toString().toLowerCase().trim();

    // If no query string, return empty
    if (!qStr) {
      return createOkResponse([]);
    }

    const medicines = getMedicines();
    const inventory = getInventory();
    const pharmacies = getPharmacies();

    // Combine medicines from catalog and any unique ones added to inventory by pharmacies
    const allMedicineIds = new Set<string>();
    const allMeds: any[] = [...medicines];
    medicines.forEach((m) => allMedicineIds.add(m.id));

    inventory.forEach((inv) => {
      if (!allMedicineIds.has(inv.medicineId)) {
        allMedicineIds.add(inv.medicineId);
        allMeds.push({
          id: inv.medicineId,
          name: inv.medicineName || 'Medicine',
          genericName: inv.genericName || inv.medicineName || '',
          brandName: inv.brandName || '',
          categoryName: inv.categoryName || 'General',
          dosageForm: inv.dosageForm || 'Tablet',
          strength: inv.strength || '',
          manufacturer: inv.manufacturer || '',
          requiresPrescription: false,
          isActive: true,
        });
      }
    });

    const filteredMeds = allMeds.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(qStr)) ||
        (m.genericName && m.genericName.toLowerCase().includes(qStr)) ||
        (m.brandName && m.brandName.toLowerCase().includes(qStr)) ||
        (m.categoryName && m.categoryName.toLowerCase().includes(qStr))
    );

    const results = filteredMeds
      .map((med) => {
        let invItems = inventory.filter(
          (i) =>
            (i.medicineId === med.id ||
              (i.medicineName && i.medicineName.toLowerCase() === med.name?.toLowerCase()) ||
              (i.genericName && i.genericName.toLowerCase() === med.name?.toLowerCase())) &&
            Number(i.availableQuantity || i.quantityAvailable || 0) > 0
        );

        // If a specific city/location filter is provided, filter stores to that location
        if (cStr) {
          invItems = invItems.filter((i) => {
            const pharm = pharmacies.find((p) => p.id === i.pharmacyId);
            if (!pharm) {
              const itemCity = (i.city || '').toLowerCase();
              return itemCity.includes(cStr) || cStr.includes(itemCity);
            }
            const pCity = (pharm.city || '').toLowerCase();
            const pAddr = (pharm.address || '').toLowerCase();
            const pState = (pharm.state || '').toLowerCase();
            return (
              pCity.includes(cStr) ||
              cStr.includes(pCity) ||
              pAddr.includes(cStr) ||
              pState.includes(cStr)
            );
          });
        }

        const availablePharmacies = invItems.map((inv) => {
          const pharm = pharmacies.find((p) => p.id === inv.pharmacyId) || {
            id: inv.pharmacyId,
            name: inv.pharmacyName || 'Pharmacy Store',
            pharmacyName: inv.pharmacyName || 'Pharmacy Store',
            address: inv.address || 'Main Road',
            city: inv.city || (cStr ? cStr.toUpperCase() : 'Karur'),
            state: inv.state || 'Tamil Nadu',
            zipCode: inv.zipCode || '639001',
            contactPhone: inv.contactPhone || '9876543210',
            operatingHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
          };

          const availQty = Number(inv.availableQuantity || inv.quantityAvailable || 0);

          return {
            pharmacyInventoryId: inv.id,
            pharmacyId: pharm.id,
            pharmacyName: pharm.pharmacyName || pharm.name,
            address: pharm.address || inv.address || 'Store Location',
            city: pharm.city || inv.city || 'Karur',
            state: pharm.state || inv.state || 'Tamil Nadu',
            zipCode: pharm.zipCode || inv.zipCode || '',
            contactPhone: pharm.contactPhone || inv.contactPhone || '9876543210',
            operatingHours: pharm.operatingHours || 'Mon-Sat: 8:00 AM - 9:00 PM',
            availableQuantity: availQty,
            unitPrice: Number(inv.unitPrice || inv.price || 0),
            lastStockUpdate: inv.lastUpdated || new Date().toISOString(),
            isLowStock: inv.isLowStock || availQty <= (inv.reorderLevel || 10),
          };
        });

        return {
          id: med.id,
          medicineId: med.id,
          name: med.name,
          medicineName: med.name,
          genericName: med.genericName,
          brandName: med.brandName,
          categoryName: med.categoryName,
          dosageForm: med.dosageForm,
          strength: med.strength,
          manufacturer: med.manufacturer,
          description: med.description,
          requiresPrescription: med.requiresPrescription,
          availablePharmacies,
        };
      })
      .filter((med) => med.availablePharmacies.length > 0);

    return createOkResponse(results);
  }

  // --- 3. CATEGORIES ---
  if (path === '/medicines/categories' && method === 'GET') {
    return createOkResponse(getCategories());
  }

  if (path === '/medicines/categories' && method === 'POST') {
    const cats = getCategories();
    const newCat = {
      id: `cat-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      medicineCount: 0,
    };
    cats.push(newCat);
    setCategories(cats);
    return createOkResponse(newCat, 'Category created.');
  }

  // --- 4. MEDICINES CATALOG ---
  if (path === '/medicines' && method === 'GET') {
    let items = getMedicines();
    if (params.categoryId) {
      items = items.filter((m) => m.categoryId === params.categoryId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.genericName && m.genericName.toLowerCase().includes(q)) ||
          (m.brandName && m.brandName.toLowerCase().includes(q))
      );
    }
    const page = parseInt(params.page || params.pageNumber || '1') || 1;
    const pageSize = parseInt(params.pageSize || '10') || 10;
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return createOkResponse({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      totalCount,
      pageNumber: page,
      pageSize,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    });
  }

  if (path.match(/^\/medicines\/[^\/]+$/) && method === 'GET') {
    const id = path.split('/')[2];
    const med = getMedicines().find((m) => m.id === id);
    if (!med) return createErrorResponse('Medicine not found in catalog.', 404);
    return createOkResponse(med);
  }

  if (path === '/medicines' && method === 'POST') {
    const meds = getMedicines();
    const cats = getCategories();
    const cat = cats.find((c) => c.id === body.categoryId);
    const newMed = {
      id: `m-${Date.now()}`,
      categoryId: body.categoryId || cats[0]?.id || 'cat-1',
      categoryName: cat?.name || 'General',
      name: body.name,
      genericName: body.genericName || body.name,
      brandName: body.brandName || body.manufacturer || '',
      manufacturer: body.manufacturer || body.brandName || '',
      dosageForm: body.dosageForm || 'Tablet',
      strength: body.strength || '500mg',
      description: body.description || '',
      requiresPrescription: !!body.requiresPrescription,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    meds.push(newMed);
    setMedicines(meds);

    // Sync inventory stock and pricing directly to selected pharmacy (or all pharmacies)
    const stockQty = Number(body.stockQuantity ?? body.quantityOnHand) || 0;
    const price = Number(body.price ?? body.unitPrice) || 0;

    const pharmacies = getPharmacies();
    const targetPharmacies =
      body.pharmacyId && body.pharmacyId !== 'all'
        ? pharmacies.filter((p) => p.id === body.pharmacyId)
        : pharmacies;

    const inventory = getInventory();
    targetPharmacies.forEach((pharm) => {
      const invId = `inv-${Date.now()}-${pharm.id}`;
      const newInv = {
        id: invId,
        pharmacyId: pharm.id,
        pharmacyName: pharm.pharmacyName || pharm.name,
        medicineId: newMed.id,
        medicineName: newMed.name,
        genericName: newMed.genericName,
        strength: newMed.strength,
        dosageForm: newMed.dosageForm,
        quantityOnHand: stockQty,
        reservedQuantity: 0,
        availableQuantity: stockQty,
        unitPrice: price,
        lowStockThreshold: 5,
        reorderLevel: 5,
        isLowStock: stockQty <= 5,
        batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '2028-12-31',
        isActive: true,
        lastUpdated: new Date().toISOString(),
      };
      inventory.push(newInv);
    });
    setInventory(inventory);

    return createOkResponse(newMed, 'Medicine entry and live pharmacy stock saved successfully.');
  }

  if (path.match(/^\/medicines\/[^\/]+$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const meds = getMedicines();
    const idx = meds.findIndex((m) => m.id === id);
    if (idx === -1) return createErrorResponse('Medicine not found.', 404);

    meds[idx] = { ...meds[idx], ...body };
    setMedicines(meds);

    // Sync inventory stock if provided
    if (body.stockQuantity !== undefined || body.price !== undefined || body.unitPrice !== undefined) {
      const stockQty = Number(body.stockQuantity ?? body.quantityOnHand);
      const price = Number(body.price ?? body.unitPrice);
      const inventory = getInventory();

      const updatedInv = inventory.map((inv) => {
        if (inv.medicineId === id) {
          return {
            ...inv,
            medicineName: meds[idx].name,
            genericName: meds[idx].genericName,
            dosageForm: meds[idx].dosageForm,
            strength: meds[idx].strength,
            quantityOnHand: !isNaN(stockQty) ? stockQty : inv.quantityOnHand,
            availableQuantity: !isNaN(stockQty) ? stockQty : inv.availableQuantity,
            unitPrice: !isNaN(price) ? price : inv.unitPrice,
            lastUpdated: new Date().toISOString(),
          };
        }
        return inv;
      });
      setInventory(updatedInv);
    }

    return createOkResponse(meds[idx], 'Medicine entry updated.');
  }

  if (path.match(/^\/medicines\/[^\/]+$/) && method === 'DELETE') {
    const id = path.split('/')[2];
    let meds = getMedicines();
    meds = meds.filter((m) => m.id !== id);
    setMedicines(meds);
    return createOkResponse(true, 'Medicine deleted.');
  }

  // --- 5. PHARMACY PROFILE & INVENTORY ---
  if (path === '/pharmacies/me' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const pharms = getPharmacies();
    let pharm = pharms.find((p) => p.userId === user.id);
    if (!pharm) {
      pharm = {
        id: `p-${user.id || Date.now()}`,
        userId: user.id,
        name: `${user.firstName || 'Karur'} Medicals`,
        pharmacyName: `${user.firstName || 'Karur'} Medicals`,
        licenseNumber: 'TN-PH-' + Math.floor(100000 + Math.random() * 900000),
        address: '15 Jawahar Bazaar, Near Five Road Junction',
        city: 'Karur',
        state: 'Tamil Nadu',
        zipCode: '639001',
        contactPhone: user.phoneNumber || '+91 4324 260 100',
        contactEmail: user.email || 'karur.central@medifind.com',
        operatingHours: 'Mon-Sat: 7:30 AM - 10:30 PM',
        isApproved: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        totalInventoryItems: 0,
      };
      pharms.push(pharm);
      setPharmacies(pharms);
    }
    return createOkResponse(pharm);
  }

  if (path === '/pharmacies/me' && method === 'PUT') {
    const user = getCurrentMockUser(config.headers);
    const pharms = getPharmacies();
    const idx = pharms.findIndex((p) => p.userId === user.id);
    if (idx !== -1) {
      pharms[idx] = { ...pharms[idx], ...body, name: body.name || body.pharmacyName || pharms[idx].name };
      setPharmacies(pharms);
      return createOkResponse(pharms[idx], 'Pharmacy profile updated.');
    }
    return createErrorResponse('Pharmacy profile not found.', 404);
  }

  if ((path === '/pharmacies/me/inventory' || path === '/pharmacies/me/inventory/low-stock') && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const pharms = getPharmacies();
    const pharm = pharms.find((p) => p.userId === user.id) || pharms[0];
    const inventory = getInventory();
    const medicines = getMedicines();

    let items = inventory.filter((i) => i.pharmacyId === pharm.id);
    if (path.includes('low-stock') || params.isLowStock === 'true' || params.lowStockOnly === 'true') {
      items = items.filter((i) => i.isLowStock || i.availableQuantity <= (i.reorderLevel || 10));
    }

    const resultItems = items.map((inv) => {
      const med = medicines.find((m) => m.id === inv.medicineId);
      return {
        id: inv.id,
        pharmacyId: inv.pharmacyId,
        pharmacyName: pharm?.pharmacyName || pharm?.name || inv.pharmacyName || 'Pharmacy',
        medicineId: inv.medicineId,
        medicineName: med?.name || inv.medicineName || 'Medicine',
        genericName: med?.genericName || inv.genericName || '',
        brandName: med?.brandName || inv.brandName || '',
        categoryName: med?.categoryName || inv.categoryName || 'General',
        dosageForm: med?.dosageForm || inv.dosageForm || 'Tablet',
        strength: med?.strength || inv.strength || '',
        requiresPrescription: med ? !!med.requiresPrescription : false,
        quantityOnHand: inv.quantityOnHand !== undefined ? inv.quantityOnHand : inv.availableQuantity,
        reservedQuantity: inv.reservedQuantity || 0,
        availableQuantity: inv.availableQuantity,
        unitPrice: inv.unitPrice || 0,
        lowStockThreshold: inv.reorderLevel || inv.lowStockThreshold || 10,
        reorderLevel: inv.reorderLevel || inv.lowStockThreshold || 10,
        isLowStock: inv.isLowStock || inv.availableQuantity <= (inv.reorderLevel || inv.lowStockThreshold || 10),
        batchNumber: inv.batchNumber || 'BATCH-001',
        expiryDate: inv.expiryDate || '2028-01-01',
        isActive: true,
        lastUpdated: inv.lastUpdated,
      };
    });

    if (path.includes('low-stock')) {
      return createOkResponse(resultItems);
    }

    return createOkResponse({
      items: resultItems,
      totalCount: resultItems.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if (path === '/pharmacies/me/inventory' && method === 'POST') {
    const user = getCurrentMockUser(config.headers);
    const pharms = getPharmacies();
    let pharm = pharms.find((p) => p.userId === user.id);
    if (!pharm) {
      pharm = {
        id: `p-${user.id || Date.now()}`,
        userId: user.id,
        name: `${user.firstName || 'Karur'} Medicals`,
        pharmacyName: `${user.firstName || 'Karur'} Medicals`,
        licenseNumber: 'TN-PH-' + Math.floor(100000 + Math.random() * 900000),
        address: '15 Jawahar Bazaar, Near Five Road Junction',
        city: 'Karur',
        state: 'Tamil Nadu',
        zipCode: '639001',
        contactPhone: user.phoneNumber || '+91 4324 260 100',
        contactEmail: user.email || 'karur.central@medifind.com',
        operatingHours: 'Mon-Sat: 7:30 AM - 10:30 PM',
        isApproved: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        totalInventoryItems: 0,
      };
      pharms.push(pharm);
      setPharmacies(pharms);
    }
    const inventory = getInventory();
    const medicines = getMedicines();

    let med = medicines.find((m) => m.id === body.medicineId);
    if (!med && (body.medicineName || body.name)) {
      med = {
        id: `m-${Date.now()}`,
        categoryId: body.categoryId || 'cat-1',
        categoryName: body.categoryName || 'General',
        name: body.medicineName || body.name,
        genericName: body.genericName || body.medicineName || body.name,
        brandName: body.brandName || '',
        manufacturer: body.manufacturer || body.brandName || '',
        dosageForm: body.dosageForm || 'Tablet',
        strength: body.strength || '500mg',
        description: body.description || '',
        requiresPrescription: !!body.requiresPrescription,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      medicines.push(med);
      setMedicines(medicines);
    }

    const medName = med?.name || body.medicineName || body.name || 'Medicine';
    const medId = med?.id || body.medicineId || `m-${Date.now()}`;
    const qty = Number(body.quantityAvailable ?? body.quantityOnHand) || 0;
    const reorder = Number(body.reorderLevel ?? body.lowStockThreshold) || 10;

    const newInv = {
      id: `inv-${Date.now()}`,
      pharmacyId: pharm.id,
      pharmacyName: pharm.pharmacyName || pharm.name,
      city: pharm.city,
      medicineId: medId,
      medicineName: medName,
      genericName: med?.genericName || body.genericName || medName,
      strength: med?.strength || body.strength || '500mg',
      dosageForm: med?.dosageForm || body.dosageForm || 'Tablet',
      quantityOnHand: qty,
      reservedQuantity: 0,
      availableQuantity: qty,
      unitPrice: Number(body.unitPrice || body.price) || 0,
      lowStockThreshold: reorder,
      reorderLevel: reorder,
      isLowStock: qty <= reorder,
      batchNumber: body.batchNumber || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: body.expiryDate || '2028-12-31',
      isActive: true,
      lastUpdated: new Date().toISOString(),
    };

    inventory.push(newInv);
    setInventory(inventory);

    pharm.totalInventoryItems = (pharm.totalInventoryItems || 0) + 1;
    setPharmacies(pharms);

    return createOkResponse(newInv, 'Medicine inventory added to your shop.');
  }

  if (path.match(/^\/pharmacies\/me\/inventory\/[^\/]+$/) && method === 'PUT') {
    const id = path.split('/')[4];
    const inventory = getInventory();
    const idx = inventory.findIndex((i) => i.id === id);
    if (idx === -1) return createErrorResponse('Inventory item not found.', 404);

    const item = inventory[idx];
    const avail = body.quantityAvailable !== undefined ? Number(body.quantityAvailable) : item.availableQuantity;
    const reorder = body.reorderLevel !== undefined ? Number(body.reorderLevel) : (item.reorderLevel || 10);

    inventory[idx] = {
      ...item,
      ...body,
      availableQuantity: avail,
      reorderLevel: reorder,
      isLowStock: avail <= reorder,
      lastUpdated: new Date().toISOString(),
    };

    setInventory(inventory);
    return createOkResponse(inventory[idx], 'Stock updated.');
  }

  if (path.match(/^\/pharmacies\/me\/inventory\/[^\/]+$/) && method === 'DELETE') {
    const id = path.split('/')[4];
    let inventory = getInventory();
    inventory = inventory.filter((i) => i.id !== id);
    setInventory(inventory);
    return createOkResponse(true, 'Inventory item deleted.');
  }

  if (path === '/pharmacies' && method === 'GET') {
    const pharms = getPharmacies().filter((p) => p.isApproved);
    return createOkResponse({
      items: pharms,
      totalCount: pharms.length,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  // --- 6. RESERVATIONS ---
  if (path === '/reservations' && method === 'POST') {
    const user = getCurrentMockUser(config.headers);
    const { pharmacyInventoryId, quantityRequested, customerNote } = body;

    const inventory = getInventory();
    const inv = inventory.find((i) => i.id === pharmacyInventoryId);
    if (!inv) return createErrorResponse('Selected pharmacy inventory item not found.');

    const qty = Number(quantityRequested) || 1;
    if (inv.availableQuantity < qty) {
      return createErrorResponse(`Insufficient stock available (${inv.availableQuantity} units left).`);
    }

    inv.availableQuantity -= qty;
    inv.reservedQuantity += qty;
    inv.isLowStock = inv.availableQuantity <= (inv.reorderLevel || 10);
    setInventory(inventory);

    const pharms = getPharmacies();
    const pharm = pharms.find((p) => p.id === inv.pharmacyId) || pharms[0];
    const medicines = getMedicines();
    const med = medicines.find((m) => m.id === inv.medicineId) || medicines[0];

    const reservations = getReservations();
    const nowIso = new Date().toISOString();
    const newRes: any = {
      id: `res-${Date.now()}`,
      reservationCode: `RES-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: user.id,
      customerUserId: user.id,
      customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
      customerEmail: user.email || 'customer@medifind.com',
      customerPhone: user.phoneNumber || '+91 98765 43210',
      pharmacyId: pharm.id,
      pharmacyName: pharm.pharmacyName || pharm.name,
      pharmacyAddress: `${pharm.address}, ${pharm.city}, ${pharm.state}${pharm.zipCode ? ` - ${pharm.zipCode}` : ''}`,
      pharmacyPhone: pharm.contactPhone || '+91 4324 260 100',
      pharmacyCity: pharm.city,
      pharmacyInventoryId: inv.id,
      medicineId: med?.id || inv.medicineId,
      medicineName: med?.name || inv.medicineName || 'Medicine',
      strength: med?.strength || inv.strength || 'Standard',
      quantityRequested: qty,
      unitPrice: inv.unitPrice || 0,
      totalAmount: (inv.unitPrice || 0) * qty,
      totalEstimatedPrice: (inv.unitPrice || 0) * qty,
      status: 'Pending',
      customerNote: customerNote || '',
      pharmacyNote: '',
      requestedAt: nowIso,
      createdAt: nowIso,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    reservations.unshift(newRes);
    setReservations(reservations);

    const notifications = getNotifications();
    notifications.unshift({
      id: `n-${Date.now()}`,
      userId: pharm.userId,
      title: 'New In-Store Pickup Reservation',
      message: `Pickup Code: ${newRes.reservationCode} for ${qty}x ${newRes.medicineName}. Customer: ${newRes.customerName}.`,
      type: 'NewReservation',
      isRead: false,
      createdAt: nowIso,
    });
    setNotifications(notifications);

    return createOkResponse(newRes, 'In-store pickup reservation confirmed! You can collect this at the pharmacy.');
  }

  if (path === '/reservations/my' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const reservations = getReservations().filter((r: any) => r.customerId === user.id || r.customerUserId === user.id);
    return createOkResponse({
      items: reservations,
      totalCount: reservations.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if (path === '/reservations/pharmacy' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const pharm = getPharmacies().find((p) => p.userId === user.id) || getPharmacies()[0];
    const reservations = getReservations().filter((r) => r.pharmacyId === pharm.id);
    return createOkResponse({
      items: reservations,
      totalCount: reservations.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if (path.match(/^\/reservations\/[^\/]+\/approve$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const reservations = getReservations();
    const resItem = reservations.find((r) => r.id === id);
    if (resItem) {
      resItem.status = 'Approved';
      setReservations(reservations);
      return createOkResponse(resItem, 'Reservation approved.');
    }
    return createErrorResponse('Reservation not found.', 404);
  }

  if (path.match(/^\/reservations\/[^\/]+\/reject$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const reservations = getReservations();
    const resItem = reservations.find((r) => r.id === id);
    if (resItem) {
      resItem.status = 'Rejected';

      // Restore inventory
      const inventory = getInventory();
      const inv = inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
      if (inv) {
        inv.availableQuantity += resItem.quantityRequested;
        inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
        setInventory(inventory);
      }

      setReservations(reservations);
      return createOkResponse(resItem, 'Reservation rejected and stock restored.');
    }
    return createErrorResponse('Reservation not found.', 404);
  }

  if (path.match(/^\/reservations\/[^\/]+\/fulfill$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const reservations = getReservations();
    const resItem = reservations.find((r) => r.id === id);
    if (resItem) {
      resItem.status = 'Fulfilled';
      const inventory = getInventory();
      const inv = inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
      if (inv) {
        inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
        setInventory(inventory);
      }
      setReservations(reservations);
      return createOkResponse(resItem, 'Reservation marked as fulfilled.');
    }
    return createErrorResponse('Reservation not found.', 404);
  }

  if (path.match(/^\/reservations\/[^\/]+\/cancel$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const reservations = getReservations();
    const resItem = reservations.find((r) => r.id === id);
    if (resItem) {
      resItem.status = 'Cancelled';
      const inventory = getInventory();
      const inv = inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
      if (inv) {
        inv.availableQuantity += resItem.quantityRequested;
        inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
        setInventory(inventory);
      }
      setReservations(reservations);
      return createOkResponse(resItem, 'Reservation cancelled.');
    }
    return createErrorResponse('Reservation not found.', 404);
  }

  // --- 7. NOTIFICATIONS ---
  if (path === '/notifications' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const notifications = getNotifications().filter((n) => n.userId === user.id);
    return createOkResponse({
      items: notifications,
      totalCount: notifications.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if (path.match(/^\/notifications\/[^\/]+\/read$/) && method === 'PUT') {
    const id = path.split('/')[2];
    const notifications = getNotifications();
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    setNotifications(notifications);
    return createOkResponse(true, 'Marked as read.');
  }

  if (path === '/notifications/read-all' && method === 'PUT') {
    const user = getCurrentMockUser(config.headers);
    const notifications = getNotifications();
    notifications.forEach((n) => {
      if (n.userId === user.id) n.isRead = true;
    });
    setNotifications(notifications);
    return createOkResponse(true, 'All marked as read.');
  }

  // --- 8. USERS & PROFILE ---
  if (path === '/users' && method === 'GET') {
    let users = getUsers();
    const roleParam = (params.role || '').toString().toLowerCase().trim();
    if (roleParam) {
      users = users.filter((u) => u.role.toLowerCase() === roleParam);
    }
    const safeUsers = users.map(({ password: _, ...u }) => u);
    return createOkResponse({
      items: safeUsers,
      totalCount: safeUsers.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if (path.match(/^\/users\/[^\/]+$/) && method === 'GET') {
    const id = path.split('/')[2];
    const users = getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      const { password: _, ...userDto } = user;
      return createOkResponse(userDto);
    }
    return createErrorResponse('User not found.', 404);
  }

  // --- 9. ANALYTICS ---
  if (path === '/analytics/admin' && method === 'GET') {
    const users = getUsers();
    const pharms = getPharmacies();
    const meds = getMedicines();
    const inv = getInventory();
    const reservations = getReservations();

    return createOkResponse({
      totalUsers: users.length,
      totalCustomers: users.filter((u) => u.role === 'Customer').length,
      totalPharmacies: pharms.length,
      pendingPharmacyApprovals: pharms.filter((p) => !p.isApproved).length,
      totalMedicinesInCatalog: meds.length,
      totalInventoryListings: inv.length,
      totalReservationsCreated: reservations.length,
      mostSearchedMedicines: [
        { searchTerm: 'Amoxicillin Trihydrate', searchCount: 142 },
        { searchTerm: 'Paracetamol / Dolo 650', searchCount: 128 },
        { searchTerm: 'Metformin 850mg', searchCount: 95 },
        { searchTerm: 'Ibuprofen 400mg', searchCount: 78 },
        { searchTerm: 'Azithromycin 500mg', searchCount: 64 },
      ],
      recentSystemActivity: [
        { activityType: 'RESERVATION', description: 'New reservation RES-TN-882190 created in Chennai', timestamp: new Date(Date.now() - 1800000).toISOString() },
        { activityType: 'PHARMACY', description: 'Metro Kovai Pharmacy verified in Coimbatore', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
        { activityType: 'INVENTORY', description: 'Stock replenished for Dolo 650 in Madurai', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
        { activityType: 'APPROVAL', description: 'Kongu Wellness Pharmacy registered in Erode', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
      ],
    });
  }

  if (path === '/analytics/pharmacy' && method === 'GET') {
    const user = getCurrentMockUser(config.headers);
    const pharm = getPharmacies().find((p) => p.userId === user.id) || getPharmacies()[0];
    const inventory = getInventory().filter((i) => i.pharmacyId === pharm.id);
    const reservations = getReservations().filter((r) => r.pharmacyId === pharm.id);
    const lowStockItems = inventory.filter((i) => i.isLowStock || i.availableQuantity <= (i.reorderLevel || 10));

    return createOkResponse({
      pharmacyId: pharm.id,
      pharmacyName: pharm.pharmacyName || pharm.name,
      totalInventoryItems: inventory.length,
      lowStockItemsCount: lowStockItems.length,
      pendingReservationsCount: reservations.filter((r) => r.status === 'Pending').length,
      approvedReservationsCount: reservations.filter((r) => r.status === 'Approved').length,
      completedReservationsCount: reservations.filter((r) => r.status === 'Fulfilled').length,
      totalEstimatedValue: inventory.reduce((sum, item) => sum + item.availableQuantity * item.unitPrice, 0),
      topReservedMedicines: [
        { medicineName: 'Amoxicillin Trihydrate 500mg', reservationCount: 28, totalQuantityReserved: 56 },
        { medicineName: 'Paracetamol / Dolo 650', reservationCount: 22, totalQuantityReserved: 88 },
        { medicineName: 'Metformin Hydrochloride 850mg', reservationCount: 15, totalQuantityReserved: 30 },
      ],
      lowStockAlerts: lowStockItems.map((item) => ({
        inventoryId: item.id,
        medicineName: item.medicineName,
        availableQuantity: item.availableQuantity,
        lowStockThreshold: item.reorderLevel || 10,
      })),
    });
  }

  // --- 9. ADMIN PHARMACIES ---
  if ((path === '/admin/pharmacies' || path === '/admin/AdminPharmacies') && method === 'GET') {
    const pharms = getPharmacies();
    return createOkResponse({
      items: pharms,
      totalCount: pharms.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  }

  if ((path.match(/^\/admin\/pharmacies\/[^\/]+\/approve$/) || path.match(/^\/admin\/AdminPharmacies\/[^\/]+\/approve$/)) && method === 'PUT') {
    const id = path.split('/')[3];
    const pharms = getPharmacies();
    const pharm = pharms.find((p) => p.id === id);
    if (pharm) pharm.isApproved = true;
    setPharmacies(pharms);
    return createOkResponse(pharm, 'Pharmacy approved.');
  }

  if ((path.match(/^\/admin\/pharmacies\/[^\/]+\/deactivate$/) || path.match(/^\/admin\/AdminPharmacies\/[^\/]+\/deactivate$/)) && method === 'PUT') {
    const id = path.split('/')[3];
    const pharms = getPharmacies();
    const pharm = pharms.find((p) => p.id === id);
    if (pharm) pharm.isApproved = false;
    setPharmacies(pharms);
    return createOkResponse(pharm, 'Pharmacy deactivated.');
  }

  // Fallback default response if route not explicitly handled
  console.warn(`[MediFind Mock Engine] Unhandled path: ${method} ${path}, returning generic success.`);
  return createOkResponse({}, 'Action handled by local mock service.');
}
