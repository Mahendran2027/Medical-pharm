import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database for local dev preview
const db = {
  users: [
    {
      id: 'u-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@medifind.com',
      phoneNumber: '+15551234567',
      role: 'Customer',
      password: 'Password123!',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-2',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'pharmacy@medifind.com',
      phoneNumber: '+15559876543',
      role: 'Pharmacy',
      password: 'Password123!',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-3',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@medifind.com',
      phoneNumber: '+15550001111',
      role: 'Admin',
      password: 'Password123!',
      createdAt: new Date().toISOString(),
    },
  ],
  pharmacies: [
    {
      id: 'p-1',
      userId: 'u-2',
      pharmacyName: 'CareFirst Central Pharmacy',
      licenseNumber: 'PH-992102',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      contactPhone: '+1 (555) 987-6543',
      contactEmail: 'pharmacy@medifind.com',
      operatingHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p-2',
      userId: 'u-4',
      pharmacyName: 'Metro Health Pharmacy',
      licenseNumber: 'PH-441209',
      address: '100 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      contactPhone: '+1 (312) 555-0199',
      contactEmail: 'contact@metrohealthrx.com',
      operatingHours: '24/7 Open',
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Antibiotics', description: 'Bacterial infection treatments' },
    { id: 'cat-2', name: 'Analgesics & Pain Relief', description: 'Pain relievers and fever reducers' },
    { id: 'cat-3', name: 'Cardiovascular', description: 'Heart and blood pressure medications' },
    { id: 'cat-4', name: 'Antidiabetic', description: 'Blood sugar control medications' },
  ],
  medicines: [
    {
      id: 'm-1',
      name: 'Amoxicillin Trihydrate',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      categoryId: 'cat-1',
      categoryName: 'Antibiotics',
      dosageForm: 'Capsule',
      strength: '500mg',
      manufacturer: 'Pfizer',
      description: 'Broad-spectrum penicillin antibiotic used to treat bacterial infections.',
      requiresPrescription: true,
    },
    {
      id: 'm-2',
      name: 'Paracetamol / Acetaminophen',
      genericName: 'Acetaminophen',
      brandName: 'Tylenol Extra Strength',
      categoryId: 'cat-2',
      categoryName: 'Analgesics & Pain Relief',
      dosageForm: 'Tablet',
      strength: '500mg',
      manufacturer: 'Kenvue',
      description: 'Effective pain reliever and fever reducer.',
      requiresPrescription: false,
    },
    {
      id: 'm-3',
      name: 'Metformin Hydrochloride',
      genericName: 'Metformin',
      brandName: 'Glucophage',
      categoryId: 'cat-4',
      categoryName: 'Antidiabetic',
      dosageForm: 'Extended Release Tablet',
      strength: '850mg',
      manufacturer: 'Merck',
      description: 'First-line medication for the treatment of type 2 diabetes.',
      requiresPrescription: true,
    },
    {
      id: 'm-4',
      name: 'Ibuprofen Rapid Relief',
      genericName: 'Ibuprofen',
      brandName: 'Advil',
      categoryId: 'cat-2',
      categoryName: 'Analgesics & Pain Relief',
      dosageForm: 'Softgel Capsule',
      strength: '400mg',
      manufacturer: 'Haleon',
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain, swelling, and fever.',
      requiresPrescription: false,
    },
  ],
  inventory: [
    {
      id: 'inv-1',
      pharmacyId: 'p-1',
      pharmacyName: 'CareFirst Central Pharmacy',
      medicineId: 'm-1',
      quantityAvailable: 120,
      reservedQuantity: 5,
      unitPrice: 14.50,
      reorderLevel: 25,
      isLowStock: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'inv-2',
      pharmacyId: 'p-1',
      pharmacyName: 'CareFirst Central Pharmacy',
      medicineId: 'm-2',
      quantityAvailable: 350,
      reservedQuantity: 10,
      unitPrice: 8.99,
      reorderLevel: 50,
      isLowStock: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'inv-3',
      pharmacyId: 'p-1',
      pharmacyName: 'CareFirst Central Pharmacy',
      medicineId: 'm-3',
      quantityAvailable: 8,
      reservedQuantity: 2,
      unitPrice: 22.00,
      reorderLevel: 15,
      isLowStock: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'inv-4',
      pharmacyId: 'p-2',
      pharmacyName: 'Metro Health Pharmacy',
      medicineId: 'm-1',
      quantityAvailable: 85,
      reservedQuantity: 0,
      unitPrice: 13.99,
      reorderLevel: 20,
      isLowStock: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'inv-5',
      pharmacyId: 'p-2',
      pharmacyName: 'Metro Health Pharmacy',
      medicineId: 'm-4',
      quantityAvailable: 210,
      reservedQuantity: 0,
      unitPrice: 11.49,
      reorderLevel: 30,
      isLowStock: false,
      lastUpdated: new Date().toISOString(),
    },
  ],
  reservations: [
    {
      id: 'res-101',
      reservationCode: 'RES-882190',
      customerId: 'u-1',
      customerName: 'John Doe',
      customerEmail: 'customer@medifind.com',
      customerPhone: '+15551234567',
      pharmacyId: 'p-1',
      pharmacyName: 'CareFirst Central Pharmacy',
      medicineId: 'm-1',
      medicineName: 'Amoxicillin Trihydrate',
      quantityRequested: 2,
      unitPrice: 14.50,
      totalAmount: 29.00,
      status: 'Approved',
      customerNote: 'Will pick up today around 5 PM.',
      pharmacyNote: 'Hold confirmed. Please bring ID.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 20).toISOString(),
    },
  ],
  notifications: [
    {
      id: 'n-1',
      userId: 'u-1',
      title: 'Reservation Approved',
      message: 'Your hold request RES-882190 for Amoxicillin Trihydrate was approved by CareFirst Central Pharmacy.',
      type: 'ReservationApproved',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'n-2',
      userId: 'u-2',
      title: 'New Reservation Received',
      message: 'Customer John Doe requested a hold for 2 units of Amoxicillin Trihydrate.',
      type: 'NewReservation',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
};

// Auth helper
const getUserByToken = (authHeader?: string) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  const parts = token.split('-');
  if (parts.length >= 2) {
    const userId = parts.slice(1).join('-');
    const found = db.users.find((u) => u.id === userId);
    if (found) return found;
  }
  return null;
};

// Response Wrappers
const ok = <T>(data: T, message?: string) => ({
  success: true,
  message: message || 'Operation completed successfully.',
  data,
  errors: [],
});

const fail = (message: string, errors?: string[]) => ({
  success: false,
  message,
  errors: errors || [message],
  data: null,
});

// --- API ROUTES ---

// 1. Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password, passwordHash } = req.body;
  const pass = password || passwordHash;
  if (!email || !pass) {
    return res.status(400).json(fail('Email address and password are required.'));
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== pass) {
    return res.status(400).json(fail('Invalid email address or password.'));
  }

  const token = `jwt-${user.id}`;
  const { password: _, ...userDto } = user;

  return res.json(
    ok({
      token,
      refreshToken: `ref-${user.id}`,
      expiration: new Date(Date.now() + 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user: userDto,
    })
  );
});

// General Register Endpoint (.NET compatibility)
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, role, pharmacyDetails } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json(fail('Required registration fields are missing.'));
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json(fail('An account with this email address already exists.'));
  }

  const userId = `u-${Date.now()}`;
  const userRole = role === 1 || role === 'Pharmacy' ? 'Pharmacy' : role === 2 || role === 'Admin' ? 'Admin' : 'Customer';

  const newUser = {
    id: userId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: cleanEmail,
    phoneNumber: phoneNumber || '',
    role: userRole,
    password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (userRole === 'Pharmacy' && pharmacyDetails) {
    const pName = pharmacyDetails.name || pharmacyDetails.pharmacyName || `${firstName}'s Pharmacy`;
    const newPharmacy = {
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
      createdAt: new Date().toISOString(),
    };
    db.pharmacies.push(newPharmacy);
  }

  const token = `jwt-${userId}`;
  const { password: _, ...userDto } = newUser;

  return res.json(
    ok(
      {
        token,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: userDto,
      },
      'Account registered successfully.'
    )
  );
});

app.post('/api/auth/register/customer', (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json(fail('Required registration fields are missing (first name, last name, email, password).'));
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json(fail('An account with this email address already exists.'));
  }

  const newUser = {
    id: `u-${Date.now()}`,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: cleanEmail,
    phoneNumber: phoneNumber ? phoneNumber.trim() : '',
    role: 'Customer',
    password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  const { password: _, ...userDto } = newUser;
  return res.json(ok(userDto, 'Customer account registered successfully.'));
});

app.post('/api/auth/register/pharmacy', (req, res) => {
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
  } = req.body;

  if (!firstName || !email || !password || !pharmacyName || !licenseNumber || !address || !city) {
    return res.status(400).json(fail('Required pharmacy registration fields are missing.'));
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json(fail('An account with this email address already exists.'));
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
    createdAt: new Date().toISOString(),
  };

  const pName = pharmacyName.trim();
  const newPharmacy = {
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
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.pharmacies.push(newPharmacy);

  const { password: _, ...userDto } = newUser;
  return res.json(ok(userDto, 'Pharmacy partner registered and approved successfully.'));
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  if (!user) return res.status(401).json(fail('Unauthorized. Token missing or invalid.'));
  const { password: _, ...userDto } = user;
  return res.json(ok(userDto));
});

// 2. Medicine Catalog & Categories
app.get('/api/medicines/categories', (req, res) => {
  return res.json(ok(db.categories));
});

app.post('/api/medicines/categories', (req, res) => {
  const { name, description } = req.body;
  const newCat = { id: `cat-${Date.now()}`, name, description: description || '' };
  db.categories.push(newCat);
  return res.json(ok(newCat, 'Category created.'));
});

app.get('/api/medicines', (req, res) => {
  const { page = '1', pageSize = '10', categoryId, search } = req.query;
  let items = [...db.medicines];

  if (categoryId) {
    items = items.filter((m) => m.categoryId === categoryId);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.brandName && m.brandName.toLowerCase().includes(q))
    );
  }

  const p = parseInt(page as string) || 1;
  const ps = parseInt(pageSize as string) || 10;
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / ps) || 1;
  const pagedItems = items.slice((p - 1) * ps, p * ps);

  return res.json(
    ok({
      items: pagedItems,
      pageIndex: p,
      totalPages,
      totalCount,
      hasPreviousPage: p > 1,
      hasNextPage: p < totalPages,
    })
  );
});

app.get('/api/medicines/:id', (req, res) => {
  const medicine = db.medicines.find((m) => m.id === req.params.id);
  if (!medicine) return res.status(404).json(fail('Medicine not found in catalog.'));
  return res.json(ok(medicine));
});

app.post('/api/medicines', (req, res) => {
  const dto = req.body;
  const category = db.categories.find((c) => c.id === dto.categoryId);
  const newMedicine = {
    id: `m-${Date.now()}`,
    name: dto.name,
    genericName: dto.genericName,
    brandName: dto.brandName,
    categoryId: dto.categoryId,
    categoryName: category?.name || 'General',
    dosageForm: dto.dosageForm,
    strength: dto.strength,
    manufacturer: dto.manufacturer,
    description: dto.description || '',
    requiresPrescription: !!dto.requiresPrescription,
  };
  db.medicines.push(newMedicine);
  return res.json(ok(newMedicine, 'Medicine added to catalog.'));
});

app.put('/api/medicines/:id', (req, res) => {
  const index = db.medicines.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json(fail('Medicine not found.'));
  const category = db.categories.find((c) => c.id === req.body.categoryId);
  db.medicines[index] = {
    ...db.medicines[index],
    ...req.body,
    categoryName: category?.name || db.medicines[index].categoryName,
  };
  return res.json(ok(db.medicines[index], 'Medicine updated.'));
});

app.delete('/api/medicines/:id', (req, res) => {
  const index = db.medicines.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json(fail('Medicine not found.'));
  db.medicines.splice(index, 1);
  return res.json(ok(true, 'Medicine removed from catalog.'));
});

// 3. Search Endpoint
app.get('/api/search/medicines', (req, res) => {
  const { query, city } = req.query;
  const qStr = (query as string || '').toLowerCase().trim();
  const cStr = (city as string || '').toLowerCase().trim();

  let filteredMeds = db.medicines;
  if (qStr) {
    filteredMeds = filteredMeds.filter(
      (m) =>
        m.name.toLowerCase().includes(qStr) ||
        (m.genericName && m.genericName.toLowerCase().includes(qStr)) ||
        (m.brandName && m.brandName.toLowerCase().includes(qStr)) ||
        (m.categoryName && m.categoryName.toLowerCase().includes(qStr))
    );
  }

  const results = filteredMeds.map((med) => {
    let invItems = db.inventory.filter((i) => i.medicineId === med.id);
    if (cStr) {
      invItems = invItems.filter((i) => {
        const pharm = db.pharmacies.find((p) => p.id === i.pharmacyId);
        return pharm && pharm.city.toLowerCase().includes(cStr);
      });
    }

    const availablePharmacies = invItems.map((inv) => {
      const pharm = db.pharmacies.find((p) => p.id === inv.pharmacyId) || db.pharmacies[0];
      return {
        pharmacyInventoryId: inv.id,
        pharmacyId: pharm.id,
        pharmacyName: pharm.pharmacyName,
        address: pharm.address,
        city: pharm.city,
        state: pharm.state,
        zipCode: pharm.zipCode,
        contactPhone: pharm.contactPhone,
        availableQuantity: inv.quantityAvailable,
        unitPrice: inv.unitPrice,
        lastStockUpdate: inv.lastUpdated,
      };
    });

    return {
      medicineId: med.id,
      medicineName: med.name,
      genericName: med.genericName,
      brandName: med.brandName,
      categoryName: med.categoryName,
      dosageForm: med.dosageForm,
      strength: med.strength,
      requiresPrescription: med.requiresPrescription,
      availablePharmacies,
    };
  });

  return res.json(ok(results));
});

// 4. Pharmacy & Inventory
app.get('/api/pharmacies', (req, res) => {
  const { page = '1', pageSize = '10', city, search } = req.query;
  let items = db.pharmacies.filter((p) => p.isApproved);
  if (city) {
    items = items.filter((p) => p.city.toLowerCase().includes((city as string).toLowerCase()));
  }
  if (search) {
    items = items.filter((p) => p.pharmacyName.toLowerCase().includes((search as string).toLowerCase()));
  }
  const p = parseInt(page as string) || 1;
  const ps = parseInt(pageSize as string) || 10;

  return res.json(
    ok({
      items: items.slice((p - 1) * ps, p * ps),
      pageIndex: p,
      totalPages: Math.ceil(items.length / ps) || 1,
      totalCount: items.length,
      hasPreviousPage: p > 1,
      hasNextPage: p < Math.ceil(items.length / ps),
    })
  );
});

app.get('/api/pharmacies/me', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const pharm = db.pharmacies.find((p) => p.userId === user?.id) || db.pharmacies[0];
  return res.json(ok(pharm));
});

app.put('/api/pharmacies/me', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const index = db.pharmacies.findIndex((p) => p.userId === user?.id);
  if (index === -1) return res.status(404).json(fail('Pharmacy profile not found.'));
  db.pharmacies[index] = { ...db.pharmacies[index], ...req.body };
  return res.json(ok(db.pharmacies[index], 'Pharmacy profile updated successfully.'));
});

app.get('/api/pharmacies/me/inventory', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const pharm = db.pharmacies.find((p) => p.userId === user?.id) || db.pharmacies[0];
  const { page = '1', pageSize = '10', search, isLowStock, lowStockOnly } = req.query;

  let items = db.inventory.filter((i) => i.pharmacyId === pharm.id);
  if (isLowStock === 'true' || lowStockOnly === 'true') {
    items = items.filter((i) => i.isLowStock || i.quantityAvailable <= i.reorderLevel);
  }

  const p = parseInt(page as string) || 1;
  const ps = parseInt(pageSize as string) || 10;

  const resultItems = items.map((inv) => {
    const med = db.medicines.find((m) => m.id === inv.medicineId) || db.medicines[0];
    return {
      id: inv.id,
      pharmacyId: inv.pharmacyId,
      medicineId: inv.medicineId,
      medicineName: med.name,
      genericName: med.genericName,
      brandName: med.brandName,
      categoryName: med.categoryName,
      dosageForm: med.dosageForm,
      strength: med.strength,
      requiresPrescription: med.requiresPrescription,
      quantityAvailable: inv.quantityAvailable,
      reservedQuantity: inv.reservedQuantity,
      unitPrice: inv.unitPrice,
      reorderLevel: inv.reorderLevel,
      isLowStock: inv.isLowStock || inv.quantityAvailable <= inv.reorderLevel,
      lastUpdated: inv.lastUpdated,
    };
  });

  return res.json(
    ok({
      items: resultItems.slice((p - 1) * ps, p * ps),
      pageIndex: p,
      totalPages: Math.ceil(resultItems.length / ps) || 1,
      totalCount: resultItems.length,
      hasPreviousPage: p > 1,
      hasNextPage: p < Math.ceil(resultItems.length / ps),
    })
  );
});

app.post('/api/pharmacies/me/inventory', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const pharm = db.pharmacies.find((p) => p.userId === user?.id) || db.pharmacies[0];
  const { medicineId, quantityAvailable, unitPrice, reorderLevel } = req.body;

  const newInv = {
    id: `inv-${Date.now()}`,
    pharmacyId: pharm.id,
    pharmacyName: pharm.pharmacyName,
    medicineId,
    quantityAvailable: Number(quantityAvailable) || 0,
    reservedQuantity: 0,
    unitPrice: Number(unitPrice) || 0,
    reorderLevel: Number(reorderLevel) || 10,
    isLowStock: Number(quantityAvailable) <= (Number(reorderLevel) || 10),
    lastUpdated: new Date().toISOString(),
  };

  db.inventory.push(newInv);
  return res.json(ok(newInv, 'Item added to pharmacy stock.'));
});

app.put('/api/pharmacies/me/inventory/:id', (req, res) => {
  const index = db.inventory.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json(fail('Inventory record not found.'));

  const item = db.inventory[index];
  const newQty = req.body.quantityAvailable !== undefined ? Number(req.body.quantityAvailable) : item.quantityAvailable;
  const newReorder = req.body.reorderLevel !== undefined ? Number(req.body.reorderLevel) : item.reorderLevel;

  db.inventory[index] = {
    ...item,
    ...req.body,
    quantityAvailable: newQty,
    reorderLevel: newReorder,
    isLowStock: newQty <= newReorder,
    lastUpdated: new Date().toISOString(),
  };

  return res.json(ok(db.inventory[index], 'Inventory stock updated.'));
});

app.delete('/api/pharmacies/me/inventory/:id', (req, res) => {
  const index = db.inventory.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json(fail('Inventory record not found.'));
  db.inventory.splice(index, 1);
  return res.json(ok(true, 'Item removed from pharmacy inventory.'));
});

// Admin Pharmacies
app.get(['/api/admin/pharmacies', '/api/admin/AdminPharmacies'], (req, res) => {
  return res.json(
    ok({
      items: db.pharmacies,
      pageIndex: 1,
      totalPages: 1,
      totalCount: db.pharmacies.length,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  );
});

app.put(['/api/admin/pharmacies/:id/approve', '/api/admin/AdminPharmacies/:id/approve'], (req, res) => {
  const pharm = db.pharmacies.find((p) => p.id === req.params.id);
  if (pharm) pharm.isApproved = true;
  return res.json(ok(pharm, 'Pharmacy approved.'));
});

app.put(['/api/admin/pharmacies/:id/deactivate', '/api/admin/AdminPharmacies/:id/deactivate'], (req, res) => {
  const pharm = db.pharmacies.find((p) => p.id === req.params.id);
  if (pharm) pharm.isApproved = false;
  return res.json(ok(pharm, 'Pharmacy deactivated.'));
});

// 5. Reservations
app.post('/api/reservations', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const { pharmacyInventoryId, quantityRequested, customerNote } = req.body;

  const inv = db.inventory.find((i) => i.id === pharmacyInventoryId);
  if (!inv) return res.status(404).json(fail('Selected pharmacy inventory item not found.'));

  const qty = Number(quantityRequested) || 1;
  if (inv.quantityAvailable < qty) {
    return res.status(400).json(fail(`Insufficient stock available (${inv.quantityAvailable} units left).`));
  }

  // Deduct available & add to reserved
  inv.quantityAvailable -= qty;
  inv.reservedQuantity += qty;
  inv.isLowStock = inv.quantityAvailable <= inv.reorderLevel;

  const pharm = db.pharmacies.find((p) => p.id === inv.pharmacyId) || db.pharmacies[0];
  const med = db.medicines.find((m) => m.id === inv.medicineId) || db.medicines[0];

  const newRes = {
    id: `res-${Date.now()}`,
    reservationCode: `RES-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: user?.id || 'u-1',
    customerName: user ? `${user.firstName} ${user.lastName}` : 'John Doe',
    customerEmail: user?.email || 'customer@medifind.com',
    customerPhone: user?.phoneNumber || '+15551234567',
    pharmacyId: pharm.id,
    pharmacyName: pharm.pharmacyName,
    medicineId: med.id,
    medicineName: med.name,
    quantityRequested: qty,
    unitPrice: inv.unitPrice,
    totalAmount: inv.unitPrice * qty,
    status: 'Pending',
    customerNote: customerNote || '',
    pharmacyNote: '',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  db.reservations.unshift(newRes);

  // Add Notification
  db.notifications.unshift({
    id: `n-${Date.now()}`,
    userId: pharm.userId,
    title: 'New Reservation Request',
    message: `New hold request ${newRes.reservationCode} for ${qty}x ${med.name}.`,
    type: 'NewReservation',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json(ok(newRes, 'Reservation request created successfully!'));
});

app.get('/api/reservations/my', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const items = db.reservations.filter((r) => r.customerId === (user?.id || 'u-1'));
  return res.json(
    ok({
      items,
      pageIndex: 1,
      totalPages: 1,
      totalCount: items.length,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  );
});

app.get('/api/reservations/pharmacy', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const pharm = db.pharmacies.find((p) => p.userId === user?.id) || db.pharmacies[0];
  const items = db.reservations.filter((r) => r.pharmacyId === pharm.id);

  return res.json(
    ok({
      items,
      pageIndex: 1,
      totalPages: 1,
      totalCount: items.length,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  );
});

app.put('/api/reservations/:id/approve', (req, res) => {
  const resItem = db.reservations.find((r) => r.id === req.params.id);
  if (!resItem) return res.status(404).json(fail('Reservation not found.'));
  resItem.status = 'Approved';
  return res.json(ok(resItem, 'Reservation approved.'));
});

app.put('/api/reservations/:id/reject', (req, res) => {
  const resItem = db.reservations.find((r) => r.id === req.params.id);
  if (!resItem) return res.status(404).json(fail('Reservation not found.'));
  resItem.status = 'Rejected';

  // Restore inventory
  const inv = db.inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
  if (inv) {
    inv.quantityAvailable += resItem.quantityRequested;
    inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
  }

  return res.json(ok(resItem, 'Reservation rejected and stock restored.'));
});

app.put('/api/reservations/:id/fulfill', (req, res) => {
  const resItem = db.reservations.find((r) => r.id === req.params.id);
  if (!resItem) return res.status(404).json(fail('Reservation not found.'));
  resItem.status = 'Fulfilled';

  // Decrement reserved quantity
  const inv = db.inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
  if (inv) {
    inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
  }

  return res.json(ok(resItem, 'Reservation marked as fulfilled.'));
});

app.put('/api/reservations/:id/cancel', (req, res) => {
  const resItem = db.reservations.find((r) => r.id === req.params.id);
  if (!resItem) return res.status(404).json(fail('Reservation not found.'));
  resItem.status = 'Cancelled';

  // Restore inventory
  const inv = db.inventory.find((i) => i.pharmacyId === resItem.pharmacyId && i.medicineId === resItem.medicineId);
  if (inv) {
    inv.quantityAvailable += resItem.quantityRequested;
    inv.reservedQuantity = Math.max(0, inv.reservedQuantity - resItem.quantityRequested);
  }

  return res.json(ok(resItem, 'Reservation cancelled.'));
});

// 6. Notifications
app.get('/api/notifications', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const items = db.notifications.filter((n) => n.userId === (user?.id || 'u-1'));
  return res.json(
    ok({
      items,
      pageIndex: 1,
      totalPages: 1,
      totalCount: items.length,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  );
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  return res.json(ok(true, 'Notification marked as read.'));
});

app.put('/api/notifications/read-all', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  db.notifications.forEach((n) => {
    if (n.userId === (user?.id || 'u-1')) n.isRead = true;
  });
  return res.json(ok(true, 'All notifications marked as read.'));
});

// 7. Analytics
app.get('/api/analytics/admin', (req, res) => {
  return res.json(
    ok({
      totalUsers: db.users.length,
      totalPharmacies: db.pharmacies.length,
      totalMedicines: db.medicines.length,
      totalReservations: db.reservations.length,
      pendingPharmaciesCount: db.pharmacies.filter((p) => !p.isApproved).length,
      activeReservationsCount: db.reservations.filter((r) => r.status === 'Approved' || r.status === 'Pending').length,
    })
  );
});

app.get('/api/analytics/pharmacy', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  const pharm = db.pharmacies.find((p) => p.userId === user?.id) || db.pharmacies[0];
  const pharmInv = db.inventory.filter((i) => i.pharmacyId === pharm.id);
  const pharmRes = db.reservations.filter((r) => r.pharmacyId === pharm.id);

  return res.json(
    ok({
      pharmacyId: pharm.id,
      pharmacyName: pharm.pharmacyName,
      totalInventoryItems: pharmInv.length,
      lowStockItemsCount: pharmInv.filter((i) => i.isLowStock || i.quantityAvailable <= i.reorderLevel).length,
      totalReservations: pharmRes.length,
      pendingReservations: pharmRes.filter((r) => r.status === 'Pending').length,
      approvedReservations: pharmRes.filter((r) => r.status === 'Approved').length,
      fulfilledReservations: pharmRes.filter((r) => r.status === 'Fulfilled').length,
      totalRevenue: pharmRes.filter((r) => r.status === 'Fulfilled').reduce((sum, r) => sum + r.totalAmount, 0),
    })
  );
});

// 8. Users Management
app.get('/api/users', (req, res) => {
  const { page = '1', pageSize = '10', role } = req.query;
  let items = db.users.map(({ password: _, ...u }) => u);
  if (role) {
    items = items.filter((u) => u.role === role);
  }
  const p = parseInt(page as string) || 1;
  const ps = parseInt(pageSize as string) || 10;

  return res.json(
    ok({
      items: items.slice((p - 1) * ps, p * ps),
      pageIndex: p,
      totalPages: Math.ceil(items.length / ps) || 1,
      totalCount: items.length,
      hasPreviousPage: p > 1,
      hasNextPage: p < Math.ceil(items.length / ps),
    })
  );
});

app.get('/api/users/me', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  if (!user) return res.status(401).json(fail('Unauthorized.'));
  const { password: _, ...userDto } = user;
  return res.json(ok(userDto));
});

app.put('/api/users/me', (req, res) => {
  const user = getUserByToken(req.headers.authorization);
  if (!user) return res.status(401).json(fail('Unauthorized.'));
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...req.body };
  }
  const { password: _, ...userDto } = db.users[index];
  return res.json(ok(userDto, 'User profile updated.'));
});

app.get('/api/users/:id', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json(fail('User not found.'));
  const { password: _, ...userDto } = user;
  return res.json(ok(userDto));
});

// --- VITE & STATIC SERVER ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediFind server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
