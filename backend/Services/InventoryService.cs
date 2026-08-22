using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Inventory;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly ApplicationDbContext _dbContext;

        public InventoryService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<PagedResponse<InventoryResponseDto>>> GetPharmacyInventoryAsync(Guid pharmacyId, int page = 1, int pageSize = 10, string? search = null, bool? isLowStock = null)
        {
            var query = _dbContext.PharmacyInventories
                .Include(i => i.Medicine)
                .Include(i => i.Pharmacy)
                .Where(i => i.PharmacyId == pharmacyId && i.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower().Trim();
                query = query.Where(i => i.Medicine.Name.ToLower().Contains(term) || i.Medicine.GenericName.ToLower().Contains(term) || i.BatchNumber.ToLower().Contains(term));
            }

            if (isLowStock.HasValue && isLowStock.Value)
            {
                query = query.Where(i => (i.QuantityOnHand - i.ReservedQuantity) <= i.LowStockThreshold);
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(i => i.Medicine.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = items.Select(MapToInventoryDto).ToList();
            var paged = new PagedResponse<InventoryResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<InventoryResponseDto>>.Ok(paged);
        }

        public async Task<ApiResponse<InventoryResponseDto>> AddInventoryAsync(Guid pharmacyId, Guid userId, CreateInventoryDto dto)
        {
            var pharmacyExists = await _dbContext.Pharmacies.AnyAsync(p => p.Id == pharmacyId && p.IsActive);
            if (!pharmacyExists)
            {
                return ApiResponse<InventoryResponseDto>.Fail("Pharmacy account is invalid or inactive.");
            }

            var medicine = await _dbContext.Medicines.FirstOrDefaultAsync(m => m.Id == dto.MedicineId && m.IsActive);
            if (medicine == null)
            {
                return ApiResponse<InventoryResponseDto>.Fail("Medicine not found in central catalog.");
            }

            var existingItem = await _dbContext.PharmacyInventories.FirstOrDefaultAsync(i => i.PharmacyId == pharmacyId && i.MedicineId == dto.MedicineId);
            if (existingItem != null)
            {
                if (existingItem.IsActive)
                {
                    return ApiResponse<InventoryResponseDto>.Fail("This medicine already exists in your inventory. Please update the existing listing instead.");
                }

                // Reactivate existing inventory listing
                existingItem.IsActive = true;
                existingItem.QuantityOnHand = dto.QuantityOnHand;
                existingItem.UnitPrice = dto.UnitPrice;
                existingItem.LowStockThreshold = dto.LowStockThreshold;
                existingItem.BatchNumber = dto.BatchNumber?.Trim() ?? "";
                existingItem.ExpiryDate = dto.ExpiryDate;
                existingItem.LastStockUpdate = DateTime.UtcNow;

                var txReactivate = new InventoryTransaction
                {
                    PharmacyInventoryId = existingItem.Id,
                    Type = TransactionType.StockAddition,
                    QuantityChange = dto.QuantityOnHand,
                    NewQuantityOnHand = dto.QuantityOnHand,
                    NewReservedQuantity = existingItem.ReservedQuantity,
                    ReferenceNumber = $"ADD-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                    Note = "Reactivated existing medicine listing",
                    PerformedByUserId = userId,
                    Timestamp = DateTime.UtcNow
                };

                await _dbContext.InventoryTransactions.AddAsync(txReactivate);
                await _dbContext.SaveChangesAsync();

                await _dbContext.Entry(existingItem).Reference(i => i.Pharmacy).LoadAsync();
                return ApiResponse<InventoryResponseDto>.Ok(MapToInventoryDto(existingItem), "Medicine listing reactivated with new stock.");
            }

            var inventory = new PharmacyInventory
            {
                PharmacyId = pharmacyId,
                MedicineId = dto.MedicineId,
                QuantityOnHand = dto.QuantityOnHand,
                ReservedQuantity = 0,
                UnitPrice = dto.UnitPrice,
                LowStockThreshold = dto.LowStockThreshold,
                BatchNumber = dto.BatchNumber?.Trim() ?? "",
                ExpiryDate = dto.ExpiryDate,
                IsActive = true,
                LastStockUpdate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.PharmacyInventories.AddAsync(inventory);
            await _dbContext.SaveChangesAsync();

            var transaction = new InventoryTransaction
            {
                PharmacyInventoryId = inventory.Id,
                Type = TransactionType.StockAddition,
                QuantityChange = dto.QuantityOnHand,
                NewQuantityOnHand = dto.QuantityOnHand,
                NewReservedQuantity = 0,
                ReferenceNumber = $"ADD-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                Note = "Initial inventory addition",
                PerformedByUserId = userId,
                Timestamp = DateTime.UtcNow
            };

            await _dbContext.InventoryTransactions.AddAsync(transaction);
            await _dbContext.SaveChangesAsync();

            // Load navigation properties for clean response mapping
            await _dbContext.Entry(inventory).Reference(i => i.Medicine).LoadAsync();
            await _dbContext.Entry(inventory).Reference(i => i.Pharmacy).LoadAsync();

            return ApiResponse<InventoryResponseDto>.Ok(MapToInventoryDto(inventory), "Medicine added to inventory successfully.");
        }

        public async Task<ApiResponse<InventoryResponseDto>> UpdateInventoryAsync(Guid inventoryId, Guid pharmacyId, Guid userId, UpdateInventoryDto dto)
        {
            var inventory = await _dbContext.PharmacyInventories
                .Include(i => i.Medicine)
                .Include(i => i.Pharmacy)
                .FirstOrDefaultAsync(i => i.Id == inventoryId && i.PharmacyId == pharmacyId);

            if (inventory == null)
            {
                return ApiResponse<InventoryResponseDto>.Fail("Inventory item not found.");
            }

            int oldQuantity = inventory.QuantityOnHand;
            int change = dto.QuantityOnHand - oldQuantity;

            inventory.QuantityOnHand = dto.QuantityOnHand;
            inventory.UnitPrice = dto.UnitPrice;
            inventory.LowStockThreshold = dto.LowStockThreshold;
            inventory.BatchNumber = dto.BatchNumber?.Trim() ?? "";
            inventory.ExpiryDate = dto.ExpiryDate;
            inventory.IsActive = dto.IsActive;
            inventory.LastStockUpdate = DateTime.UtcNow;

            var transaction = new InventoryTransaction
            {
                PharmacyInventoryId = inventory.Id,
                Type = TransactionType.ManualAdjustment,
                QuantityChange = change,
                NewQuantityOnHand = inventory.QuantityOnHand,
                NewReservedQuantity = inventory.ReservedQuantity,
                ReferenceNumber = $"ADJ-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                Note = string.IsNullOrWhiteSpace(dto.AdjustmentNote) ? "Manual stock update" : dto.AdjustmentNote.Trim(),
                PerformedByUserId = userId,
                Timestamp = DateTime.UtcNow
            };

            await _dbContext.InventoryTransactions.AddAsync(transaction);
            await _dbContext.SaveChangesAsync();

            // Low stock trigger alert
            if (inventory.AvailableQuantity <= inventory.LowStockThreshold)
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Title = "Low Stock Alert",
                    Message = $"Alert: Medicine '{inventory.Medicine.Name}' is low on stock ({inventory.AvailableQuantity} remaining).",
                    Type = NotificationType.LowStockAlert,
                    TargetUrl = "/pharmacy/inventory",
                    CreatedAt = DateTime.UtcNow
                };
                await _dbContext.Notifications.AddAsync(notification);
                await _dbContext.SaveChangesAsync();
            }

            return ApiResponse<InventoryResponseDto>.Ok(MapToInventoryDto(inventory), "Inventory updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteInventoryAsync(Guid inventoryId, Guid pharmacyId, Guid userId)
        {
            var inventory = await _dbContext.PharmacyInventories
                .FirstOrDefaultAsync(i => i.Id == inventoryId && i.PharmacyId == pharmacyId);

            if (inventory == null)
            {
                return ApiResponse<bool>.Fail("Inventory item not found.");
            }

            inventory.IsActive = false;
            inventory.LastStockUpdate = DateTime.UtcNow;

            var transaction = new InventoryTransaction
            {
                PharmacyInventoryId = inventory.Id,
                Type = TransactionType.StockRemoval,
                QuantityChange = -inventory.QuantityOnHand,
                NewQuantityOnHand = 0,
                NewReservedQuantity = inventory.ReservedQuantity,
                ReferenceNumber = $"REM-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                Note = "Inventory item deactivated",
                PerformedByUserId = userId,
                Timestamp = DateTime.UtcNow
            };

            await _dbContext.InventoryTransactions.AddAsync(transaction);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Inventory record deactivated.");
        }

        public async Task<ApiResponse<List<InventoryResponseDto>>> GetLowStockAlertsAsync(Guid pharmacyId)
        {
            var items = await _dbContext.PharmacyInventories
                .Include(i => i.Medicine)
                .Include(i => i.Pharmacy)
                .Where(i => i.PharmacyId == pharmacyId && i.IsActive && (i.QuantityOnHand - i.ReservedQuantity) <= i.LowStockThreshold)
                .OrderBy(i => (i.QuantityOnHand - i.ReservedQuantity))
                .ToListAsync();

            var dtos = items.Select(MapToInventoryDto).ToList();
            return ApiResponse<List<InventoryResponseDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<PagedResponse<InventoryTransactionResponseDto>>> GetInventoryHistoryAsync(Guid pharmacyId, int page = 1, int pageSize = 10)
        {
            var query = _dbContext.InventoryTransactions
                .Include(t => t.PharmacyInventory)
                    .ThenInclude(i => i.Medicine)
                .Include(t => t.PerformedByUser)
                .Where(t => t.PharmacyInventory.PharmacyId == pharmacyId)
                .AsQueryable();

            int totalCount = await query.CountAsync();
            var txs = await query
                .OrderByDescending(t => t.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = txs.Select(t => new InventoryTransactionResponseDto
            {
                Id = t.Id,
                PharmacyInventoryId = t.PharmacyInventoryId,
                MedicineName = t.PharmacyInventory?.Medicine?.Name ?? "Unknown",
                TransactionType = t.Type.ToString(),
                QuantityChange = t.QuantityChange,
                NewQuantityOnHand = t.NewQuantityOnHand,
                NewReservedQuantity = t.NewReservedQuantity,
                ReferenceNumber = t.ReferenceNumber,
                Note = t.Note,
                PerformedByUserName = t.PerformedByUser != null ? $"{t.PerformedByUser.FirstName} {t.PerformedByUser.LastName}" : "System",
                Timestamp = t.Timestamp
            }).ToList();

            var paged = new PagedResponse<InventoryTransactionResponseDto>(dtos, totalCount, page, pageSize);
            return ApiResponse<PagedResponse<InventoryTransactionResponseDto>>.Ok(paged);
        }

        private static InventoryResponseDto MapToInventoryDto(PharmacyInventory i)
        {
            return new InventoryResponseDto
            {
                Id = i.Id,
                PharmacyId = i.PharmacyId,
                PharmacyName = i.Pharmacy?.Name ?? "",
                MedicineId = i.MedicineId,
                MedicineName = i.Medicine?.Name ?? "",
                GenericName = i.Medicine?.GenericName ?? "",
                Strength = i.Medicine?.Strength ?? "",
                DosageForm = i.Medicine?.DosageForm ?? "",
                QuantityOnHand = i.QuantityOnHand,
                ReservedQuantity = i.ReservedQuantity,
                AvailableQuantity = i.AvailableQuantity,
                UnitPrice = i.UnitPrice,
                LowStockThreshold = i.LowStockThreshold,
                BatchNumber = i.BatchNumber,
                ExpiryDate = i.ExpiryDate,
                IsActive = i.IsActive,
                LastStockUpdate = i.LastStockUpdate
            };
        }
    }
}
