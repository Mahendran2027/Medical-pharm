using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Medicines;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IMedicineService
    {
        Task<ApiResponse<PagedResponse<MedicineResponseDto>>> GetMedicinesAsync(int page = 1, int pageSize = 10, Guid? categoryId = null, string? search = null);
        Task<ApiResponse<MedicineResponseDto>> GetMedicineByIdAsync(Guid medicineId);
        Task<ApiResponse<MedicineResponseDto>> CreateMedicineAsync(CreateMedicineDto dto);
        Task<ApiResponse<MedicineResponseDto>> UpdateMedicineAsync(Guid medicineId, UpdateMedicineDto dto);
        Task<ApiResponse<bool>> DeleteMedicineAsync(Guid medicineId);
        Task<ApiResponse<List<MedicineSearchResponseDto>>> SearchMedicinesWithStockAsync(string query, string? city = null, Guid? userId = null);
        Task<ApiResponse<List<MedicineCategoryDto>>> GetCategoriesAsync();
        Task<ApiResponse<MedicineCategoryDto>> CreateCategoryAsync(string name, string description);
    }

    public class MedicineCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MedicineCount { get; set; }
    }
}
