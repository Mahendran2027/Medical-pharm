using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Pharmacies;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class PharmacyService : IPharmacyService
    {
        private readonly ApplicationDbContext _dbContext;

        public PharmacyService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<PagedResponse<PharmacyResponseDto>>> GetApprovedPharmaciesAsync(int page = 1, int pageSize = 10, string? city = null, string? search = null)
        {
            var query = _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .Where(p => p.IsApproved && p.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(p => p.City.ToLower() == city.ToLower().Trim());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower().Trim();
                query = query.Where(p => p.Name.ToLower().Contains(term) || p.Address.ToLower().Contains(term) || p.City.ToLower().Contains(term));
            }

            int totalCount = await query.CountAsync();
            var pharmacies = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = pharmacies.Select(MapToPharmacyDto).ToList();
            var pagedResponse = new PagedResponse<PharmacyResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<PharmacyResponseDto>>.Ok(pagedResponse);
        }

        public async Task<ApiResponse<PharmacyResponseDto>> GetPharmacyByIdAsync(Guid pharmacyId)
        {
            var pharmacy = await _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.Id == pharmacyId);

            if (pharmacy == null)
            {
                return ApiResponse<PharmacyResponseDto>.Fail("Pharmacy not found.");
            }

            return ApiResponse<PharmacyResponseDto>.Ok(MapToPharmacyDto(pharmacy));
        }

        public async Task<ApiResponse<PharmacyResponseDto>> GetPharmacyByUserIdAsync(Guid userId)
        {
            var pharmacy = await _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (pharmacy == null)
            {
                return ApiResponse<PharmacyResponseDto>.Fail("Pharmacy profile not found for this user account.");
            }

            return ApiResponse<PharmacyResponseDto>.Ok(MapToPharmacyDto(pharmacy));
        }

        public async Task<ApiResponse<PharmacyResponseDto>> UpdatePharmacyProfileAsync(Guid userId, UpdatePharmacyDto dto)
        {
            var pharmacy = await _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (pharmacy == null)
            {
                return ApiResponse<PharmacyResponseDto>.Fail("Pharmacy not found.");
            }

            pharmacy.Name = dto.Name.Trim();
            pharmacy.Address = dto.Address.Trim();
            pharmacy.City = dto.City.Trim();
            pharmacy.State = dto.State.Trim();
            pharmacy.ZipCode = dto.ZipCode?.Trim() ?? string.Empty;
            pharmacy.Latitude = dto.Latitude;
            pharmacy.Longitude = dto.Longitude;
            pharmacy.ContactPhone = dto.ContactPhone.Trim();
            pharmacy.ContactEmail = dto.ContactEmail?.Trim() ?? string.Empty;
            pharmacy.OperatingHours = dto.OperatingHours?.Trim() ?? string.Empty;
            pharmacy.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<PharmacyResponseDto>.Ok(MapToPharmacyDto(pharmacy), "Pharmacy profile updated successfully.");
        }

        public async Task<ApiResponse<PharmacyResponseDto>> ApprovePharmacyAsync(Guid pharmacyId)
        {
            var pharmacy = await _dbContext.Pharmacies
                .Include(p => p.User)
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.Id == pharmacyId);

            if (pharmacy == null)
            {
                return ApiResponse<PharmacyResponseDto>.Fail("Pharmacy not found.");
            }

            pharmacy.IsApproved = true;
            pharmacy.IsActive = true;
            pharmacy.UpdatedAt = DateTime.UtcNow;

            // Notify user
            var notification = new Notification
            {
                UserId = pharmacy.UserId,
                Title = "Pharmacy Account Approved",
                Message = $"Congratulations! Your pharmacy account '{pharmacy.Name}' has been approved by the Administrator.",
                Type = NotificationType.AccountApproval,
                TargetUrl = "/pharmacy/dashboard",
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Notifications.AddAsync(notification);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<PharmacyResponseDto>.Ok(MapToPharmacyDto(pharmacy), "Pharmacy account approved successfully.");
        }

        public async Task<ApiResponse<PharmacyResponseDto>> DeactivatePharmacyAsync(Guid pharmacyId)
        {
            var pharmacy = await _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.Id == pharmacyId);

            if (pharmacy == null)
            {
                return ApiResponse<PharmacyResponseDto>.Fail("Pharmacy not found.");
            }

            pharmacy.IsActive = false;
            pharmacy.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<PharmacyResponseDto>.Ok(MapToPharmacyDto(pharmacy), "Pharmacy account deactivated.");
        }

        public async Task<ApiResponse<PagedResponse<PharmacyResponseDto>>> GetAllPharmaciesForAdminAsync(int page = 1, int pageSize = 10, bool? isApproved = null)
        {
            var query = _dbContext.Pharmacies
                .Include(p => p.Inventories)
                .AsQueryable();

            if (isApproved.HasValue)
            {
                query = query.Where(p => p.IsApproved == isApproved.Value);
            }

            int totalCount = await query.CountAsync();
            var pharmacies = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = pharmacies.Select(MapToPharmacyDto).ToList();
            var pagedResponse = new PagedResponse<PharmacyResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<PharmacyResponseDto>>.Ok(pagedResponse);
        }

        private static PharmacyResponseDto MapToPharmacyDto(Pharmacy p)
        {
            return new PharmacyResponseDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Name = p.Name,
                LicenseNumber = p.LicenseNumber,
                Address = p.Address,
                City = p.City,
                State = p.State,
                ZipCode = p.ZipCode,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                ContactPhone = p.ContactPhone,
                ContactEmail = p.ContactEmail,
                OperatingHours = p.OperatingHours,
                IsApproved = p.IsApproved,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                TotalInventoryItems = p.Inventories?.Count(i => i.IsActive) ?? 0
            };
        }
    }
}
