using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Medicines;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly ApplicationDbContext _dbContext;

        public MedicineService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<PagedResponse<MedicineResponseDto>>> GetMedicinesAsync(int page = 1, int pageSize = 10, Guid? categoryId = null, string? search = null)
        {
            var query = _dbContext.Medicines
                .Include(m => m.Category)
                .Where(m => m.IsActive)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower().Trim();
                query = query.Where(m =>
                    m.Name.ToLower().Contains(term) ||
                    m.GenericName.ToLower().Contains(term) ||
                    m.BrandName.ToLower().Contains(term) ||
                    m.Manufacturer.ToLower().Contains(term));
            }

            int totalCount = await query.CountAsync();
            var medicines = await query
                .OrderBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = medicines.Select(MapToMedicineDto).ToList();
            var pagedResponse = new PagedResponse<MedicineResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<MedicineResponseDto>>.Ok(pagedResponse);
        }

        public async Task<ApiResponse<MedicineResponseDto>> GetMedicineByIdAsync(Guid medicineId)
        {
            var medicine = await _dbContext.Medicines
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.Id == medicineId);

            if (medicine == null)
            {
                return ApiResponse<MedicineResponseDto>.Fail("Medicine not found.");
            }

            return ApiResponse<MedicineResponseDto>.Ok(MapToMedicineDto(medicine));
        }

        public async Task<ApiResponse<MedicineResponseDto>> CreateMedicineAsync(CreateMedicineDto dto)
        {
            var categoryExists = await _dbContext.MedicineCategories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
            {
                return ApiResponse<MedicineResponseDto>.Fail("Selected medicine category does not exist.");
            }

            var medicine = new Medicine
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                GenericName = dto.GenericName?.Trim() ?? string.Empty,
                BrandName = dto.BrandName?.Trim() ?? string.Empty,
                Manufacturer = dto.Manufacturer?.Trim() ?? string.Empty,
                DosageForm = dto.DosageForm.Trim(),
                Strength = dto.Strength.Trim(),
                Description = dto.Description?.Trim() ?? string.Empty,
                RequiresPrescription = dto.RequiresPrescription,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Medicines.AddAsync(medicine);
            await _dbContext.SaveChangesAsync();

            // Reload category navigation
            await _dbContext.Entry(medicine).Reference(m => m.Category).LoadAsync();

            return ApiResponse<MedicineResponseDto>.Ok(MapToMedicineDto(medicine), "Medicine created successfully.");
        }

        public async Task<ApiResponse<MedicineResponseDto>> UpdateMedicineAsync(Guid medicineId, UpdateMedicineDto dto)
        {
            var medicine = await _dbContext.Medicines
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.Id == medicineId);

            if (medicine == null)
            {
                return ApiResponse<MedicineResponseDto>.Fail("Medicine not found.");
            }

            var categoryExists = await _dbContext.MedicineCategories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
            {
                return ApiResponse<MedicineResponseDto>.Fail("Selected medicine category does not exist.");
            }

            medicine.CategoryId = dto.CategoryId;
            medicine.Name = dto.Name.Trim();
            medicine.GenericName = dto.GenericName?.Trim() ?? string.Empty;
            medicine.BrandName = dto.BrandName?.Trim() ?? string.Empty;
            medicine.Manufacturer = dto.Manufacturer?.Trim() ?? string.Empty;
            medicine.DosageForm = dto.DosageForm.Trim();
            medicine.Strength = dto.Strength.Trim();
            medicine.Description = dto.Description?.Trim() ?? string.Empty;
            medicine.RequiresPrescription = dto.RequiresPrescription;
            medicine.IsActive = dto.IsActive;
            medicine.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<MedicineResponseDto>.Ok(MapToMedicineDto(medicine), "Medicine details updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteMedicineAsync(Guid medicineId)
        {
            var medicine = await _dbContext.Medicines.FirstOrDefaultAsync(m => m.Id == medicineId);
            if (medicine == null)
            {
                return ApiResponse<bool>.Fail("Medicine not found.");
            }

            medicine.IsActive = false;
            medicine.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Medicine deactivated successfully.");
        }

        public async Task<ApiResponse<List<MedicineSearchResponseDto>>> SearchMedicinesWithStockAsync(string query, string? city = null, Guid? userId = null)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return ApiResponse<List<MedicineSearchResponseDto>>.Ok(new List<MedicineSearchResponseDto>());
            }

            var term = query.ToLower().Trim();

            // Record Search History for Drawback 6 Analytics
            var searchRecord = new SearchHistory
            {
                UserId = userId,
                SearchTerm = term,
                LocationFilter = city?.Trim() ?? string.Empty,
                Timestamp = DateTime.UtcNow
            };

            // Query medicines matching name, generic, or brand
            var matchingMedicines = await _dbContext.Medicines
                .Include(m => m.Category)
                .Include(m => m.Inventories)
                    .ThenInclude(i => i.Pharmacy)
                .Where(m => m.IsActive && (
                    m.Name.ToLower().Contains(term) ||
                    m.GenericName.ToLower().Contains(term) ||
                    m.BrandName.ToLower().Contains(term) ||
                    m.Category.Name.ToLower().Contains(term)
                ))
                .ToListAsync();

            searchRecord.ResultsCount = matchingMedicines.Count;
            await _dbContext.SearchHistories.AddAsync(searchRecord);
            await _dbContext.SaveChangesAsync();

            var searchResults = new List<MedicineSearchResponseDto>();

            foreach (var med in matchingMedicines)
            {
                // Filter inventories that are active, belonging to approved and active pharmacies, with positive available stock
                var inventoryQuery = med.Inventories
                    .Where(i => i.IsActive && i.Pharmacy != null && i.Pharmacy.IsApproved && i.Pharmacy.IsActive && i.AvailableQuantity > 0);

                if (!string.IsNullOrWhiteSpace(city))
                {
                    var cityTerm = city.ToLower().Trim();
                    inventoryQuery = inventoryQuery.Where(i => i.Pharmacy.City.ToLower().Contains(cityTerm));
                }

                var availablePharmacies = inventoryQuery.Select(i => new PharmacyStockAvailabilityDto
                {
                    PharmacyInventoryId = i.Id,
                    PharmacyId = i.Pharmacy.Id,
                    PharmacyName = i.Pharmacy.Name,
                    Address = i.Pharmacy.Address,
                    City = i.Pharmacy.City,
                    State = i.Pharmacy.State,
                    ContactPhone = i.Pharmacy.ContactPhone,
                    Latitude = i.Pharmacy.Latitude,
                    Longitude = i.Pharmacy.Longitude,
                    AvailableQuantity = i.AvailableQuantity,
                    UnitPrice = i.UnitPrice,
                    LastStockUpdate = i.LastStockUpdate,
                    IsLowStock = i.AvailableQuantity <= i.LowStockThreshold
                }).OrderByDescending(p => p.AvailableQuantity).ToList();

                searchResults.Add(new MedicineSearchResponseDto
                {
                    MedicineId = med.Id,
                    MedicineName = med.Name,
                    GenericName = med.GenericName,
                    BrandName = med.BrandName,
                    CategoryName = med.Category?.Name ?? "Uncategorized",
                    DosageForm = med.DosageForm,
                    Strength = med.Strength,
                    RequiresPrescription = med.RequiresPrescription,
                    AvailablePharmacies = availablePharmacies
                });
            }

            return ApiResponse<List<MedicineSearchResponseDto>>.Ok(searchResults);
        }

        public async Task<ApiResponse<List<MedicineCategoryDto>>> GetCategoriesAsync()
        {
            var categories = await _dbContext.MedicineCategories
                .Where(c => c.IsActive)
                .Select(c => new MedicineCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    MedicineCount = c.Medicines.Count(m => m.IsActive)
                })
                .OrderBy(c => c.Name)
                .ToListAsync();

            return ApiResponse<List<MedicineCategoryDto>>.Ok(categories);
        }

        public async Task<ApiResponse<MedicineCategoryDto>> CreateCategoryAsync(string name, string description)
        {
            var existing = await _dbContext.MedicineCategories.AnyAsync(c => c.Name.ToLower() == name.ToLower().Trim());
            if (existing)
            {
                return ApiResponse<MedicineCategoryDto>.Fail("Category name already exists.");
            }

            var category = new MedicineCategory
            {
                Name = name.Trim(),
                Description = description.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.MedicineCategories.AddAsync(category);
            await _dbContext.SaveChangesAsync();

            return ApiResponse<MedicineCategoryDto>.Ok(new MedicineCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                MedicineCount = 0
            }, "Category created.");
        }

        private static MedicineResponseDto MapToMedicineDto(Medicine m)
        {
            return new MedicineResponseDto
            {
                Id = m.Id,
                CategoryId = m.CategoryId,
                CategoryName = m.Category?.Name ?? string.Empty,
                Name = m.Name,
                GenericName = m.GenericName,
                BrandName = m.BrandName,
                Manufacturer = m.Manufacturer,
                DosageForm = m.DosageForm,
                Strength = m.Strength,
                Description = m.Description,
                RequiresPrescription = m.RequiresPrescription,
                IsActive = m.IsActive,
                CreatedAt = m.CreatedAt
            };
        }
    }
}
