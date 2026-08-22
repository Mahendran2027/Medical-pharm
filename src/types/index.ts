// Common API Wrapper Interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// User & Auth Types
export type UserRole = 'Customer' | 'Pharmacy' | 'Admin';

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequestDto {
  email: string;
  passwordHash: string; // or password
}

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}

export interface CustomerRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface PharmacyRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  pharmacyName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail?: string;
  operatingHours?: string;
}

// Pharmacy Types
export interface PharmacyResponseDto {
  id: string;
  userId: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail: string;
  operatingHours: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  totalInventoryItems: number;
}

export interface UpdatePharmacyDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail?: string;
  operatingHours?: string;
}

// Medicine & Search Types
export interface MedicineCategoryDto {
  id: string;
  name: string;
  description: string;
  medicineCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface MedicineResponseDto {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  genericName: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  description: string;
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMedicineDto {
  categoryId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  dosageForm: string;
  strength: string;
  description?: string;
  requiresPrescription: boolean;
  price?: number;
  stockQuantity?: number;
  pharmacyId?: string;
}

export interface UpdateMedicineDto extends CreateMedicineDto {
  isActive: boolean;
}

export interface PharmacyStockAvailabilityDto {
  pharmacyInventoryId: string;
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  contactPhone: string;
  operatingHours?: string;
  latitude?: number;
  longitude?: number;
  availableQuantity: number;
  unitPrice: number;
  lastStockUpdate: string;
  isLowStock: boolean;
}

export interface MedicineSearchResponseDto {
  id?: string;
  medicineId: string;
  name?: string;
  medicineName: string;
  genericName: string;
  brandName: string;
  categoryName: string;
  dosageForm: string;
  strength: string;
  description?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  availablePharmacies: PharmacyStockAvailabilityDto[];
}

// Inventory Types
export interface InventoryResponseDto {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  lowStockThreshold: number;
  batchNumber: string;
  expiryDate?: string;
  isActive: boolean;
  lastStockUpdate: string;
}

export interface CreateInventoryDto {
  medicineId: string;
  quantityOnHand: number;
  unitPrice: number;
  lowStockThreshold: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpdateInventoryDto {
  quantityOnHand: number;
  unitPrice: number;
  lowStockThreshold: number;
  batchNumber?: string;
  expiryDate?: string;
  isActive: boolean;
  adjustmentNote?: string;
}

export interface InventoryTransactionResponseDto {
  id: string;
  pharmacyInventoryId: string;
  medicineName: string;
  transactionType: string;
  quantityChange: number;
  newQuantityOnHand: number;
  newReservedQuantity: number;
  referenceNumber: string;
  note: string;
  performedByUserName: string;
  timestamp: string;
}

// Reservation Types
export interface ReservationResponseDto {
  id: string;
  reservationCode: string;
  customerId?: string;
  customerUserId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
  pharmacyCity?: string;
  pharmacyInventoryId?: string;
  medicineId?: string;
  medicineName: string;
  strength?: string;
  quantityRequested: number;
  unitPrice?: number;
  totalAmount?: number;
  totalEstimatedPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired' | 'Fulfilled' | string;
  rejectionReason?: string;
  customerNote?: string;
  pharmacyNote?: string;
  requestedAt: string;
  createdAt?: string;
  approvedAt?: string;
  expiresAt?: string;
  completedAt?: string;
}

export interface CreateReservationDto {
  pharmacyInventoryId: string;
  quantityRequested: number;
  customerNote?: string;
}

export interface UpdateReservationStatusDto {
  reasonOrNote: string;
}

// Notification Types
export interface NotificationResponseDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  targetUrl: string;
  createdAt: string;
}

// Analytics Types
export interface TopReservedMedicineDto {
  medicineName: string;
  reservationCount: number;
  totalQuantityReserved: number;
}

export interface LowStockAlertItemDto {
  inventoryId: string;
  medicineName: string;
  availableQuantity: number;
  lowStockThreshold: number;
}

export interface PharmacyAnalyticsResponseDto {
  totalInventoryItems: number;
  lowStockItemsCount: number;
  pendingReservationsCount: number;
  approvedReservationsCount: number;
  completedReservationsCount: number;
  totalEstimatedValue: number;
  topReservedMedicines: TopReservedMedicineDto[];
  lowStockAlerts: LowStockAlertItemDto[];
}

export interface MostSearchedMedicineDto {
  searchTerm: string;
  searchCount: number;
}

export interface RecentActivityDto {
  activityType: string;
  description: string;
  timestamp: string;
}

export interface AdminAnalyticsResponseDto {
  totalUsers: number;
  totalCustomers: number;
  totalPharmacies: number;
  pendingPharmacyApprovals: number;
  totalMedicinesInCatalog: number;
  totalInventoryListings: number;
  totalReservationsCreated: number;
  mostSearchedMedicines: MostSearchedMedicineDto[];
  recentSystemActivity: RecentActivityDto[];
}
