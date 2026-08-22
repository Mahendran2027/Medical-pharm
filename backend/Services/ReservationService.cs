using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Reservations;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class ReservationService : IReservationService
    {
        private readonly ApplicationDbContext _dbContext;

        public ReservationService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<ReservationResponseDto>> CreateReservationAsync(Guid customerUserId, CreateReservationDto dto)
        {
            var customer = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == customerUserId && u.IsActive);
            if (customer == null)
            {
                return ApiResponse<ReservationResponseDto>.Fail("Customer account not found.");
            }

            var inventory = await _dbContext.PharmacyInventories
                .Include(i => i.Medicine)
                .Include(i => i.Pharmacy)
                .FirstOrDefaultAsync(i => i.Id == dto.PharmacyInventoryId && i.IsActive);

            if (inventory == null || inventory.Pharmacy == null || !inventory.Pharmacy.IsApproved || !inventory.Pharmacy.IsActive)
            {
                return ApiResponse<ReservationResponseDto>.Fail("Selected pharmacy medicine listing is unavailable.");
            }

            if (inventory.AvailableQuantity < dto.QuantityRequested)
            {
                return ApiResponse<ReservationResponseDto>.Fail($"Insufficient stock available. Only {inventory.AvailableQuantity} units currently available.");
            }

            string code = $"RES-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            decimal totalPrice = inventory.UnitPrice * dto.QuantityRequested;

            var reservation = new Reservation
            {
                ReservationCode = code,
                CustomerUserId = customerUserId,
                PharmacyId = inventory.PharmacyId,
                PharmacyInventoryId = inventory.Id,
                QuantityRequested = dto.QuantityRequested,
                TotalEstimatedPrice = totalPrice,
                Status = ReservationStatus.Pending,
                CustomerNote = dto.CustomerNote?.Trim() ?? "",
                RequestedAt = DateTime.UtcNow
            };

            await _dbContext.Reservations.AddAsync(reservation);

            // Notify Pharmacy
            var pharmacyUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == inventory.Pharmacy.UserId);
            if (pharmacyUser != null)
            {
                var notification = new Notification
                {
                    UserId = pharmacyUser.Id,
                    Title = "New Reservation Request",
                    Message = $"New reservation request #{code} received for {dto.QuantityRequested}x '{inventory.Medicine.Name}'.",
                    Type = NotificationType.ReservationStatusUpdate,
                    TargetUrl = "/pharmacy/reservations",
                    CreatedAt = DateTime.UtcNow
                };
                await _dbContext.Notifications.AddAsync(notification);
            }

            await _dbContext.SaveChangesAsync();

            return ApiResponse<ReservationResponseDto>.Ok(MapToReservationDto(reservation, customer, inventory.Pharmacy, inventory), "Reservation request submitted successfully.");
        }

        public async Task<ApiResponse<PagedResponse<ReservationResponseDto>>> GetCustomerReservationsAsync(Guid customerUserId, int page = 1, int pageSize = 10)
        {
            await CleanupExpiredReservationsAsync();

            var query = _dbContext.Reservations
                .Include(r => r.CustomerUser)
                .Include(r => r.Pharmacy)
                .Include(r => r.PharmacyInventory)
                    .ThenInclude(i => i.Medicine)
                .Where(r => r.CustomerUserId == customerUserId)
                .AsQueryable();

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.RequestedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = items.Select(r => MapToReservationDto(r, r.CustomerUser, r.Pharmacy, r.PharmacyInventory)).ToList();
            var paged = new PagedResponse<ReservationResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<ReservationResponseDto>>.Ok(paged);
        }

        public async Task<ApiResponse<PagedResponse<ReservationResponseDto>>> GetPharmacyReservationsAsync(Guid pharmacyId, int page = 1, int pageSize = 10, string? status = null)
        {
            await CleanupExpiredReservationsAsync();

            var query = _dbContext.Reservations
                .Include(r => r.CustomerUser)
                .Include(r => r.Pharmacy)
                .Include(r => r.PharmacyInventory)
                    .ThenInclude(i => i.Medicine)
                .Where(r => r.PharmacyId == pharmacyId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReservationStatus>(status, true, out var statusEnum))
            {
                query = query.Where(r => r.Status == statusEnum);
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.RequestedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = items.Select(r => MapToReservationDto(r, r.CustomerUser, r.Pharmacy, r.PharmacyInventory)).ToList();
            var paged = new PagedResponse<ReservationResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<ReservationResponseDto>>.Ok(paged);
        }

        public async Task<ApiResponse<ReservationResponseDto>> ApproveReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId, int expiryHours = 24)
        {
            using var dbTx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                var reservation = await _dbContext.Reservations
                    .Include(r => r.CustomerUser)
                    .Include(r => r.Pharmacy)
                    .FirstOrDefaultAsync(r => r.Id == reservationId && r.PharmacyId == pharmacyId);

                if (reservation == null)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Reservation request not found.");
                }

                if (reservation.Status != ReservationStatus.Pending)
                {
                    return ApiResponse<ReservationResponseDto>.Fail($"Cannot approve reservation with current status '{reservation.Status}'.");
                }

                var inventory = await _dbContext.PharmacyInventories
                    .Include(i => i.Medicine)
                    .FirstOrDefaultAsync(i => i.Id == reservation.PharmacyInventoryId);

                if (inventory == null)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Associated inventory record no longer exists.");
                }

                if (inventory.AvailableQuantity < reservation.QuantityRequested)
                {
                    return ApiResponse<ReservationResponseDto>.Fail($"Cannot approve reservation. Available stock ({inventory.AvailableQuantity}) is lower than requested quantity ({reservation.QuantityRequested}).");
                }

                // Reserve stock safely
                inventory.ReservedQuantity += reservation.QuantityRequested;
                inventory.LastStockUpdate = DateTime.UtcNow;

                reservation.Status = ReservationStatus.Approved;
                reservation.ApprovedAt = DateTime.UtcNow;
                reservation.ExpiresAt = DateTime.UtcNow.AddHours(expiryHours);

                // Audit transaction
                var tx = new InventoryTransaction
                {
                    PharmacyInventoryId = inventory.Id,
                    Type = TransactionType.ReservationHold,
                    QuantityChange = 0, // On hand doesn't change yet, reserved changes
                    NewQuantityOnHand = inventory.QuantityOnHand,
                    NewReservedQuantity = inventory.ReservedQuantity,
                    ReferenceNumber = reservation.ReservationCode,
                    Note = $"Stock reserved for approved reservation {reservation.ReservationCode}",
                    PerformedByUserId = userId,
                    Timestamp = DateTime.UtcNow
                };

                await _dbContext.InventoryTransactions.AddAsync(tx);

                // Customer notification
                var notif = new Notification
                {
                    UserId = reservation.CustomerUserId,
                    Title = "Reservation Approved!",
                    Message = $"Your reservation #{reservation.ReservationCode} for '{inventory.Medicine?.Name}' has been approved. Please collect by {reservation.ExpiresAt:f}.",
                    Type = NotificationType.ReservationStatusUpdate,
                    TargetUrl = "/customer/reservations",
                    CreatedAt = DateTime.UtcNow
                };

                await _dbContext.Notifications.AddAsync(notif);
                await _dbContext.SaveChangesAsync();
                await dbTx.CommitAsync();

                return ApiResponse<ReservationResponseDto>.Ok(MapToReservationDto(reservation, reservation.CustomerUser, reservation.Pharmacy, inventory), "Reservation approved and stock reserved.");
            }
            catch (Exception ex)
            {
                await dbTx.RollbackAsync();
                return ApiResponse<ReservationResponseDto>.Fail($"Failed to approve reservation: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReservationResponseDto>> RejectReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId, string reason)
        {
            var reservation = await _dbContext.Reservations
                .Include(r => r.CustomerUser)
                .Include(r => r.Pharmacy)
                .Include(r => r.PharmacyInventory)
                    .ThenInclude(i => i.Medicine)
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.PharmacyId == pharmacyId);

            if (reservation == null)
            {
                return ApiResponse<ReservationResponseDto>.Fail("Reservation request not found.");
            }

            if (reservation.Status != ReservationStatus.Pending)
            {
                return ApiResponse<ReservationResponseDto>.Fail($"Cannot reject reservation with current status '{reservation.Status}'.");
            }

            reservation.Status = ReservationStatus.Rejected;
            reservation.RejectionReason = string.IsNullOrWhiteSpace(reason) ? "Stock unavailable or pharmacy unable to fulfill request." : reason.Trim();

            // Notify customer
            var notif = new Notification
            {
                UserId = reservation.CustomerUserId,
                Title = "Reservation Request Rejected",
                Message = $"Your reservation #{reservation.ReservationCode} was rejected. Reason: {reservation.RejectionReason}",
                Type = NotificationType.ReservationStatusUpdate,
                TargetUrl = "/customer/reservations",
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Notifications.AddAsync(notif);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<ReservationResponseDto>.Ok(MapToReservationDto(reservation, reservation.CustomerUser, reservation.Pharmacy, reservation.PharmacyInventory), "Reservation rejected.");
        }

        public async Task<ApiResponse<ReservationResponseDto>> CancelReservationAsync(Guid reservationId, Guid currentUserId, string userRole)
        {
            using var dbTx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                var reservation = await _dbContext.Reservations
                    .Include(r => r.CustomerUser)
                    .Include(r => r.Pharmacy)
                    .Include(r => r.PharmacyInventory)
                        .ThenInclude(i => i.Medicine)
                    .FirstOrDefaultAsync(r => r.Id == reservationId);

                if (reservation == null)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Reservation not found.");
                }

                // Ownership / Authorization check
                if (userRole == "Customer" && reservation.CustomerUserId != currentUserId)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("You are not authorized to cancel this reservation.");
                }

                if (userRole == "Pharmacy" && reservation.Pharmacy.UserId != currentUserId)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("You are not authorized to cancel this reservation.");
                }

                if (reservation.Status == ReservationStatus.Fulfilled || reservation.Status == ReservationStatus.Cancelled || reservation.Status == ReservationStatus.Expired)
                {
                    return ApiResponse<ReservationResponseDto>.Fail($"Reservation cannot be cancelled in status '{reservation.Status}'.");
                }

                bool wasApproved = reservation.Status == ReservationStatus.Approved;
                reservation.Status = ReservationStatus.Cancelled;

                if (wasApproved && reservation.PharmacyInventory != null)
                {
                    // Release reserved quantity
                    reservation.PharmacyInventory.ReservedQuantity = Math.Max(0, reservation.PharmacyInventory.ReservedQuantity - reservation.QuantityRequested);
                    reservation.PharmacyInventory.LastStockUpdate = DateTime.UtcNow;

                    var tx = new InventoryTransaction
                    {
                        PharmacyInventoryId = reservation.PharmacyInventoryId,
                        Type = TransactionType.ReservationCancellation,
                        QuantityChange = 0,
                        NewQuantityOnHand = reservation.PharmacyInventory.QuantityOnHand,
                        NewReservedQuantity = reservation.PharmacyInventory.ReservedQuantity,
                        ReferenceNumber = reservation.ReservationCode,
                        Note = $"Reserved quantity released due to cancellation of #{reservation.ReservationCode}",
                        PerformedByUserId = currentUserId,
                        Timestamp = DateTime.UtcNow
                    };

                    await _dbContext.InventoryTransactions.AddAsync(tx);
                }

                await _dbContext.SaveChangesAsync();
                await dbTx.CommitAsync();

                return ApiResponse<ReservationResponseDto>.Ok(MapToReservationDto(reservation, reservation.CustomerUser, reservation.Pharmacy, reservation.PharmacyInventory), "Reservation cancelled.");
            }
            catch (Exception ex)
            {
                await dbTx.RollbackAsync();
                return ApiResponse<ReservationResponseDto>.Fail($"Failed to cancel reservation: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReservationResponseDto>> FulfillReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId)
        {
            using var dbTx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                var reservation = await _dbContext.Reservations
                    .Include(r => r.CustomerUser)
                    .Include(r => r.Pharmacy)
                    .Include(r => r.PharmacyInventory)
                        .ThenInclude(i => i.Medicine)
                    .FirstOrDefaultAsync(r => r.Id == reservationId && r.PharmacyId == pharmacyId);

                if (reservation == null)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Reservation not found.");
                }

                if (reservation.Status != ReservationStatus.Approved)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Only approved reservations can be marked as fulfilled.");
                }

                if (reservation.ExpiresAt.HasValue && reservation.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Cannot fulfill an expired reservation. Please cancel or update request.");
                }

                var inventory = reservation.PharmacyInventory;
                if (inventory == null)
                {
                    return ApiResponse<ReservationResponseDto>.Fail("Inventory record missing.");
                }

                // Safely reduce on-hand and reserved quantity
                inventory.QuantityOnHand = Math.Max(0, inventory.QuantityOnHand - reservation.QuantityRequested);
                inventory.ReservedQuantity = Math.Max(0, inventory.ReservedQuantity - reservation.QuantityRequested);
                inventory.LastStockUpdate = DateTime.UtcNow;

                reservation.Status = ReservationStatus.Fulfilled;
                reservation.CompletedAt = DateTime.UtcNow;

                var tx = new InventoryTransaction
                {
                    PharmacyInventoryId = inventory.Id,
                    Type = TransactionType.ReservationFulfillment,
                    QuantityChange = -reservation.QuantityRequested,
                    NewQuantityOnHand = inventory.QuantityOnHand,
                    NewReservedQuantity = inventory.ReservedQuantity,
                    ReferenceNumber = reservation.ReservationCode,
                    Note = $"Reservation #{reservation.ReservationCode} fulfilled to customer {reservation.CustomerUser?.FirstName} {reservation.CustomerUser?.LastName}",
                    PerformedByUserId = userId,
                    Timestamp = DateTime.UtcNow
                };

                await _dbContext.InventoryTransactions.AddAsync(tx);

                var notif = new Notification
                {
                    UserId = reservation.CustomerUserId,
                    Title = "Reservation Fulfilled",
                    Message = $"Thank you! Your medicine reservation #{reservation.ReservationCode} has been completed at {reservation.Pharmacy.Name}.",
                    Type = NotificationType.ReservationStatusUpdate,
                    TargetUrl = "/customer/reservations",
                    CreatedAt = DateTime.UtcNow
                };

                await _dbContext.Notifications.AddAsync(notif);
                await _dbContext.SaveChangesAsync();
                await dbTx.CommitAsync();

                return ApiResponse<ReservationResponseDto>.Ok(MapToReservationDto(reservation, reservation.CustomerUser, reservation.Pharmacy, inventory), "Reservation marked as fulfilled.");
            }
            catch (Exception ex)
            {
                await dbTx.RollbackAsync();
                return ApiResponse<ReservationResponseDto>.Fail($"Fulfillment error: {ex.Message}");
            }
        }

        public async Task CleanupExpiredReservationsAsync()
        {
            var now = DateTime.UtcNow;
            var expiredReservations = await _dbContext.Reservations
                .Include(r => r.PharmacyInventory)
                .Where(r => r.Status == ReservationStatus.Approved && r.ExpiresAt.HasValue && r.ExpiresAt.Value < now)
                .ToListAsync();

            if (!expiredReservations.Any())
            {
                return;
            }

            foreach (var res in expiredReservations)
            {
                res.Status = ReservationStatus.Expired;
                if (res.PharmacyInventory != null)
                {
                    res.PharmacyInventory.ReservedQuantity = Math.Max(0, res.PharmacyInventory.ReservedQuantity - res.QuantityRequested);
                    res.PharmacyInventory.LastStockUpdate = now;

                    var tx = new InventoryTransaction
                    {
                        PharmacyInventoryId = res.PharmacyInventoryId,
                        Type = TransactionType.ReservationExpiration,
                        QuantityChange = 0,
                        NewQuantityOnHand = res.PharmacyInventory.QuantityOnHand,
                        NewReservedQuantity = res.PharmacyInventory.ReservedQuantity,
                        ReferenceNumber = res.ReservationCode,
                        Note = $"System auto-expired reservation #{res.ReservationCode}. Reserved stock released.",
                        PerformedByUserId = res.CustomerUserId,
                        Timestamp = now
                    };
                    await _dbContext.InventoryTransactions.AddAsync(tx);
                }

                var notif = new Notification
                {
                    UserId = res.CustomerUserId,
                    Title = "Reservation Expired",
                    Message = $"Your reservation #{res.ReservationCode} expired automatically because it was not picked up in time.",
                    Type = NotificationType.ReservationStatusUpdate,
                    TargetUrl = "/customer/reservations",
                    CreatedAt = now
                };

                await _dbContext.Notifications.AddAsync(notif);
            }

            await _dbContext.SaveChangesAsync();
        }

        private static ReservationResponseDto MapToReservationDto(Reservation r, User? customer, Pharmacy? pharmacy, PharmacyInventory? inventory)
        {
            return new ReservationResponseDto
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                CustomerUserId = r.CustomerUserId,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : "",
                CustomerPhone = customer?.PhoneNumber ?? "",
                CustomerEmail = customer?.Email ?? "",
                PharmacyId = r.PharmacyId,
                PharmacyName = pharmacy?.Name ?? "",
                PharmacyAddress = pharmacy?.Address ?? "",
                PharmacyPhone = pharmacy?.ContactPhone ?? "",
                PharmacyInventoryId = r.PharmacyInventoryId,
                MedicineName = inventory?.Medicine?.Name ?? "",
                Strength = inventory?.Medicine?.Strength ?? "",
                QuantityRequested = r.QuantityRequested,
                TotalEstimatedPrice = r.TotalEstimatedPrice,
                Status = r.Status.ToString(),
                RejectionReason = r.RejectionReason,
                CustomerNote = r.CustomerNote,
                RequestedAt = r.RequestedAt,
                ApprovedAt = r.ApprovedAt,
                ExpiresAt = r.ExpiresAt,
                CompletedAt = r.CompletedAt
            };
        }
    }
}
