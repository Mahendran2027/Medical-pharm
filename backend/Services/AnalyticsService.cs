using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Analytics;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _dbContext;

        public AnalyticsService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<PharmacyAnalyticsResponseDto>> GetPharmacyAnalyticsAsync(Guid pharmacyId)
        {
            var inventories = await _dbContext.PharmacyInventories
                .Include(i => i.Medicine)
                .Where(i => i.PharmacyId == pharmacyId && i.IsActive)
                .ToListAsync();

            int totalItems = inventories.Count;
            int lowStockCount = inventories.Count(i => i.AvailableQuantity <= i.LowStockThreshold);
            decimal totalValue = inventories.Sum(i => i.QuantityOnHand * i.UnitPrice);

            var reservations = await _dbContext.Reservations
                .Where(r => r.PharmacyId == pharmacyId)
                .ToListAsync();

            int pendingRes = reservations.Count(r => r.Status == ReservationStatus.Pending);
            int approvedRes = reservations.Count(r => r.Status == ReservationStatus.Approved);
            int completedRes = reservations.Count(r => r.Status == ReservationStatus.Fulfilled);

            var topMedicines = await _dbContext.Reservations
                .Include(r => r.PharmacyInventory)
                    .ThenInclude(i => i.Medicine)
                .Where(r => r.PharmacyId == pharmacyId)
                .GroupBy(r => r.PharmacyInventory.Medicine.Name)
                .Select(g => new TopReservedMedicineDto
                {
                    MedicineName = g.Key ?? "Unknown",
                    ReservationCount = g.Count(),
                    TotalQuantityReserved = g.Sum(r => r.QuantityRequested)
                })
                .OrderByDescending(t => t.ReservationCount)
                .Take(5)
                .ToListAsync();

            var lowStockAlerts = inventories
                .Where(i => i.AvailableQuantity <= i.LowStockThreshold)
                .Select(i => new LowStockAlertItemDto
                {
                    InventoryId = i.Id,
                    MedicineName = i.Medicine?.Name ?? "Unknown",
                    AvailableQuantity = i.AvailableQuantity,
                    LowStockThreshold = i.LowStockThreshold
                })
                .OrderBy(l => l.AvailableQuantity)
                .ToList();

            var response = new PharmacyAnalyticsResponseDto
            {
                TotalInventoryItems = totalItems,
                LowStockItemsCount = lowStockCount,
                PendingReservationsCount = pendingRes,
                ApprovedReservationsCount = approvedRes,
                CompletedReservationsCount = completedRes,
                TotalEstimatedValue = totalValue,
                TopReservedMedicines = topMedicines,
                LowStockAlerts = lowStockAlerts
            };

            return ApiResponse<PharmacyAnalyticsResponseDto>.Ok(response);
        }

        public async Task<ApiResponse<AdminAnalyticsResponseDto>> GetAdminAnalyticsAsync()
        {
            int totalUsers = await _dbContext.Users.CountAsync();
            int totalCustomers = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Customer);
            int totalPharmacies = await _dbContext.Pharmacies.CountAsync(p => p.IsApproved);
            int pendingApprovals = await _dbContext.Pharmacies.CountAsync(p => !p.IsApproved);
            int totalMedicines = await _dbContext.Medicines.CountAsync(m => m.IsActive);
            int totalInventoryListings = await _dbContext.PharmacyInventories.CountAsync(i => i.IsActive);
            int totalReservations = await _dbContext.Reservations.CountAsync();

            var mostSearched = await _dbContext.SearchHistories
                .GroupBy(s => s.SearchTerm)
                .Select(g => new MostSearchedMedicineDto
                {
                    SearchTerm = g.Key,
                    SearchCount = g.Count()
                })
                .OrderByDescending(s => s.SearchCount)
                .Take(5)
                .ToListAsync();

            var recentAudit = await _dbContext.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .Select(a => new RecentActivityDto
                {
                    ActivityType = a.Action,
                    Description = $"{a.EntityName} ({a.EntityId})",
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            var response = new AdminAnalyticsResponseDto
            {
                TotalUsers = totalUsers,
                TotalCustomers = totalCustomers,
                TotalPharmacies = totalPharmacies,
                PendingPharmacyApprovals = pendingApprovals,
                TotalMedicinesInCatalog = totalMedicines,
                TotalInventoryListings = totalInventoryListings,
                TotalReservationsCreated = totalReservations,
                MostSearchedMedicines = mostSearched,
                RecentSystemActivity = recentAudit
            };

            return ApiResponse<AdminAnalyticsResponseDto>.Ok(response);
        }
    }
}
